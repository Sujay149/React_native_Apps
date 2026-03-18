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