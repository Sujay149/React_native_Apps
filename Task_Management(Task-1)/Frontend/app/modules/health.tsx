import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function HealthServicesScreen() {
  const router = useRouter();

  const intakes = [
    {
      id: '1',
      patientName: 'Rajesh Sharma',
      serviceType: 'General Checkup',
      date: '2024-04-01',
      status: 'completed',
    },
    {
      id: '2',
      patientName: 'Priya Singh',
      serviceType: 'Blood Pressure Monitoring',
      date: '2024-03-31',
      status: 'pending',
    },
  ];

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
          <Text style={styles.headerTitle}>Health Services</Text>
          <View style={{ width: 24 }} />
        </View>

        <Pressable style={styles.addBtn}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>New Intake</Text>
        </Pressable>

        <View style={styles.list}>
          {intakes.map((item) => (
            <View key={item.id} style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>{item.patientName}</Text>
                <Text style={styles.cardSub}>{item.serviceType}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      item.status === 'completed'
                        ? theme.colors.successSoft
                        : theme.colors.warningSoft,
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        item.status === 'completed'
                          ? theme.colors.success
                          : theme.colors.warning,
                    },
                  ]}>
                  {item.status === 'completed' ? 'Done' : 'Pending'}
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
    backgroundColor: theme.colors.success,
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
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  cardTitle: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: theme.typography.caption, fontWeight: '600' },
});
