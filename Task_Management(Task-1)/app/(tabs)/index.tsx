import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  ScrollView,
} from 'react-native';

import { useAppHydration, useAppStore, TaskPriority, TaskStatus } from '@/stores/use-app-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { trackTaskCompleted, trackTaskCreated } from '@/utils/analytics';

type FilterOption = 'all' | 'open' | 'done';

export default function TaskListScreen() {
  const router = useRouter();
  const { hasHydrated, usedFallback } = useAppHydration();
  const {
    isAuthenticated,
    tasks,
    filter,
    setFilter,
    createTask,
    toggleTask,
    deleteTask,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [titleError, setTitleError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = useMemo(() => {
    if (filter === 'open') {
      return tasks.filter((task) => !task.completed);
    }
    if (filter === 'done') {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  }, [tasks, filter]);

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      return;
    }

    createTask(trimmedTitle, trimmedDescription, priority);
    trackTaskCreated(trimmedTitle, priority);
    
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTitleError('');
    setShowCreateModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleTask = (taskId: string, wasCompleted: boolean) => {
    toggleTask(taskId);
    if (!wasCompleted) {
      trackTaskCompleted(taskId);
    }
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const renderFilter = (value: FilterOption, label: string) => {
    const isActive = filter === value;
    return (
      <Pressable
        onPress={() => setFilter(value)}
        style={[styles.filterButton, isActive && styles.filterButtonActive]}>
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in-progress':
        return 'progress-clock';
      default:
        return 'circle-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <Pressable style={styles.addButton} onPress={() => setShowCreateModal(true)}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.filterContainer}>
          {renderFilter('all', 'All')}
          {renderFilter('open', 'Open')}
          {renderFilter('done', 'Done')}
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/task/${item.id}`)}
              style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
              <View style={styles.taskHeader}>
                <View style={styles.taskTitleContainer}>
                  <MaterialCommunityIcons
                    name={getStatusIcon(item.status)}
                    size={20}
                    color={item.completed ? '#10b981' : '#6b7280'}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                    {item.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(item.priority) },
                  ]}>
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.taskMeta}>
                {item.photos && item.photos.length > 0 && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="camera" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{item.photos.length}</Text>
                  </View>
                )}
                {item.location && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>Located</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => handleToggleTask(item.id, item.completed)}
                  style={styles.completeButton}>
                  <MaterialCommunityIcons
                    name={item.completed ? 'check-circle' : 'checkbox-blank-circle-outline'}
                    size={18}
                    color={item.completed ? '#10b981' : '#cbd5e1'}
                  />
                </Pressable>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tasks yet. Create one to get started!</Text>
            </View>
          }
        />

        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>New Task</Text>
                <Pressable onPress={handleCreateTask}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.modalFormContainer}>
                <Text style={styles.formLabel}>Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={(value) => {
                    setTitle(value);
                    if (titleError) setTitleError('');
                  }}
                  style={styles.input}
                  placeholder="Task title"
                  placeholderTextColor="#cbd5e1"
                />
                {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Add details..."
                  placeholderTextColor="#cbd5e1"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.formLabel}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityOption,
                        priority === p && styles.priorityOptionSelected,
                      ]}>
                      <Text style={styles.priorityOptionText}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0f766e',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffff',
  },
  filterButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '500',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
  },
  completeButton: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalFormContainer: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#0f172a',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});

