import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackProfileViewed } from '@/utils/analytics';
import { theme } from '@/constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ProgressRing({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const start = -90;
  return (
    <View style={styles.progressRingWrap}>
      <View style={styles.progressRingBase}>
        <View style={[styles.progressRingArc, { transform: [{ rotate: `${start + clamped * 3.6}deg` }] }]} />
        <View style={styles.progressRingInner}>
          <Text style={styles.progressValueText}>{clamped}%</Text>
          <Text style={styles.progressCaption}>Completed</Text>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { hasHydrated, usedFallback } = useAppHydration();
  const { isAuthenticated, userName, tasks, fieldReports, logout } = useAppStore();

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const open = tasks.length - completed;
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const now = new Date();
    const weeklyValues = DAYS.map((_, index) => {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - (6 - index));
      const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const count = tasks.filter((task) => {
        const stamp = new Date(task.updatedAt || task.createdAt).getTime();
        return stamp >= dayStart && stamp < dayEnd;
      }).length;
      return count;
    });

    return {
      total: tasks.length,
      open,
      completed,
      reportsCompleted: fieldReports.length,
      completionRate,
      weeklyValues,
    };
  }, [tasks, fieldReports.length]);

  const maxWeekly = Math.max(1, ...summary.weeklyValues);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      trackProfileViewed(tasks.length, summary.completed);
    }
  }, [hasHydrated, isAuthenticated, summary.completed, tasks.length]);

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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientC]}
        locations={[0, 0.45, 0.85]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {Platform.OS === 'web' && usedFallback ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>Storage is unavailable in this browser session. Data may not persist.</Text>
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroAvatar}>
              <MaterialCommunityIcons name="account" size={30} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Profile</Text>
              <Text style={styles.heroName}>{userName || 'User'}</Text>
              <Text style={styles.heroSub}>Monitor your field productivity at a glance.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Task Statistics</Text>
            <View style={styles.statsTopRow}>
              <ProgressRing percentage={summary.completionRate} />
              <View style={styles.statsNumbers}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                  <Text style={styles.statValue}>{summary.total}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Open Tasks</Text>
                  <Text style={styles.statValue}>{summary.open}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Reports Completed</Text>
                  <Text style={styles.statValue}>{summary.reportsCompleted}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Week Activity</Text>
            <View style={styles.barChartWrap}>
              {summary.weeklyValues.map((value, index) => (
                <View key={DAYS[index]} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(value / maxWeekly) * 100}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{DAYS[index]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Settings</Text>
            <View style={styles.settingsList}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsLeft}>
                  <MaterialCommunityIcons name="bell-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.settingsText}>Notifications</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
              </View>

              <View style={styles.settingsRow}>
                <View style={styles.settingsLeft}>
                  <MaterialCommunityIcons name="shield-account-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.settingsText}>Privacy</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
              </View>

              <View style={styles.settingsRow}>
                <View style={styles.settingsLeft}>
                  <MaterialCommunityIcons name="help-circle-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.settingsText}>Help & Support</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textMuted} />
              </View>
            </View>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          >
            <MaterialCommunityIcons name="logout" size={18} color={theme.colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: 100,
    gap: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodySmall,
  },
  warningBanner: {
    backgroundColor: theme.colors.warningBannerBg,
    borderColor: theme.colors.warningSoft,
    borderWidth: 1,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  warningText: {
    color: theme.colors.warningText,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightSemibold,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xxl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  heroAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroName: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: theme.typography.weightExtrabold,
    marginTop: 2,
  },
  heroSub: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
    marginTop: 2,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.soft,
  },
  cardTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightExtrabold,
  },
  statsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  progressRingWrap: {
    width: 118,
    height: 118,
  },
  progressRingBase: {
    width: '100%',
    height: '100%',
    borderRadius: 59,
    borderWidth: 10,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  progressRingArc: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 10,
    borderTopColor: theme.colors.primary,
    borderRightColor: theme.colors.primary,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  progressRingInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValueText: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: theme.typography.weightExtrabold,
  },
  progressCaption: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.micro,
    fontWeight: theme.typography.weightSemibold,
    marginTop: 2,
  },
  statsNumbers: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: theme.typography.weightSemibold,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: theme.typography.weightExtrabold,
  },
  barChartWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    minHeight: 130,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 16,
    height: 92,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.primary,
    minHeight: 6,
  },
  barLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.micro,
    fontWeight: theme.typography.weightSemibold,
  },
  settingsList: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  settingsRow: {
    minHeight: 54,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingsText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.weightSemibold,
  },
  logoutButton: {
    marginTop: theme.spacing.xs,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.weightBold,
    fontSize: theme.typography.bodySmall,
  },
});
