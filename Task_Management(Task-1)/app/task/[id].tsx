import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppHydration, useAppStore, TaskPriority, TaskStatus } from '@/stores/use-app-store';
import { getCurrentLocation } from '@/utils/location';
import { pickImageFromGallery, takePhotoWithCamera } from '@/utils/image';
import { trackPhotoAttached, trackLocationAdded, trackTaskModified } from '@/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  } =
    useAppStore();

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);
  const taskReports = useMemo(
    () => fieldReports.filter((report) => report.taskId === taskId),
    [fieldReports, taskId],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [error, setError] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
    }
  }, [task]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

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

    setError('');
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
        Alert.alert('Success', `Location added: ${location.address}`);
      } else {
        Alert.alert('Error', 'Could not get location. Please enable location services.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removePhotoFromTask(taskId, index),
      },
    ]);
  };

  const handleDeleteTask = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
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
    router.push({
      pathname: '/task/field-report',
      params: { taskId },
    });
  };

  const openReport = (reportId: string) => {
    router.push({ pathname: '/task/report/[reportId]', params: { reportId } });
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="text-base text-[#64748b]">Loading task...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <MaterialCommunityIcons name="alert-circle" size={48} color="#cbd5e1" />
        <Text className="text-base text-[#64748b]">Task not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Task Detail' }} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 bg-[#f8fafc]">
        <SafeAreaView className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
            <Text className="text-2xl font-bold text-[#0f172a]">Edit Task</Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError('');
              }}
              className={`rounded-[10px] border bg-white px-3 py-2.5 text-base text-[#0f172a] ${error ? 'border-[#dc2626]' : 'border-[#cbd5e1]'}`}
              placeholder="Task title"
              placeholderTextColor="#cbd5e1"
            />
            {error ? <Text className="-mt-2.5 text-xs text-[#dc2626]">{error}</Text> : null}

            <Text className="text-sm font-semibold text-[#0f172a]">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              className="min-h-[100px] rounded-[10px] border border-[#cbd5e1] bg-white px-3 py-2.5 text-base text-[#0f172a]"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Task description"
              placeholderTextColor="#cbd5e1"
            />

            <Text className="text-sm font-semibold text-[#0f172a]">Priority</Text>
            <View className="flex-row gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 items-center rounded-lg border px-2 py-2.5 ${priority === p ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#cbd5e1] bg-white'}`}>
                  <Text className={`text-sm font-semibold ${priority === p ? 'text-white' : 'text-[#334155]'}`}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-semibold text-[#0f172a]">Status</Text>
            <View className="flex-row gap-2">
              {(['open', 'in-progress', 'completed'] as TaskStatus[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`flex-1 items-center rounded-lg border px-2 py-2.5 ${status === s ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#cbd5e1] bg-white'}`}>
                  <Text className={`text-xs font-semibold ${status === s ? 'text-white' : 'text-[#334155]'}`}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <View className="gap-[10px]">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-[#0f172a]">Photos ({(task?.photos?.length || 0)}/3)</Text>
                <Pressable
                  onPress={() => setShowPhotoModal(true)}
                  disabled={(task?.photos?.length || 0) >= 3}
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#e0f2fe]">
                  <MaterialCommunityIcons name="plus" size={20} color="#0f766e" />
                </Pressable>
              </View>

              {(task?.photos?.length || 0) > 0 && (
                <FlatList
                  data={task.photos}
                  keyExtractor={(_, idx) => idx.toString()}
                  renderItem={({ item, index }) => (
                    <View className="relative mr-[10px]" style={{ width: 100, height: 105 }}>
                      <Pressable
                        onPress={() => {
                          setPreviewLoadError(false);
                          setIsPreviewLoading(true);
                          setPreviewPhotoUri(item);
                        }}
                        style={{ width: 100, height: 105 }}>
                        <Image source={{ uri: item }} style={{ width: 100, height: 105, borderRadius: 8 }} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleRemovePhoto(index)}
                        className="absolute -right-2 -top-[5px] h-7 w-7 items-center justify-center rounded-full bg-[#dc2626]">
                        <MaterialCommunityIcons name="close" size={18} color="#fff" />
                      </Pressable>
                    </View>
                  )}
                  horizontal
                  scrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingTop: 5, paddingBottom: 5 }}
                  style={{ marginVertical: 8, minHeight: 115 }}
                />
              )}
            </View>

            <View className="gap-[10px]">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-[#0f172a]">Location</Text>
                <Pressable
                  onPress={handleAddLocation}
                  disabled={loadingLocation}
                  className="h-9 w-9 items-center justify-center rounded-full bg-[#e0f2fe]">
                  {loadingLocation ? (
                    <ActivityIndicator color="#0f766e" size={20} />
                  ) : (
                    <MaterialCommunityIcons name="map-plus" size={20} color="#0f766e" />
                  )}
                </Pressable>
              </View>

              {task.location && (
                <View className="flex-row items-start gap-[10px] rounded-lg bg-[#ecf0f1] p-3">
                  <MaterialCommunityIcons name="map-marker" size={18} color="#0f766e" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-[#0f172a]">{task.location.address}</Text>
                    <Text className="mt-0.5 text-xs text-[#64748b]">
                      Lat: {task.location.latitude.toFixed(6)}, Lng: {task.location.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="gap-1.5 py-2">
              <Text className="text-xs text-[#64748b]">Created: {new Date(task.createdAt).toLocaleString()}</Text>
              <Text className="text-xs text-[#64748b]">Updated: {new Date(task.updatedAt).toLocaleString()}</Text>
            </View>

            <Pressable
              className="flex-row items-center justify-center gap-2 rounded-[10px] border border-[#0f766e] bg-[#f0fdfa] py-3.5"
              onPress={handleCreateFieldReport}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#0f766e" />
              <Text className="text-base font-semibold text-[#0f766e]">Create Field Report</Text>
            </Pressable>

            <View className="gap-2 rounded-xl border border-[#dbe4ee] bg-white p-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-[#0f172a]">Report History</Text>
                <Text className="text-xs text-[#64748b]">{taskReports.length} total</Text>
              </View>

              {taskReports.length === 0 ? (
                <Text className="text-xs text-[#64748b]">No reports submitted for this task yet.</Text>
              ) : (
                taskReports.map((report) => (
                  <Pressable
                    key={report.id}
                    onPress={() => openReport(report.id)}
                    className="rounded-lg border border-[#e2e8f0] px-3 py-2.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-[#0f172a]">
                        {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}
                      </Text>
                      <Text
                        className={`text-xs font-semibold ${
                          report.syncStatus === 'pending' ? 'text-[#b45309]' : 'text-[#166534]'
                        }`}>
                        {report.syncStatus === 'pending' ? 'Pending Sync' : 'Synced'}
                      </Text>
                    </View>
                    <Text className="mt-1 text-xs text-[#64748b]" numberOfLines={1}>
                      {report.observations || 'No observations'}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>

            <Pressable className="flex-row items-center justify-center gap-2 rounded-[10px] bg-[#0f766e] py-3.5" onPress={handleSave}>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">Save Changes</Text>
            </Pressable>

            <Pressable className="flex-row items-center justify-center gap-2 rounded-[10px] bg-[#dc2626] py-3.5" onPress={handleDeleteTask}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">Delete Task</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoModal(false)}>
        <SafeAreaView className="flex-1 bg-[#f8fafc]">
          <View className="flex-1 px-4">
            <View className="flex-row items-center justify-between border-b border-[#e2e8f0] py-[14px]">
              <Pressable onPress={() => setShowPhotoModal(false)}>
                <Text className="text-base font-medium text-[#64748b]">Close</Text>
              </Pressable>
              <Text className="text-lg font-bold text-[#0f172a]">Add Photo</Text>
              <View className="w-[50px]" />
            </View>

            <View className="flex-1 flex-row items-start justify-around py-10">
              <Pressable className="items-center gap-3" onPress={handleTakePhoto}>
                <MaterialCommunityIcons name="camera" size={40} color="#0f766e" />
                <Text className="text-sm font-semibold text-[#0f172a]">Take Photo</Text>
              </Pressable>
              <Pressable className="items-center gap-3" onPress={handlePickPhoto}>
                <MaterialCommunityIcons name="image" size={40} color="#0f766e" />
                <Text className="text-sm font-semibold text-[#0f172a]">From Gallery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={Boolean(previewPhotoUri)}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {
          setPreviewPhotoUri(null);
          setIsPreviewLoading(false);
          setPreviewLoadError(false);
        }}>
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Pressable
                onPress={() => {
                  setPreviewPhotoUri(null);
                  setIsPreviewLoading(false);
                  setPreviewLoadError(false);
                }}
                className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2">
                <MaterialCommunityIcons name="arrow-left" size={20} color="#000" />
                <Text className="text-sm font-semibold text-black">Back</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setPreviewPhotoUri(null);
                  setIsPreviewLoading(false);
                  setPreviewLoadError(false);
                }}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <View className="flex-1 items-center justify-center px-2 pb-6">
              {isPreviewLoading ? (
                <ActivityIndicator size="large" color="#ffffff" style={{ position: 'absolute' }} />
              ) : null}
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
              {previewLoadError ? (
                <Text className="absolute text-sm text-white/80">Unable to preview this image.</Text>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
