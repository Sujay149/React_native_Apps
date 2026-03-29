import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';

import { useAppHydration, useAppStore, TaskPriority, TaskStatus } from '@/stores/use-app-store';
import { getCurrentLocation } from '@/utils/location';
import { pickImageFromGallery, takePhotoWithCamera } from '@/utils/image';
import { trackLocationAdded, trackPhotoAttached, trackTaskModified } from '@/utils/analytics';
import { theme } from '@/constants/theme';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: theme.colors.danger, bg: theme.colors.dangerSoft },
  medium: { label: 'Medium', color: theme.colors.warning, bg: theme.colors.warningSoft },
  low: { label: 'Low', color: theme.colors.success, bg: theme.colors.successSoft },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  open: { label: 'Open', color: theme.colors.info, bg: theme.colors.primarySoft, icon: 'circle-outline' },
  'in-progress': { label: 'In Progress', color: theme.colors.warning, bg: theme.colors.warningSoft, icon: 'progress-clock' },
  completed: { label: 'Completed', color: theme.colors.success, bg: theme.colors.successSoft, icon: 'check-circle' },
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;
  const { hasHydrated } = useAppHydration();
  const {
    tasks,
    fieldReports,
    isAuthenticated,
    updateTask,
    deleteTask,
    addPhotoToTask,
    removePhotoFromTask,
    updateTaskLocation,
  } = useAppStore();

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);
  const taskReports = useMemo(() => fieldReports.filter((report) => report.taskId === taskId), [fieldReports, taskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [titleTouched, setTitleTouched] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleRef = useRef<TextInput | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!task) {
      return;
    }
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);

    const timer = setTimeout(() => titleRef.current?.focus(), 140);
    return () => clearTimeout(timer);
  }, [task]);

  const titleError = titleTouched && title.trim().length === 0 ? 'Task title is required.' : '';
  const hasChanges =
    !!task &&
    (task.title !== title.trim() || task.description !== description.trim() || task.priority !== priority || task.status !== status);
  const canSave = title.trim().length > 0 && hasChanges;

  const handleSave = () => {
    if (!task) return;
    setTitleTouched(true);
    if (title.trim().length === 0) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const modifiedFields: string[] = [];

    if (task.title !== trimmedTitle) modifiedFields.push('title');
    if (task.description !== trimmedDescription) modifiedFields.push('description');
    if (task.priority !== priority) modifiedFields.push('priority');
    if (task.status !== status) modifiedFields.push('status');

    updateTask(taskId, {
      title: trimmedTitle,
      description: trimmedDescription,
      priority,
      status,
    });

    if (modifiedFields.length > 0) {
      trackTaskModified(taskId, modifiedFields);
    }

    router.back();
  };

  const handleTakePhoto = async () => {
    const photoUri = await takePhotoWithCamera();
    if (photoUri) {
      addPhotoToTask(taskId, photoUri);
      trackPhotoAttached(taskId, (task?.photos.length || 0) + 1);
    }
    setShowPhotoModal(false);
  };

  const handlePickPhoto = async () => {
    const photoUri = await pickImageFromGallery();
    if (photoUri) {
      addPhotoToTask(taskId, photoUri);
      trackPhotoAttached(taskId, (task?.photos.length || 0) + 1);
    }
    setShowPhotoModal(false);
  };

  const handleAddLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        updateTaskLocation(taskId, {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
          address: location.address,
        });
        trackLocationAdded(taskId, location.latitude, location.longitude);
        Alert.alert('Location added', location.address ?? 'Location captured successfully.');
      } else {
        Alert.alert('Location unavailable', 'Could not get location. Please enable location services.');
      }
    } catch {
      Alert.alert('Error', 'Failed to get location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remove photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePhotoFromTask(taskId, index) },
    ]);
  };

  const handleDeleteTask = () => {
    Alert.alert('Delete task', 'This action cannot be undone. Delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(taskId);
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const handleCreateFieldReport = () => {
    router.push({ pathname: '/task/field-report', params: { taskId } });
  };

  const openReport = (reportId: string) => {
    router.push({ pathname: '/task/report/[reportId]', params: { reportId } });
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Loading task...</Text>
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/login" />;

  if (!task) {
    return (
      <View style={styles.loader}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.textMuted} />
        <Text style={styles.loaderText}>Task not found.</Text>
      </View>
    );
  }

  const pCfg = PRIORITY_CONFIG[priority];
  const sCfg = STATUS_CONFIG[status];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <Animated.View style={[styles.root, { opacity: fadeAnim }]}> 
          <SafeAreaView style={styles.root}>
            <View style={styles.navBar}>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={theme.colors.textPrimary} />
              </Pressable>
              <Text style={styles.navTitle}>Task Detail</Text>
              <Pressable onPress={handleDeleteTask} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.danger} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <LinearGradient colors={[theme.colors.primarySoft, theme.colors.surface]} style={styles.heroCard}>
                <Text style={styles.taskHeroTitle}>{task.title}</Text>
                <Text style={styles.taskHeroDescription}>{task.description || 'No description provided.'}</Text>

                <View style={styles.metaRow}>
                  <View style={[styles.metaBadge, { backgroundColor: sCfg.bg }]}> 
                    <MaterialCommunityIcons name={sCfg.icon} size={14} color={sCfg.color} />
                    <Text style={[styles.metaBadgeText, { color: sCfg.color }]}>{sCfg.label}</Text>
                  </View>
                  <View style={[styles.metaBadge, { backgroundColor: pCfg.bg }]}> 
                    <MaterialCommunityIcons name="flag" size={14} color={pCfg.color} />
                    <Text style={[styles.metaBadgeText, { color: pCfg.color }]}>{pCfg.label}</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Edit Task</Text>

                <View style={[styles.inputWrap, titleError ? styles.inputWrapError : null]}>
                  <Text style={[styles.inputLabel, title.length > 0 && styles.inputLabelActive]}>Title *</Text>
                  <TextInput
                    ref={titleRef}
                    value={title}
                    onChangeText={(value) => {
                      setTitle(value);
                      if (!titleTouched) {
                        setTitleTouched(true);
                      }
                    }}
                    onBlur={() => setTitleTouched(true)}
                    style={styles.input}
                    placeholder={title.length > 0 ? '' : 'Task title'}
                    placeholderTextColor={theme.colors.textMuted}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                  />
                </View>
                {titleError ? <Text style={styles.inputErrorText}>{titleError}</Text> : null}

                <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
                  <Text style={[styles.inputLabel, description.length > 0 && styles.inputLabelActive]}>Description</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.input, styles.inputMultiline]}
                    placeholder={description.length > 0 ? '' : 'Add description'}
                    placeholderTextColor={theme.colors.textMuted}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <Text style={styles.label}>Priority</Text>
                <View style={styles.segmentRow}>
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => {
                    const cfg = PRIORITY_CONFIG[value];
                    const active = priority === value;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setPriority(value)}
                        style={[
                          styles.segmentOption,
                          active && { borderColor: cfg.color, backgroundColor: cfg.bg },
                        ]}
                      >
                        <Text style={[styles.segmentText, active && { color: cfg.color }]}>{cfg.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.label}>Status</Text>
                <Pressable style={styles.statusSelector} onPress={() => setShowStatusSheet(true)}>
                  <View style={styles.statusSelectorLeft}>
                    <MaterialCommunityIcons name={sCfg.icon} size={16} color={sCfg.color} />
                    <Text style={styles.statusSelectorText}>{sCfg.label}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-up" size={18} color={theme.colors.textMuted} />
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  disabled={!canSave}
                  style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                >
                  <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>Save Changes</Text>
                </Pressable>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Photos</Text>
                  <Pressable
                    onPress={() => setShowPhotoModal(true)}
                    disabled={(task.photos?.length || 0) >= 3}
                    style={styles.iconAction}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={18}
                      color={(task.photos?.length || 0) >= 3 ? theme.colors.textMuted : theme.colors.primary}
                    />
                  </Pressable>
                </View>

                {(task.photos?.length || 0) > 0 ? (
                  <FlatList
                    data={task.photos}
                    keyExtractor={(_, idx) => idx.toString()}
                    renderItem={({ item, index }) => (
                      <View style={styles.photoWrap}>
                        <Pressable
                          onPress={() => {
                            setPreviewLoadError(false);
                            setIsPreviewLoading(true);
                            setPreviewPhotoUri(item);
                          }}
                        >
                          <Image source={{ uri: item }} style={styles.photo} />
                        </Pressable>
                        <Pressable onPress={() => handleRemovePhoto(index)} style={styles.photoRemove}>
                          <MaterialCommunityIcons name="close" size={12} color={theme.colors.surface} />
                        </Pressable>
                      </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: theme.spacing.sm, paddingTop: theme.spacing.sm }}
                  />
                ) : (
                  <Pressable onPress={() => setShowPhotoModal(true)} style={styles.emptyPanel}>
                    <MaterialCommunityIcons name="image-plus" size={26} color={theme.colors.textMuted} />
                    <Text style={styles.emptyPanelText}>Tap to add photos</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Pressable onPress={handleAddLocation} disabled={loadingLocation} style={styles.iconAction}>
                    {loadingLocation ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name="crosshairs-gps" size={18} color={theme.colors.primary} />
                    )}
                  </Pressable>
                </View>

                {task.location ? (
                  <>
                    {Platform.OS === 'web' ? (
                      <View style={styles.mapPlaceholder}>
                        <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.success} />
                        <Text style={styles.mapAddressText}>{task.location.address || 'Location captured'}</Text>
                      </View>
                    ) : (
                      <View style={styles.mapWrap}>
                        <MapView
                          style={StyleSheet.absoluteFill}
                          initialRegion={{
                            latitude: task.location.latitude,
                            longitude: task.location.longitude,
                            latitudeDelta: task.location.latitudeDelta,
                            longitudeDelta: task.location.longitudeDelta,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          pitchEnabled={false}
                          rotateEnabled={false}
                        >
                          <Marker coordinate={{ latitude: task.location.latitude, longitude: task.location.longitude }} />
                        </MapView>
                      </View>
                    )}
                    <Text style={styles.mapAddressText}>{task.location.address || 'No address available'}</Text>
                  </>
                ) : (
                  <Pressable onPress={handleAddLocation} style={styles.emptyPanel}>
                    <MaterialCommunityIcons name="map-marker-off-outline" size={24} color={theme.colors.textMuted} />
                    <Text style={styles.emptyPanelText}>Tap to capture location</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.sectionCard}>
                <Pressable onPress={handleCreateFieldReport} style={styles.fieldReportBtn}>
                  <View style={styles.fieldReportIcon}>
                    <MaterialCommunityIcons name="file-document-edit-outline" size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.fieldReportText}>Create Field Report</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
                </Pressable>

                <Text style={[styles.sectionTitle, { marginTop: theme.spacing.md }]}>Report History</Text>

                {taskReports.length === 0 ? (
                  <Text style={styles.noReportsText}>No reports submitted for this task yet.</Text>
                ) : (
                  <View style={{ gap: theme.spacing.sm }}>
                    {taskReports.map((report) => (
                      <Pressable key={report.id} onPress={() => openReport(report.id)} style={styles.reportRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reportDateText}>
                            {new Date(report.createdAt).toLocaleDateString()} · {new Date(report.createdAt).toLocaleTimeString()}
                          </Text>
                          <Text style={styles.reportObsText} numberOfLines={1}>
                            {report.observations || 'No observations'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.reportSyncBadge,
                            {
                              backgroundColor:
                                report.syncStatus === 'pending' ? theme.colors.warningSoft : theme.colors.successSoft,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.reportSyncText,
                              {
                                color:
                                  report.syncStatus === 'pending' ? theme.colors.warning : theme.colors.success,
                              },
                            ]}
                          >
                            {report.syncStatus === 'pending' ? 'Pending' : 'Synced'}
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>

      <Modal
        visible={showStatusSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStatusSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetBody}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Status</Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
              {(['open', 'in-progress', 'completed'] as TaskStatus[]).map((value) => {
                const cfg = STATUS_CONFIG[value];
                const active = status === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      setStatus(value);
                      setShowStatusSheet(false);
                    }}
                    style={[styles.sheetItem, active && { borderColor: cfg.color, backgroundColor: cfg.bg }]}
                  >
                    <MaterialCommunityIcons name={cfg.icon} size={16} color={cfg.color} />
                    <Text style={[styles.sheetItemText, active && { color: cfg.color }]}>{cfg.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable onPress={() => setShowStatusSheet(false)} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetBody}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add Photo</Text>
            <View style={styles.photoActionsRow}>
              <Pressable style={styles.photoActionBtn} onPress={handleTakePhoto}>
                <MaterialCommunityIcons name="camera" size={20} color={theme.colors.primary} />
                <Text style={styles.photoActionText}>Camera</Text>
              </Pressable>
              <Pressable style={styles.photoActionBtn} onPress={handlePickPhoto}>
                <MaterialCommunityIcons name="image" size={20} color={theme.colors.success} />
                <Text style={styles.photoActionText}>Gallery</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setShowPhotoModal(false)} style={styles.sheetCancel}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(previewPhotoUri)}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {
          setPreviewPhotoUri(null);
          setIsPreviewLoading(false);
          setPreviewLoadError(false);
        }}
      >
        <SafeAreaView style={styles.previewRoot}>
          <View style={styles.previewNav}>
            <Pressable
              onPress={() => {
                setPreviewPhotoUri(null);
                setIsPreviewLoading(false);
                setPreviewLoadError(false);
              }}
              style={styles.previewClose}
            >
              <MaterialCommunityIcons name="close" size={22} color={theme.colors.surface} />
            </Pressable>
          </View>
          <View style={styles.previewBody}>
            {isPreviewLoading ? <ActivityIndicator size="large" color={theme.colors.surface} style={{ position: 'absolute' }} /> : null}
            {previewPhotoUri ? (
              <Image
                source={{ uri: previewPhotoUri }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
                onLoadStart={() => {
                  setIsPreviewLoading(true);
                  setPreviewLoadError(false);
                }}
                onLoadEnd={() => setIsPreviewLoading(false)}
                onError={() => {
                  setIsPreviewLoading(false);
                  setPreviewLoadError(true);
                }}
              />
            ) : null}
            {previewLoadError ? <Text style={styles.previewError}>Unable to preview this image.</Text> : null}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemibold,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.weightExtrabold,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  heroCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radii.xxl,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  taskHeroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.weightExtrabold,
  },
  taskHeroDescription: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodySmall,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  metaBadge: {
    height: 30,
    borderRadius: theme.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    gap: 5,
  },
  metaBadgeText: {
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightBold,
  },
  sectionCard: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightBold,
    marginBottom: theme.spacing.sm,
  },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    minHeight: 62,
    justifyContent: 'center',
  },
  inputWrapError: {
    borderColor: theme.colors.danger,
  },
  inputWrapMultiline: {
    minHeight: 120,
    paddingTop: 12,
    marginTop: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightSemibold,
  },
  inputLabelActive: {
    color: theme.colors.primary,
  },
  input: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightSemibold,
    paddingTop: 2,
  },
  inputMultiline: {
    minHeight: 86,
  },
  inputErrorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: theme.typography.weightSemibold,
  },
  label: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightSemibold,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  segmentOption: {
    flex: 1,
    height: 38,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightBold,
  },
  statusSelector: {
    height: 44,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusSelectorText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weightSemibold,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    height: 50,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightBold,
  },
  saveButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  photoWrap: {
    width: 108,
    height: 108,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radii.md,
  },
  photoRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPanel: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  emptyPanelText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightSemibold,
  },
  mapWrap: {
    height: 170,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mapPlaceholder: {
    height: 120,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  mapAddressText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  fieldReportBtn: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.primarySoft,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  fieldReportIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldReportText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightBold,
  },
  noReportsText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightMedium,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
  },
  reportDateText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightSemibold,
  },
  reportObsText: {
    marginTop: 2,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.micro,
  },
  reportSyncBadge: {
    borderRadius: theme.radii.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  reportSyncText: {
    fontSize: theme.typography.micro,
    fontWeight: theme.typography.weightBold,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheetBody: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.weightExtrabold,
  },
  sheetItem: {
    height: 46,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sheetItemText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weightSemibold,
  },
  sheetCancel: {
    marginTop: theme.spacing.md,
    height: 46,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightBold,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  photoActionBtn: {
    flex: 1,
    height: 84,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoActionText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weightBold,
  },
  previewRoot: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  previewNav: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  previewClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlayLight,
  },
  previewBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewError: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: theme.typography.bodySmall,
  },
});
