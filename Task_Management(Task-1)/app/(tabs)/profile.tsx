import { Redirect, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackProfileViewed } from '@/utils/analytics';

export default function ProfileScreen() {
  const router = useRouter();
  const { hasHydrated, usedFallback } = useAppHydration();
  const { isAuthenticated, userName, tasks, logout } = useAppStore();
  const [trackingInProgress, setTrackingInProgress] = useState(false);

  const doneCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - doneCount;
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const photosCount = tasks.reduce((sum, task) => sum + task.photos.length, 0);
  const locationsCount = tasks.filter((task) => task.location).length;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setTrackingInProgress(true);
        await trackProfileViewed(tasks.length, doneCount);
        setTrackingInProgress(false);
      })();
    }, [tasks.length, doneCount])
  );

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.helperText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {Platform.OS === 'web' && usedFallback ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Storage is unavailable in this browser session. Data may not persist.
            </Text>
          </View>
        ) : null}

        <View style={styles.headerSection}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account-circle" size={60} color="#0f766e" />
          </View>
          <Text style={styles.nameText}>{userName || 'User'}</Text>
          <Text style={styles.subtitleText}>Task Manager</Text>
        </View>

        {/* Statistics Overview */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#16a34a" />
            <Text style={styles.statNumber}>{doneCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="progress-clock" size={28} color="#d97706" />
            <Text style={styles.statNumber}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <MaterialCommunityIcons name="circle-outline" size={28} color="#0284c7" />
            <Text style={styles.statNumber}>{openCount}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#f3e8ff' }]}>
            <MaterialCommunityIcons name="percent" size={28} color="#a855f7" />
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Activity Summary</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <MaterialCommunityIcons name="list-box" size={20} color="#64748b" />
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </View>
            <Text style={styles.summaryValue}>{tasks.length}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <MaterialCommunityIcons name="camera" size={20} color="#64748b" />
              <Text style={styles.summaryLabel}>Photos Attached</Text>
            </View>
            <Text style={styles.summaryValue}>{photosCount}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
              <Text style={styles.summaryLabel}>Locations Added</Text>
            </View>
            <Text style={styles.summaryValue}>{locationsCount}</Text>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionRate}%`, backgroundColor: '#0f766e' },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {doneCount} of {tasks.length} tasks completed
          </Text>
        </View>

        {/* Analytics Status */}
        {trackingInProgress && (
          <View style={styles.trackingStatus}>
            <ActivityIndicator size="small" color="#0f766e" />
            <Text style={styles.trackingText}>Analytics syncing...</Text>
          </View>
        )}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
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
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarPlaceholder: {
    marginBottom: 12,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#475569',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  goalsCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#bfdbfe',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#475569',
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  trackingText: {
    fontSize: 12,
    color: '#16a34a',
  },
  logoutButton: {
    flexDirection: 'row',
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 16,
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