import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function SecurityScreen() {
  const router = useRouter();

  const complaints = [
    {
      id: '1',
      title: 'Theft Report',
      location: 'Village Market',
      severity: 'high',
      date: '2024-03-30',
      status: 'open',
    },
    {
      id: '2',
      title: 'Suspicious Activity',
      location: 'Community Center',
      severity: 'medium',
      date: '2024-03-29',
      status: 'resolved',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.colors.danger;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Security</Text>
          <View style={{ width: 24 }} />
        </View>

        <Pressable style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>Report Issue</Text>
        </Pressable>

        <View style={styles.list}>
          {complaints.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardLocation}>{item.location}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: `${getSeverityColor(item.severity)}20` },
                  ]}>
                  <Text
                    style={[
                      styles.severityText,
                      { color: getSeverityColor(item.severity) },
                    ]}>
                    {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.status,
                    { color: item.status === 'open' ? theme.colors.warning : theme.colors.success },
                  ]}>
                  {item.status === 'open' ? 'Open' : 'Resolved'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addBtnText: {
    color: 'white',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  list: { gap: 12 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.shadows.soft,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 4 },
  severityText: { fontSize: theme.typography.caption, fontWeight: '600' },
  status: { fontSize: theme.typography.caption, fontWeight: '600' },
});
