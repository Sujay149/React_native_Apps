import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const statusFiltered = (() => {
      if (filter === 'open') {
        return tasks.filter((task) => !task.completed);
      }
      if (filter === 'done') {
        return tasks.filter((task) => task.completed);
      }
      return tasks;
    })();

    if (!query) {
      return statusFiltered;
    }

    return statusFiltered.filter((task) => {
      const title = task.title?.toLowerCase() ?? '';
      const description = task.description?.toLowerCase() ?? '';
      return title.includes(query) || description.includes(query);
    });
  }, [tasks, filter, searchQuery]);

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
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <Text className="text-base text-[#334155]">Loading tasks...</Text>
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
        className={`rounded-full border px-[14px] py-2 ${isActive ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#cbd5e1] bg-[#ffff]'}`}>
        <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#334155]'}`}>
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
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 bg-[#f8fafc]">
        <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
          <Text className="text-[28px] font-bold text-[#0f172a]">My Tasks</Text>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-[#0f766e]" onPress={() => setShowCreateModal(true)}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </Pressable>
        </View>

        <View className="flex-row gap-2 px-4 py-[10px]">
          {renderFilter('all', 'All')}
          {renderFilter('open', 'Open')}
          {renderFilter('done', 'Done')}
        </View>

        <View className="px-4 pb-2">
          <View className="flex-row items-center rounded-xl border border-[#cbd5e1] bg-white px-3">
            <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tasks"
              placeholderTextColor="#94a3b8"
              className="ml-2 flex-1 py-2.5 text-sm text-[#0f172a]"
              returnKeyType="search"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} className="pl-2">
                <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(tabs)/task/${item.id}`)}
              className={`gap-[10px] rounded-xl border border-[#e2e8f0] bg-white p-[14px] ${item.completed ? 'opacity-70' : ''}`}>
              <View className="flex-row items-center justify-between gap-[10px]">
                <View className="flex-1 flex-row items-center">
                  <MaterialCommunityIcons
                    name={getStatusIcon(item.status)}
                    size={20}
                    color={item.completed ? '#10b981' : '#6b7280'}
                    style={{ marginRight: 8 }}
                  />
                  <Text className={`flex-1 text-base font-semibold ${item.completed ? 'text-[#94a3b8] line-through' : 'text-[#0f172a]'}`}>
                    {item.title}
                  </Text>
                </View>
                <View
                  className="rounded-md px-[10px] py-1"
                  style={[
                    { backgroundColor: getPriorityColor(item.priority) },
                  ]}>
                  <Text className="text-xs font-semibold text-white">{item.priority}</Text>
                </View>
              </View>

              {item.description ? (
                <Text className="text-sm leading-5 text-[#64748b]" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View className="flex-row items-center justify-between gap-2">
                {item.photos && item.photos.length > 0 && (
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="camera" size={14} color="#6b7280" />
                    <Text className="text-xs text-[#64748b]">{item.photos.length}</Text>
                  </View>
                )}
                {item.location && (
                  <View className="flex-row items-center gap-1">
                    <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
                    <Text className="text-xs text-[#64748b]">Located</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => handleToggleTask(item.id, item.completed)}
                  className="ml-auto">
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
            <View className="flex-1 items-center justify-center py-10">
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#cbd5e1" />
              <Text className="mt-3 text-sm text-[#94a3b8]">
                {searchQuery.trim()
                  ? 'No tasks match your search.'
                  : 'No tasks yet. Create one to get started!'}
              </Text>
            </View>
          }
        />

        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}>
          <SafeAreaView className="flex-1 bg-[#f8fafc]">
            <View className="flex-1">
              <View className="flex-row items-center justify-between border-b border-[#e2e8f0] px-4 py-[14px]">
                <Pressable onPress={() => setShowCreateModal(false)}>
                  <Text className="text-base font-medium text-[#64748b]">Cancel</Text>
                </Pressable>
                <Text className="text-lg font-bold text-[#0f172a]">New Task</Text>
                <Pressable onPress={handleCreateTask}>
                  <Text className="text-base font-semibold text-[#0f766e]">Save</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
                <Text className="mb-1 text-sm font-semibold text-[#0f172a]">Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={(value) => {
                    setTitle(value);
                    if (titleError) setTitleError('');
                  }}
                  className="rounded-[10px] border border-[#cbd5e1] bg-white px-3 py-2.5 text-base text-[#0f172a]"
                  placeholder="Task title"
                  placeholderTextColor="#cbd5e1"
                />
                {titleError ? <Text className="-mt-2.5 text-xs text-[#dc2626]">{titleError}</Text> : null}

                <Text className="mb-1 text-sm font-semibold text-[#0f172a]">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  className="min-h-[100px] rounded-[10px] border border-[#cbd5e1] bg-white px-3 py-2.5 text-base text-[#0f172a]"
                  placeholder="Add details..."
                  placeholderTextColor="#cbd5e1"
                  multiline
                  numberOfLines={4}
                />

                <Text className="mb-1 text-sm font-semibold text-[#0f172a]">Priority</Text>
                <View className="flex-row gap-[10px]">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      className={`flex-1 items-center rounded-lg border py-2.5 ${priority === p ? 'border-[#0f766e] bg-[#0f766e]' : 'border-[#cbd5e1] bg-white'}`}>
                      <Text className={`text-sm font-semibold ${priority === p ? 'text-white' : 'text-[#334155]'}`}>{p}</Text>
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

