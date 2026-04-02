import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { theme } from '@/constants/theme';

const createLeafletHtml = (latitude: number, longitude: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${latitude}, ${longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker([${latitude}, ${longitude}]).addTo(map);
  </script>
</body>
</html>
`;

export default function ReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const { hasHydrated } = useAppHydration();
  const { fieldReports, isAuthenticated } = useAppStore();

  const report = useMemo(() => fieldReports.find((item) => item.id === reportId), [fieldReports, reportId]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!hasHydrated || !report) {
    return (
      <View style={styles.loader}>
        <MaterialCommunityIcons name="file-document-alert-outline" size={34} color={theme.colors.textMuted} />
        <Text style={styles.loaderText}>Report not found.</Text>
      </View>
    );
  }

  const isPending = report.syncStatus === 'pending';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientC]}
        locations={[0, 0.45, 0.9]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Report Details' }} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Report</Text>
              </View>
              <View style={[styles.statusPill, isPending ? styles.statusPending : styles.statusSynced]}>
                <MaterialCommunityIcons name={isPending ? 'clock-outline' : 'check-circle-outline'} size={13} color={isPending ? '#B45309' : '#166534'} />
                <Text style={[styles.statusPillText, { color: isPending ? '#B45309' : '#166534' }]}>
                  {isPending ? 'Pending Sync' : 'Synced'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Field Report Details</Text>
            <Text style={styles.heroSub}>Submitted: {new Date(report.createdAt).toLocaleString()}</Text>
            {report.syncedAt ? <Text style={styles.heroSub}>Synced: {new Date(report.syncedAt).toLocaleString()}</Text> : null}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Site Details</Text>
            </View>
            <Text style={styles.metaText}>{report.siteName}</Text>
            <Text style={styles.metaText}>{report.contactPersonName} ({report.contactPhone})</Text>
            <Text style={styles.metaText}>{report.location.address ?? 'No address available'}</Text>
            <View style={styles.mapWrap}>
              <WebView source={{ html: createLeafletHtml(report.location.latitude, report.location.longitude) }} scrollEnabled={false} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="format-list-checks" size={18} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Checklist</Text>
            </View>
            <View style={styles.checklistWrap}>
              {report.checklist.map((item) => (
                <View key={item.id} style={styles.checkItem}>
                  <MaterialCommunityIcons
                    name={item.status === 'pass' ? 'check-circle-outline' : item.status === 'fail' ? 'alert-circle-outline' : 'minus-circle-outline'}
                    size={16}
                    color={item.status === 'pass' ? '#166534' : item.status === 'fail' ? '#DC2626' : '#64748B'}
                  />
                  <Text style={styles.checkItemText}>
                    {item.label}: {item.status.toUpperCase()} {item.status === 'fail' && item.failReason ? `- ${item.failReason}` : ''}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.obsLabel}>Observations</Text>
            <Text style={styles.obsText}>{report.observations || 'None'}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="camera-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Photos</Text>
            </View>
            <View style={styles.photosWrap}>
              {report.photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <Text style={styles.photoCaption}>{photo.caption || 'No caption'}</Text>
                  <Text style={styles.watermark} numberOfLines={2}>{photo.watermarkText}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="draw-pen" size={18} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Customer Signature</Text>
            </View>
            <Text style={styles.metaText}>{report.customerName}</Text>
            {report.signatureBase64 ? (
              <Image source={{ uri: report.signatureBase64 }} style={styles.signature} resizeMode="contain" />
            ) : (
              <Text style={styles.emptyText}>No signature image.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  safeArea: { flex: 1 },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: 8,
    paddingHorizontal: 16,
  },
  loaderText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 28, gap: 12 },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    padding: 16,
    ...theme.shadows.card,
  },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge: { backgroundColor: theme.colors.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusPending: { backgroundColor: theme.colors.warningSoft },
  statusSynced: { backgroundColor: theme.colors.successSoft },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 10 },
  heroSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 8,
    ...theme.shadows.soft,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  metaText: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  mapWrap: { marginTop: 4, height: 150, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  checklistWrap: { gap: 6 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  checkItemText: { flex: 1, fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  obsLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 2 },
  obsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    lineHeight: 18,
  },
  photosWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  photoCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 6,
  },
  photoImage: { width: '100%', height: 100, borderRadius: 10 },
  photoCaption: { marginTop: 4, fontSize: 11, color: theme.colors.textPrimary, fontWeight: '600' },
  watermark: { marginTop: 2, fontSize: 10, color: theme.colors.textMuted },
  signature: {
    width: '100%',
    height: 140,
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 4 },
});
