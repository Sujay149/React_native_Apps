# TaskTrack Complete Workflow, Approaches, and Full Code

This is a complete build-from-scratch reference for your task tracking app.

It covers:

- end-to-end implementation workflow
- architecture approaches used
- why each approach was chosen
- full code for all task feature files

## 1. Complete Workflow (From Scratch)

1. Initialize Expo app with Expo Router.
2. Set up root navigation shell (stack routes).
3. Set up tab navigation for main sections.
4. Create a global Zustand store.
5. Add AsyncStorage persistence to Zustand store.
6. Build auth entry route and login screen.
7. Build Task List screen (home page) with CRUD and filters.
8. Build Task Detail screen for edit and delete (drill-down).
9. Build Profile screen with summary and logout.
10. Handle hydration state for persisted store startup.
11. Add SafeAreaView usage with react-native-safe-area-context.
12. Verify lint and runtime on web and Expo Go.

## 2. Approaches Used and Why

### Approach A: File-based Navigation (Expo Router)

Used because:

- faster setup
- clean route structure
- tabs and stack can coexist naturally

### Approach B: Global State via Zustand (No Prop Drilling)

Used because:

- screens need shared task/auth state
- avoids passing props across multiple route levels
- easier to scale and maintain

### Approach C: Persistence with AsyncStorage + persist middleware

Used because:

- tasks must survive app restart
- auth state should persist too
- middleware handles serialization and rehydration cleanly

### Approach D: Screen-level Local State for Form Inputs

Used because:

- form text is temporary UI state
- should not pollute global store

### Approach E: SafeAreaView from react-native-safe-area-context

Used because:

- correct cross-platform safe area support
- avoids edge clipping on modern devices

## 3. Full Code

## 3.1 Root Layout

File: app/_layout.tsx

