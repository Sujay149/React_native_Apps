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