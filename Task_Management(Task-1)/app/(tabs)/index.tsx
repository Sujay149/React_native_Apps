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
} from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [titleError, setTitleError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredTasks = useMemo(() => {
    if (filter === 'open') {
      return tasks.filter((task) => !task.completed);
    }
    if (filter === 'done') {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  }, [tasks, filter]);

  const handleCreateTask = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      return;
    }

    createTask(trimmedTitle, trimmedDescription);
    setTitle('');
    setDescription('');
    setTitleError('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
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
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {Platform.OS === 'web' && usedFallback ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>Storage is unavailable in this browser session. Data may not persist.</Text>
              </View>
            ) : null}
            <Text style={styles.title}>TaskTrack</Text>
            <Text style={styles.subtitle}>Create and manage your tasks locally.</Text>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Create Task</Text>
              <TextInput
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  if (titleError) {
                    setTitleError('');
                  }
                }}
                placeholder="Task title"
                style={[styles.input, titleError ? styles.inputError : null]}
                returnKeyType="next"
              />
              {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                style={[styles.input, styles.multilineInput]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Pressable style={styles.primaryButton} onPress={handleCreateTask}>
                <Text style={styles.primaryButtonText}>Add Task</Text>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              {renderFilter('all', 'All')}
              {renderFilter('open', 'Open')}
              {renderFilter('done', 'Done')}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.taskCard}
            onPress={() =>
              router.push({
                pathname: '/task/[id]',
                params: { id: item.id },
              })
            }>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={[styles.statusBadge, item.completed ? styles.doneBadge : styles.openBadge]}>
                {item.completed ? 'Done' : 'Open'}
              </Text>
            </View>
            <Text style={styles.taskDescription}>{item.description || 'No description added.'}</Text>
            <View style={styles.rowActions}>
              <Pressable onPress={() => toggleTask(item.id)} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>{item.completed ? 'Mark Open' : 'Mark Done'}</Text>
              </Pressable>
              <Pressable onPress={() => deleteTask(item.id)} style={styles.inlineDeleteButton}>
                <Text style={styles.inlineDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Create your first task above.</Text>}
      />
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
  listContent: {
    padding: 16,
    gap: 10,
  },
  headerContent: {
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  multilineInput: {
    minHeight: 90,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterButtonText: {
    color: '#334155',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  doneBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  openBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  taskDescription: {
    color: '#475569',
    fontSize: 14,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  inlineButtonText: {
    color: '#0f766e',
    fontWeight: '600',
  },
  inlineDeleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  inlineDeleteText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 24,
  },
  warningBanner: {
    backgroundColor: '#fef9c3',
    borderColor: '#facc15',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  warningText: {
    color: '#713f12',
    fontSize: 12,
    fontWeight: '500',
  },
});
