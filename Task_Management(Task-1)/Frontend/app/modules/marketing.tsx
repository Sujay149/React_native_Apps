import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function MarketingScreen() {
  const router = useRouter();

  const leads = [
    {
      id: '1',
      name: 'Mr. Patel',
      product: 'Health Insurance',
      status: 'strong',
      date: '2024-03-31',
    },
    {
      id: '2',
      name: 'Mrs. Verma',
      product: 'Life Insurance',
      status: 'medium',
      date: '2024-03-30',
    },
    {
      id: '3',
      name: 'Mr. Gupta',
      product: 'Investment Plan',
      status: 'weak',
      date: '2024-03-29',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strong':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'weak':
        return theme.colors.danger;
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
          <Text style={styles.headerTitle}>Marketing</Text>
          <View style={{ width: 24 }} />
        </View>

        <Pressable style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>New Lead</Text>
        </Pressable>

        <View style={styles.list}>
          {leads.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardProduct}>{item.product}</Text>
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
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
    backgroundColor: theme.colors.warning,
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
  cardTitle: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardProduct: {
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