```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Task Detail' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

## 3.2 Root Entry Redirect

File: app/index.tsx

```tsx
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function IndexRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { hasHydrated } = useAppHydration();

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Preparing TaskTrack...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 16,
    color: '#334155',
  },
});
```

## 3.3 Login Screen

File: app/login.tsx

```tsx
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const { hasHydrated, usedFallback } = useAppHydration();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    login(name.trim());
    router.replace('/(tabs)');
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}>
      <View style={styles.card}>
        {Platform.OS === 'web' && usedFallback ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>Storage is unavailable in this browser session. Data may not persist.</Text>
          </View>
        ) : null}
        <Text style={styles.title}>TaskTrack Login</Text>
        <Text style={styles.subtitle}>Use any valid inputs to continue.</Text>

        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (error) {
              setError('');
            }
          }}
          style={styles.input}
          placeholder="Name"
          autoCapitalize="words"
          returnKeyType="next"
        />

        <TextInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (error) {
              setError('');
            }
          }}
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 6,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  helperText: {
    color: '#334155',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
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
```

## 3.4 Tabs Layout

File: app/(tabs)/_layout.tsx

```tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## 3.5 Home Page (Task List)

File: app/(tabs)/index.tsx

```tsx
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
```

## 3.6 Profile Screen

File: app/(tabs)/profile.tsx

```tsx
import { Redirect, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { hasHydrated, usedFallback } = useAppHydration();
  const { isAuthenticated, userName, tasks, logout } = useAppStore();

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const doneCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - doneCount;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {Platform.OS === 'web' && usedFallback ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>Storage is unavailable in this browser session. Data may not persist.</Text>
          </View>
        ) : null}
        <Text style={styles.heading}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Logged in as</Text>
          <Text style={styles.value}>{userName || 'User'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Task Summary</Text>
          <Text style={styles.summaryLine}>Total Tasks: {tasks.length}</Text>
          <Text style={styles.summaryLine}>Open Tasks: {openCount}</Text>
          <Text style={styles.summaryLine}>Completed Tasks: {doneCount}</Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            logout();
            router.replace('/login');
          }}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  helperText: {
    color: '#334155',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 8,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryLine: {
    fontSize: 15,
    color: '#334155',
  },
  logoutButton: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
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
```

## 3.7 Task Detail Screen

File: app/task/[id].tsx

```tsx
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
} from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function TaskDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const taskId = params.id;
  const { hasHydrated } = useAppHydration();
  const { tasks, isAuthenticated, updateTask, toggleTask, deleteTask } = useAppStore();

  const task = useMemo(() => tasks.find((item) => item.id === taskId), [taskId, tasks]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    updateTask(taskId, { title: trimmedTitle, description: description.trim() });
    setError('');
    router.back();
  };

  const handleDelete = () => {
    deleteTask(taskId);
    router.replace('/(tabs)');
  };

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
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
        <Text style={styles.helperText}>Task not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}>
      <Stack.Screen options={{ title: 'Task Detail' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Edit Task</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (error) {
              setError('');
            }
          }}
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Task title"
        />
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholder="Task description"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryText}>Save Changes</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => toggleTask(taskId)}>
            <Text style={styles.secondaryText}>{task.completed ? 'Mark Open' : 'Mark Done'}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  helperText: {
    color: '#334155',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
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
  multiline: {
    minHeight: 120,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#0f766e',
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
```

## 3.8 Zustand Store with Persistence

File: stores/use-app-store.ts

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TaskFilter = 'all' | 'open' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type AppState = {
  isAuthenticated: boolean;
  userName: string;
  tasks: Task[];
  filter: TaskFilter;
  login: (userName: string) => void;
  logout: () => void;
  createTask: (title: string, description?: string) => void;
  updateTask: (id: string, changes: Partial<Pick<Task, 'title' | 'description'>>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
};

const nowIso = () => new Date().toISOString();

const createTaskId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: '',
      tasks: [],
      filter: 'all',

      login: (userName) => set({ isAuthenticated: true, userName }),

      logout: () =>
        set({
          isAuthenticated: false,
          userName: '',
          filter: 'all',
        }),

      createTask: (title, description = '') =>
        set((state) => ({
          tasks: [
            {
              id: createTaskId(),
              title,
              description,
              completed: false,
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
            ...state.tasks,
          ],
        })),

      updateTask: (id, changes) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...changes,
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'tasktrack-app-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useAppHydration() {
  const [hasHydrated, setHasHydrated] = useState(useAppStore.persist.hasHydrated());
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribeHydrate = useAppStore.persist.onHydrate(() => {
      setHasHydrated(false);
    });

    const unsubscribeFinishHydration = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    const ensureHydration = async () => {
      if (useAppStore.persist.hasHydrated()) {
        if (isMounted) {
          setHasHydrated(true);
        }
        return;
      }

      try {
        await Promise.race([
          useAppStore.persist.rehydrate(),
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);
        if (isMounted && !useAppStore.persist.hasHydrated()) {
          setUsedFallback(true);
        }
      } catch {
        if (isMounted) {
          setUsedFallback(true);
        }
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };

    ensureHydration();

    return () => {
      isMounted = false;
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  return { hasHydrated, usedFallback };
}
```

## 3.9 Cross-Platform Icon Mapping

File: components/ui/icon-symbol.tsx

```tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'person.fill': 'person',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
```

## 4. Key Concepts You Should Remember

1. Navigation is route-driven via filesystem.
2. Store is the single source of truth for shared app data.
3. Persist middleware makes state survive restarts.
4. Forms use local state, business data uses global state.
5. SafeAreaView must come from react-native-safe-area-context.
6. Web and native can differ for hydration behavior.

## 5. Final Checklist for This Task

- Login screen exists and validates inputs.
- Task List supports create, delete, toggle, filter.
- Pull-to-refresh is implemented.
- Task Detail supports edit and delete.
- Profile shows task summary and logout.
- Tabs + stack drill-down are configured.
- Zustand manages global auth/task/filter state.
- AsyncStorage persistence is active.
- Safe area handling is applied to main screens.

This document is your complete reference to rebuild the same app from zero.
