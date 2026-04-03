import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/stores/use-app-store';

type ServiceModule = {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  route: string;
};

const modules: ServiceModule[] = [
  {
    id: 'homecare',
    title: 'Home Care',
    icon: 'heart-outline',
    description: 'Manage patient care and medical records',
    color: '#DC2626',
    route: '/modules/homecare',
  },
  {
    id: 'health',
    title: 'Health Services',
    icon: 'hospital-box-outline',
    description: 'Health intake and service tracking',
    color: '#16A34A',
    route: '/modules/health',
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'shield-outline',
    description: 'Report and track security issues',
    color: '#2563EB',
    route: '/modules/security',
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: 'trending-up',
    description: 'Field data entry and lead tracking',
    color: '#D97706',
    route: '/modules/marketing',
  },
  {
    id: 'education',
    title: 'Education',
    icon: 'book-outline',
    description: 'Career guidance and education support',
    color: '#7C3AED',
    route: '/modules/education',
  },
];

export default function ModulesScreen() {
  const router = useRouter();
  const { userName } = useAppStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Service Modules</Text>
          <Text style={styles.headerSub}>Welcome back, {userName.split(' ')[0]}</Text>
        </View>

        {/* Modules Grid */}
        <View style={styles.grid}>
          {modules.map((module, index) => (
            <Pressable
              key={module.id}
              onPress={() => router.push(module.route as any)}
              style={({ pressed }) => [
                styles.moduleCard,
                {
                  opacity: pressed ? 0.7 : 1,
                  marginRight: index % 2 === 0 ? 8 : 0,
                },
              ]}>
              <LinearGradient
                colors={[`${module.color}15`, `${module.color}08`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}>
                <View style={[styles.iconContainer, { backgroundColor: `${module.color}20` }]}>
                  <MaterialCommunityIcons
                    name={module.icon as any}
                    size={32}
                    color={module.color}
                  />
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDesc}>{module.description}</Text>
                <View style={styles.arrowContainer}>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={module.color}
                  />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending Tasks</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>8</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>In Progress</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    marginTop: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moduleCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  cardGradient: {
    padding: 16,
    height: 200,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    fontSize: theme.typography.bodySmall + 1,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  moduleDesc: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
  },
  statsContainer: {
    marginTop: 16,
  },
  statsTitle: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  statLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
