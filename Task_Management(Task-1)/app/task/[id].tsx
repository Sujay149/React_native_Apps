import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { trackPhotoAttached, trackLocationAdded } from '@/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;
  const { hasHydrated } = useAppHydration();
  const { tasks, isAuthenticated, updateTask, addPhotoToTask, removePhotoFromTask, updateTaskLocation } =
    useAppStore();

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [error, setError] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
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

    updateTask(taskId, {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status,
    });
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

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.helperText}>Loading task...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#cbd5e1" />
        <Text style={styles.helperText}>Task not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Task Detail' }} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Edit Task</Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError('');
              }}
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Task title"
              placeholderTextColor="#cbd5e1"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.multiline]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Task description"
              placeholderTextColor="#cbd5e1"
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}>
                  <Text style={styles.priorityBtnText}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              {(['open', 'in-progress', 'completed'] as TaskStatus[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.statusBtn, status === s && styles.statusBtnActive]}>
                  <Text style={styles.statusBtnText}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Photos ({task.photos.length}/3)</Text>
                <Pressable
                  onPress={() => setShowPhotoModal(true)}
                  disabled={task.photos.length >= 3}
                  style={styles.addPhotoBtn}>
                  <MaterialCommunityIcons name="plus" size={20} color="#0f766e" />
                </Pressable>
              </View>

              {task.photos.length > 0 && (
                <FlatList
                  data={task.photos}
                  keyExtractor={(_, idx) => idx.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: item }} style={styles.photoImage} />
                      <Pressable
                        onPress={() => handleRemovePhoto(index)}
                        style={styles.removePhotoBtn}>
                        <MaterialCommunityIcons name="close" size={18} color="#fff" />
                      </Pressable>
                    </View>
                  )}
                  horizontal
                  scrollEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 8 }}
                />
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.label}>Location</Text>
                <Pressable
                  onPress={handleAddLocation}
                  disabled={loadingLocation}
                  style={styles.addLocationBtn}>
                  {loadingLocation ? (
                    <ActivityIndicator color="#0f766e" size={20} />
                  ) : (
                    <MaterialCommunityIcons name="map-plus" size={20} color="#0f766e" />
                  )}
                </Pressable>
              </View>

              {task.location && (
                <View style={styles.locationInfo}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#0f766e" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationAddress}>{task.location.address}</Text>
                    <Text style={styles.locationCoords}>
                      {task.location.latitude.toFixed(4)}, {task.location.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Created: {new Date(task.createdAt).toLocaleString()}</Text>
              <Text style={styles.metaText}>Updated: {new Date(task.updatedAt).toLocaleString()}</Text>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoModal(false)}>
        <SafeAreaView style={styles.photoModalContainer}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalHeader}>
              <Pressable onPress={() => setShowPhotoModal(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Add Photo</Text>
              <View style={{ width: 50 }} />
            </View>

            <View style={styles.photoOptionsContainer}>
              <Pressable style={styles.photoOption} onPress={handleTakePhoto}>
                <MaterialCommunityIcons name="camera" size={40} color="#0f766e" />
                <Text style={styles.photoOptionText}>Take Photo</Text>
              </Pressable>
              <Pressable style={styles.photoOption} onPress={handlePickPhoto}>
                <MaterialCommunityIcons name="image" size={40} color="#0f766e" />
                <Text style={styles.photoOptionText}>From Gallery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  helperText: { color: '#64748b', fontSize: 16 },
  content: { padding: 16, gap: 14 },
  heading: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#ffffff', fontSize: 16, color: '#0f172a' },
  inputError: { borderColor: '#dc2626' },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: -10 },
  priorityContainer: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center' },
  priorityBtnActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  priorityBtnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  statusContainer: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  statusBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addPhotoBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  photoContainer: { position: 'relative', marginRight: 10 },
  photoImage: { width: 100, height: 100, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#dc2626', justifyContent: 'center', alignItems: 'center' },
  addLocationBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  locationInfo: { flexDirection: 'row', backgroundColor: '#ecf0f1', borderRadius: 8, padding: 12, gap: 10, alignItems: 'flex-start' },
  locationAddress: { fontSize: 14, fontWeight: '500', color: '#0f172a' },
  locationCoords: { fontSize: 12, color: '#64748b', marginTop: 2 },
  metaContainer: { gap: 6, paddingVertical: 8 },
  metaText: { fontSize: 12, color: '#64748b' },
  saveButton: { backgroundColor: '#0f766e', borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  photoModalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  photoModalContent: { flex: 1, paddingHorizontal: 16 },
  photoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  closeText: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  photoOptionsContainer: { flex: 1, paddingVertical: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' },
  photoOption: { alignItems: 'center', gap: 12 },
  photoOptionText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
});