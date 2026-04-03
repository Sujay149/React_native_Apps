import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function EducationScreen() {
  const router = useRouter();

  const guidance = [
    {
      id: '1',
      name: 'Anita Sharma',
      type: 'College Counseling',
      date: '2024-03-31',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Rahul Singh',
      type: 'Job Application Help',
      date: '2024-03-30',
      status: 'in-progress',
    },
    {
      id: '3',
      name: 'Priya Verma',
      type: 'Career Guidance',
      date: '2024-03-29',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in-progress':
        return theme.colors.warning;
      case 'pending':
        return theme.colors.info;
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
          <Text style={styles.headerTitle}>Education & Guidance</Text>
          <View style={{ width: 24 }} />
        </View>

        <Pressable style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>New Request</Text>
        </Pressable>

        <View style={styles.list}>
          {guidance.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.cardHead}>
                  <MaterialCommunityIcons
                    name="book-open-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}>
                  {item.status === 'completed'
                    ? 'Done'
                    : item.status === 'in-progress'
                    ? 'In Progress'
                    : 'Pending'}
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
    backgroundColor: '#7C3AED',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft,
  },
  cardContent: { flex: 1 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardType: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusText: { fontSize: theme.typography.caption, fontWeight: '700' },
});
