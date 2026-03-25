import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignatureScreen from 'react-native-signature-canvas';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Network from 'expo-network';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { captureRef } from 'react-native-view-shot';
import { reverseGeocode, getCurrentLocation } from '@/utils/location';
import { pickImageFromGallery, takePhotoWithCamera } from '@/utils/image';
import {
  ChecklistStatus,
  FieldReportDraft,
  FieldReportPhoto,
  useAppHydration,
  useAppStore,
} from '@/stores/use-app-store';
import { trackFieldReportCreated, trackFieldReportSynced } from '@/utils/analytics';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const EXPO_EXTRA = (Constants.expoConfig?.extra ?? {}) as {
  sarvamApiKey?: string;
  sarvamSttEndpoint?: string;
};
const SARVAM_API_KEY = EXPO_EXTRA.sarvamApiKey?.trim() ?? '';
const SARVAM_STT_ENDPOINT =
  EXPO_EXTRA.sarvamSttEndpoint?.trim() ?? 'https://api.sarvam.ai/speech-to-text';

const TOTAL_STEPS = 5;

const createLeafletHtml = (latitude: number, longitude: number, draggable: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${latitude}, ${longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([${latitude}, ${longitude}], { draggable: ${draggable} }).addTo(map);

    const postLocation = (latlng) => {
      const payload = JSON.stringify({ latitude: latlng.lat, longitude: latlng.lng });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
      }
    };

    ${draggable ? "marker.on('dragend', () => { const position = marker.getLatLng(); postLocation(position); });" : ''}
  </script>
</body>
</html>
`;

const isPhoneValid = (value: string) => /^\+?[\d\s()-]{7,20}$/.test(value.trim());

const getVoiceToTextWeb = async (): Promise<string | null> => {
  if (Platform.OS !== 'web') return null;

  const WebSpeech = (globalThis as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
    .SpeechRecognition ?? (globalThis as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!WebSpeech) {
    Alert.alert('Voice to text', 'Speech recognition is not available in this browser.');
    return null;
  }

  return new Promise((resolve) => {
    const recognition = new WebSpeech();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      resolve(event.results?.[0]?.[0]?.transcript ?? null);
    };
    recognition.onerror = () => resolve(null);
    recognition.onend = () => {};
    recognition.start();
  });
};

const transcribeWithSarvam = async (audioUri: string): Promise<string | null> => {
  if (!SARVAM_API_KEY) {
    return null;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: `field-report-${Date.now()}.m4a`,
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('model', 'saarika:v2');

  try {
    const response = await fetch(SARVAM_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Record<string, any>;
    return payload.transcript ?? payload.text ?? payload.data?.transcript ?? null;
  } catch {
    return null;
  }
};

const updateStep = (
  draft: FieldReportDraft,
  updateFieldReportDraft: (changes: Partial<FieldReportDraft>) => void,
  nextStep: number,
) => {
  const boundedStep = Math.min(TOTAL_STEPS, Math.max(1, nextStep)) as FieldReportDraft['currentStep'];
  if (draft.currentStep !== boundedStep) {
    updateFieldReportDraft({ currentStep: boundedStep });
  }
};

export default function FieldReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId: string }>();
  const taskId = params.taskId;
  const signatureRef = useRef<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const watermarkCaptureRef = useRef<View | null>(null);
  const watermarkResolveRef = useRef<((uri: string) => void) | null>(null);
  const watermarkRejectRef = useRef<((error: Error) => void) | null>(null);
  const { hasHydrated } = useAppHydration();
  const {
    tasks,
    fieldReports,
    fieldReportDraft,
    isAuthenticated,
    startFieldReportDraft,
    updateFieldReportDraft,
    updateDraftChecklistItem,
    addDraftPhoto,
    updateDraftPhotoCaption,
    removeDraftPhoto,
    submitFieldReportFromDraft,
    markPendingReportsSynced,
  } = useAppStore();

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);
  const draft = fieldReportDraft?.taskId === taskId ? fieldReportDraft : null;
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [watermarkJob, setWatermarkJob] = useState<{ sourceUri: string; watermarkText: string } | null>(null);
  const [watermarkImageLoaded, setWatermarkImageLoaded] = useState(false);

  const pendingReportsCount = useMemo(
    () => fieldReports.filter((report) => report.syncStatus === 'pending').length,
    [fieldReports],
  );

  useEffect(() => {
    if (!taskId) return;
    startFieldReportDraft(taskId);
  }, [startFieldReportDraft, taskId]);

  useEffect(() => {
    const checkConnectivity = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    };

    void checkConnectivity();
    const timer = setInterval(() => {
      void checkConnectivity();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!draft || draft.location || isCapturingLocation) {
      return;
    }

    const capture = async () => {
      setIsCapturingLocation(true);
      try {
        const location = await getCurrentLocation();
        if (!location) {
          Alert.alert('Location unavailable', 'Unable to capture GPS location for this report.');
          return;
        }

        updateFieldReportDraft({
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            address: location.address,
          },
        });
      } finally {
        setIsCapturingLocation(false);
      }
    };

    void capture();
  }, [draft, isCapturingLocation, updateFieldReportDraft]);

  useEffect(() => {
    if (!watermarkJob || !watermarkImageLoaded || !watermarkCaptureRef.current) {
      return;
    }

    const runCapture = async () => {
      try {
        const capturedUri = await captureRef(watermarkCaptureRef, {
          format: 'jpg',
          quality: 0.92,
        });
        const compressed = await ImageManipulator.manipulateAsync(
          capturedUri,
          [],
          {
            compress: 0.85,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );
        watermarkResolveRef.current?.(compressed.uri);
      } catch (error) {
        watermarkRejectRef.current?.(error as Error);
      } finally {
        watermarkResolveRef.current = null;
        watermarkRejectRef.current = null;
        setWatermarkImageLoaded(false);
        setWatermarkJob(null);
      }
    };

    void runCapture();
  }, [watermarkJob, watermarkImageLoaded]);

  useEffect(() => {
    if (!isOnline || pendingReportsCount === 0 || isSyncing) {
      return;
    }

    let cancelled = false;
    const countToSync = pendingReportsCount;

    const autoSync = async () => {
      setIsSyncing(true);
      try {
        markPendingReportsSynced();
        trackFieldReportSynced(countToSync);
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    };

    void autoSync();

    return () => {
      cancelled = true;
    };
  }, [isOnline, pendingReportsCount, isSyncing, markPendingReportsSynced]);

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="mt-2 text-sm text-[#64748b]">Loading report form...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!task || !draft) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc] px-6">
        <MaterialCommunityIcons name="alert-circle" size={44} color="#94a3b8" />
        <Text className="mt-2 text-base font-semibold text-[#0f172a]">Task not found</Text>
      </View>
    );
  }

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    if (draft.currentStep === 1) {
      if (!draft.siteName.trim()) errors.siteName = 'Site name is required.';
      if (!draft.contactPersonName.trim()) errors.contactPersonName = 'Contact person is required.';
      if (!draft.contactPhone.trim()) errors.contactPhone = 'Contact phone is required.';
      if (draft.contactPhone.trim() && !isPhoneValid(draft.contactPhone)) errors.contactPhone = 'Invalid phone number.';
      if (!draft.location) errors.location = 'Location is required.';
    }

    if (draft.currentStep === 2) {
      const invalidFailItem = draft.checklist.find((item) => item.status === 'fail' && !item.failReason?.trim());
      if (invalidFailItem) {
        errors[`failReason-${invalidFailItem.id}`] = 'Fail reason is required.';
      }
    }

    if (draft.currentStep === 3) {
      if (draft.photos.length === 0) {
        errors.photos = 'At least one photo is required.';
      }
      const emptyCaption = draft.photos.find((photo) => !photo.caption.trim());
      if (emptyCaption) {
        errors.photoCaption = 'Every photo needs a caption.';
      }
    }

    if (draft.currentStep === 4) {
      if (!draft.customerName.trim()) errors.customerName = 'Customer name is required.';
      if (!draft.signatureBase64.trim()) errors.signature = 'Customer signature is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (draft.currentStep < TOTAL_STEPS) {
      updateStep(draft, updateFieldReportDraft, draft.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (draft.currentStep === 1) {
      router.back();
      return;
    }

    updateStep(draft, updateFieldReportDraft, draft.currentStep - 1);
  };

  const handleLocationDragged = async (coords: Coordinates) => {
    setIsResolvingAddress(true);
    try {
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      updateFieldReportDraft({
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
          address,
        },
      });
      if (fieldErrors.location) {
        setFieldErrors((prev) => ({ ...prev, location: '' }));
      }
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const appendVoiceToObservation = async () => {
    let transcript: string | null = null;

    if (Platform.OS === 'web') {
      transcript = await getVoiceToTextWeb();
    } else {
      if (!SARVAM_API_KEY) {
        Alert.alert(
          'Voice to text unavailable',
          'Set expo.extra.sarvamApiKey in app.json to enable native transcription.',
        );
        return;
      }

      try {
        if (!isRecordingVoice) {
          const permission = await Audio.requestPermissionsAsync();
          if (permission.status !== 'granted') {
            Alert.alert('Permission required', 'Microphone permission is required for voice input.');
            return;
          }

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          await recording.startAsync();
          recordingRef.current = recording;
          setIsRecordingVoice(true);
          Alert.alert('Recording started', 'Tap Voice to text again to stop and transcribe.');
          return;
        }

        setIsTranscribing(true);
        setIsRecordingVoice(false);

        const activeRecording = recordingRef.current;
        if (!activeRecording) {
          return;
        }

        await activeRecording.stopAndUnloadAsync();
        recordingRef.current = null;
        const uri = activeRecording.getURI();

        if (!uri) {
          Alert.alert('Voice to text', 'No audio captured. Please try again.');
          return;
        }

        transcript = await transcribeWithSarvam(uri);
      } finally {
        setIsTranscribing(false);
      }
    }

    if (!transcript) return;
    const prefix = draft.observations.trim() ? `${draft.observations.trim()}\n` : '';
    updateFieldReportDraft({ observations: `${prefix}${transcript}` });
  };

  const createWatermarkedImage = async (sourceUri: string, watermarkText: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      watermarkResolveRef.current = resolve;
      watermarkRejectRef.current = reject;
      setWatermarkImageLoaded(false);
      setWatermarkJob({ sourceUri, watermarkText });
    });
  };

  const addPhoto = async (source: 'camera' | 'gallery') => {
    if (!draft.location) {
      Alert.alert('Location required', 'Capture location first before adding photo evidence.');
      return;
    }
    if (draft.photos.length >= 5) {
      Alert.alert('Limit reached', 'Maximum 5 photos are allowed.');
      return;
    }

    const uri = source === 'camera' ? await takePhotoWithCamera() : await pickImageFromGallery();
    if (!uri) return;

    const watermarkText = `${new Date().toLocaleString()} | ${draft.location.address ?? `${draft.location.latitude.toFixed(4)}, ${draft.location.longitude.toFixed(4)}`}`;
    let watermarkedUri: string;
    try {
      watermarkedUri = await createWatermarkedImage(uri, watermarkText);
    } catch {
      Alert.alert('Error', 'Failed to process photo. Try again.');
      return;
    }

    addDraftPhoto({
      uri: watermarkedUri,
      caption: '',
      watermarkText,
    });
  };

  const submitReport = () => {
    if (!validateCurrentStep()) return;

    const created = submitFieldReportFromDraft();
    if (!created) {
      Alert.alert('Unable to submit', 'Missing required report fields.');
      return;
    }

    const failedCount = created.checklist.filter((item) => item.status === 'fail').length;
    trackFieldReportCreated(created.taskId, failedCount, created.photos.length);

    Alert.alert('Report submitted', 'Field report submitted and task marked as completed.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const performSync = async (showAlerts: boolean) => {
    if (isSyncing) {
      return;
    }

    if (!isOnline) {
      if (showAlerts) {
        Alert.alert('Offline', 'Connect to internet to sync pending reports.');
      }
      return;
    }

    if (pendingReportsCount === 0) {
      if (showAlerts) {
        Alert.alert('No pending reports', 'All reports are already synced.');
      }
      return;
    }

    const countToSync = pendingReportsCount;
    setIsSyncing(true);
    try {
      markPendingReportsSynced();
      trackFieldReportSynced(countToSync);
      if (showAlerts) {
        Alert.alert('Synced', `${countToSync} report(s) synced successfully.`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNow = async () => {
    await performSync(true);
  };

  const renderChecklistItem = (item: FieldReportDraft['checklist'][number]) => (
    <View key={item.id} className="mb-3 rounded-lg border border-[#dbe4ee] bg-white p-3">
      <Text className="text-sm font-semibold text-[#0f172a]">{item.label}</Text>
      <View className="mt-2 flex-row gap-2">
        {(['pass', 'fail', 'na'] as ChecklistStatus[]).map((status) => (
          <Pressable
            key={status}
            onPress={() => updateDraftChecklistItem(item.id, status, item.failReason ?? '')}
            className={`flex-1 items-center rounded-lg border px-2 py-2 ${
              item.status === status ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#cbd5e1] bg-white'
            }`}>
            <Text className={`text-xs font-semibold uppercase ${item.status === status ? 'text-white' : 'text-[#334155]'}`}>
              {status}
            </Text>
          </Pressable>
        ))}
      </View>
      {item.status === 'fail' ? (
        <>
          <TextInput
            value={item.failReason ?? ''}
            onChangeText={(value) => updateDraftChecklistItem(item.id, 'fail', value)}
            placeholder="Reason for failure"
            placeholderTextColor="#94a3b8"
            className={`mt-2 rounded-lg border px-3 py-2 text-sm text-[#0f172a] ${
              fieldErrors[`failReason-${item.id}`] ? 'border-[#dc2626]' : 'border-[#cbd5e1]'
            }`}
          />
          {fieldErrors[`failReason-${item.id}`] ? (
            <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors[`failReason-${item.id}`]}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      className="flex-1 bg-[#f8fafc]">
      <SafeAreaView className="flex-1 bg-[#f8fafc]">
        <Stack.Screen options={{ title: 'Create Field Report' }} />

        <View className="border-b border-[#e2e8f0] px-4 py-3">
          <Text className="text-xl font-bold text-[#0f172a]">Create Field Report</Text>
          <Text className="mt-1 text-sm text-[#64748b]">Task: {task.title}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={`text-xs font-semibold ${pendingReportsCount > 0 ? 'text-[#b45309]' : 'text-[#166534]'}`}>
              {pendingReportsCount > 0 ? `${pendingReportsCount} pending sync` : 'All reports synced'}
            </Text>
            <Pressable
              disabled={!isOnline || isSyncing}
              onPress={syncNow}
              className={`rounded-md px-3 py-1.5 ${isOnline ? 'bg-[#0f766e]' : 'bg-[#94a3b8]'}`}>
              <Text className="text-xs font-semibold text-white">{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
            </Pressable>
          </View>
        </View>

        <View className="px-4 py-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              Step {draft.currentStep} of {TOTAL_STEPS}
            </Text>
            <Text className="text-xs text-[#64748b]">{['Site', 'Checklist', 'Photos', 'Signature', 'Review'][draft.currentStep - 1]}</Text>
          </View>
          <View className="h-2 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
            <View className="h-full rounded-full bg-[#0f766e]" style={{ width: `${(draft.currentStep / TOTAL_STEPS) * 100}%` }} />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          scrollEnabled={!isSigning}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 18 }}>
          {draft.currentStep === 1 ? (
            <>
              <Text className="text-base font-semibold text-[#0f172a]">Step 1: Site Details</Text>
              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="mb-1 text-xs font-semibold text-[#334155]">Site Name</Text>
                <TextInput
                  value={draft.siteName}
                  onChangeText={(value) => updateFieldReportDraft({ siteName: value })}
                  placeholder="Site name"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-lg border px-3 py-2.5 text-base text-[#0f172a] ${fieldErrors.siteName ? 'border-[#dc2626]' : 'border-[#cbd5e1]'}`}
                />
                {fieldErrors.siteName ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.siteName}</Text> : null}

                <Text className="mb-1 mt-3 text-xs font-semibold text-[#334155]">Contact Person Name</Text>
                <TextInput
                  value={draft.contactPersonName}
                  onChangeText={(value) => updateFieldReportDraft({ contactPersonName: value })}
                  placeholder="Contact person"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-lg border px-3 py-2.5 text-base text-[#0f172a] ${fieldErrors.contactPersonName ? 'border-[#dc2626]' : 'border-[#cbd5e1]'}`}
                />
                {fieldErrors.contactPersonName ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.contactPersonName}</Text> : null}

                <Text className="mb-1 mt-3 text-xs font-semibold text-[#334155]">Contact Phone</Text>
                <TextInput
                  value={draft.contactPhone}
                  onChangeText={(value) => updateFieldReportDraft({ contactPhone: value })}
                  placeholder="+1 555 123 4567"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className={`rounded-lg border px-3 py-2.5 text-base text-[#0f172a] ${fieldErrors.contactPhone ? 'border-[#dc2626]' : 'border-[#cbd5e1]'}`}
                />
                {fieldErrors.contactPhone ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.contactPhone}</Text> : null}
              </View>

              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#334155]">Location (drag marker to adjust)</Text>
                  {(isResolvingAddress || isCapturingLocation) ? <ActivityIndicator size="small" color="#0f766e" /> : null}
                </View>
                {draft.location ? (
                  <View className="h-[180px] overflow-hidden rounded-lg border border-[#dbe4ee]">
                    <WebView
                      source={{ html: createLeafletHtml(draft.location.latitude, draft.location.longitude, true) }}
                      onMessage={(event) => {
                        try {
                          const data = JSON.parse(event.nativeEvent.data) as Coordinates;
                          if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return;
                          void handleLocationDragged(data);
                        } catch {
                          // ignore malformed payload
                        }
                      }}
                      scrollEnabled={false}
                      javaScriptEnabled
                      domStorageEnabled
                    />
                  </View>
                ) : (
                  <View className="h-[180px] items-center justify-center rounded-lg bg-[#f1f5f9]">
                    <Text className="text-sm text-[#64748b]">Capturing GPS location...</Text>
                  </View>
                )}
                <View className="mt-2 rounded-lg bg-[#f8fafc] p-2.5">
                  <Text className="text-xs text-[#334155]">{draft.location?.address ?? 'No address available yet.'}</Text>
                </View>
                {fieldErrors.location ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.location}</Text> : null}
              </View>
            </>
          ) : null}

          {draft.currentStep === 2 ? (
            <>
              <Text className="text-base font-semibold text-[#0f172a]">Step 2: Checklist & Observations</Text>
              <Text className="mt-1 text-sm text-[#64748b]">Mark each checklist item as Pass, Fail, or N/A.</Text>
              <View className="mt-3">{draft.checklist.map((item) => renderChecklistItem(item))}</View>

              <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
                <View className="mb-1 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-[#334155]">Observations</Text>
                  <Pressable
                    onPress={appendVoiceToObservation}
                    disabled={isTranscribing}
                    className={`rounded-md px-2.5 py-1.5 ${isRecordingVoice ? 'bg-[#fde68a]' : 'bg-[#e0f2fe]'}`}>
                    <Text className="text-xs font-semibold text-[#0369a1]">
                      {isTranscribing ? 'Transcribing...' : isRecordingVoice ? 'Stop Recording' : 'Voice to text'}
                    </Text>
                  </Pressable>
                </View>
                <TextInput
                  value={draft.observations}
                  onChangeText={(value) => updateFieldReportDraft({ observations: value })}
                  placeholder="Type field observations..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[110px] rounded-lg border border-[#cbd5e1] px-3 py-2.5 text-sm text-[#0f172a]"
                />
              </View>
            </>
          ) : null}

          {draft.currentStep === 3 ? (
            <>
              <Text className="text-base font-semibold text-[#0f172a]">Step 3: Photo Evidence</Text>
              <Text className="mt-1 text-sm text-[#64748b]">Add up to 5 photos with captions and watermark metadata.</Text>
              <View className="mt-3 flex-row gap-2">
                <Pressable onPress={() => void addPhoto('camera')} className="flex-1 items-center rounded-lg bg-[#0f766e] py-2.5">
                  <Text className="text-sm font-semibold text-white">Camera</Text>
                </Pressable>
                <Pressable onPress={() => void addPhoto('gallery')} className="flex-1 items-center rounded-lg border border-[#0f766e] py-2.5">
                  <Text className="text-sm font-semibold text-[#0f766e]">Gallery</Text>
                </Pressable>
              </View>

              {fieldErrors.photos ? <Text className="mt-2 text-xs text-[#dc2626]">{fieldErrors.photos}</Text> : null}
              {fieldErrors.photoCaption ? <Text className="mt-2 text-xs text-[#dc2626]">{fieldErrors.photoCaption}</Text> : null}

              <View className="mt-3 flex-row flex-wrap justify-between">
                {draft.photos.map((photo: FieldReportPhoto) => (
                  <View key={photo.id} className="mb-3 w-[48%] rounded-lg border border-[#dbe4ee] bg-white p-2">
                    <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 110, borderRadius: 8 }} />
                    <TextInput
                      value={photo.caption}
                      onChangeText={(value) => updateDraftPhotoCaption(photo.id, value)}
                      placeholder="Caption"
                      placeholderTextColor="#94a3b8"
                      className="mt-2 rounded-md border border-[#cbd5e1] px-2 py-2 text-xs text-[#0f172a]"
                    />
                    <Text className="mt-1 text-[10px] text-[#64748b]" numberOfLines={2}>{photo.watermarkText}</Text>
                    <View className="mt-2 flex-row gap-2">
                      <Pressable onPress={() => removeDraftPhoto(photo.id)} className="flex-1 items-center rounded-md bg-[#dc2626] py-1.5">
                        <Text className="text-xs font-semibold text-white">Delete</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          removeDraftPhoto(photo.id);
                          void addPhoto('camera');
                        }}
                        className="flex-1 items-center rounded-md border border-[#0f766e] py-1.5">
                        <Text className="text-xs font-semibold text-[#0f766e]">Retake</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {draft.currentStep === 4 ? (
            <>
              <Text className="text-base font-semibold text-[#0f172a]">Step 4: Customer Signature</Text>
              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="mb-1 text-xs font-semibold text-[#334155]">Customer Name</Text>
                <TextInput
                  value={draft.customerName}
                  onChangeText={(value) => updateFieldReportDraft({ customerName: value })}
                  placeholder="Customer name"
                  placeholderTextColor="#94a3b8"
                  className={`rounded-lg border px-3 py-2.5 text-base text-[#0f172a] ${fieldErrors.customerName ? 'border-[#dc2626]' : 'border-[#cbd5e1]'}`}
                />
                {fieldErrors.customerName ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.customerName}</Text> : null}

                <Text className="mb-1 mt-3 text-xs font-semibold text-[#334155]">Signature</Text>
                <View className="h-[220px] overflow-hidden rounded-lg border border-[#cbd5e1]">
                  <SignatureScreen
                    ref={signatureRef}
                    onOK={(signature) => updateFieldReportDraft({ signatureBase64: signature })}
                    onEmpty={() => updateFieldReportDraft({ signatureBase64: '' })}
                    onBegin={() => setIsSigning(true)}
                    onEnd={() => {
                      setIsSigning(false);
                      signatureRef.current?.readSignature?.();
                    }}
                    onClear={() => updateFieldReportDraft({ signatureBase64: '' })}
                    descriptionText="Sign above"
                    clearText="Clear"
                    confirmText="Save"
                    webviewProps={{
                      scrollEnabled: false,
                      overScrollMode: 'never',
                      bounces: false,
                      androidLayerType: 'hardware',
                    }}
                    webStyle={`
                      .m-signature-pad { box-shadow: none; border: none; }
                      .m-signature-pad--body { border: none; }
                      .m-signature-pad--footer { display: flex; }
                      html, body {
                        width: 100%;
                        height: 100%;
                        overscroll-behavior: contain;
                        touch-action: none;
                      }
                    `}
                  />
                </View>
                {fieldErrors.signature ? <Text className="mt-1 text-xs text-[#dc2626]">{fieldErrors.signature}</Text> : null}
              </View>
            </>
          ) : null}

          {draft.currentStep === 5 ? (
            <>
              <Text className="text-base font-semibold text-[#0f172a]">Step 5: Review & Submit</Text>

              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="text-sm font-semibold text-[#0f172a]">Site Details</Text>
                <Text className="mt-1 text-xs text-[#334155]">Site: {draft.siteName}</Text>
                <Text className="mt-1 text-xs text-[#334155]">Contact: {draft.contactPersonName} ({draft.contactPhone})</Text>
                {draft.location ? (
                  <View className="mt-2 h-[120px] overflow-hidden rounded-lg border border-[#dbe4ee]">
                    <WebView source={{ html: createLeafletHtml(draft.location.latitude, draft.location.longitude, false) }} scrollEnabled={false} />
                  </View>
                ) : null}
              </View>

              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="text-sm font-semibold text-[#0f172a]">Checklist</Text>
                {draft.checklist.map((item) => (
                  <Text key={item.id} className="mt-1 text-xs text-[#334155]">
                    {item.label}: {item.status.toUpperCase()} {item.status === 'fail' && item.failReason ? `- ${item.failReason}` : ''}
                  </Text>
                ))}
                <Text className="mt-2 text-xs text-[#334155]">Observations: {draft.observations || 'None'}</Text>
              </View>

              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="text-sm font-semibold text-[#0f172a]">Photo Evidence</Text>
                <View className="mt-2 flex-row flex-wrap justify-between">
                  {draft.photos.map((photo) => (
                    <Image key={photo.id} source={{ uri: photo.uri }} style={{ width: '32%', height: 78, marginBottom: 8, borderRadius: 8 }} />
                  ))}
                </View>
              </View>

              <View className="mt-3 rounded-xl border border-[#dbe4ee] bg-white p-3">
                <Text className="text-sm font-semibold text-[#0f172a]">Customer Signature</Text>
                <Text className="mt-1 text-xs text-[#334155]">{draft.customerName}</Text>
                {draft.signatureBase64 ? (
                  <Image source={{ uri: draft.signatureBase64 }} style={{ width: '100%', height: 120, marginTop: 8 }} resizeMode="contain" />
                ) : (
                  <Text className="mt-2 text-xs text-[#dc2626]">No signature captured.</Text>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-[#e2e8f0] bg-white px-4 py-3">
          <Pressable onPress={handleBack} className="flex-1 items-center rounded-lg border border-[#cbd5e1] py-3">
            <Text className="text-sm font-semibold text-[#334155]">Back</Text>
          </Pressable>
          <Pressable
            onPress={draft.currentStep === 5 ? submitReport : handleNext}
            className="flex-1 items-center rounded-lg bg-[#0f766e] py-3">
            <Text className="text-sm font-semibold text-white">{draft.currentStep === 5 ? 'Submit Report' : 'Next'}</Text>
          </Pressable>
        </View>

        {watermarkJob ? (
          <View
            ref={watermarkCaptureRef}
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -2000,
              left: -2000,
              width: 1024,
              height: 768,
              backgroundColor: '#000',
              padding: 0,
            }}>
            <Image
              source={{ uri: watermarkJob.sourceUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onLoadEnd={() => setWatermarkImageLoaded(true)}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 14,
                left: 14,
                right: 14,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 8,
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{watermarkJob.watermarkText}</Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}