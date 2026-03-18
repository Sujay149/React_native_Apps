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