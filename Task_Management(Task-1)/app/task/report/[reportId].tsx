import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useAppHydration, useAppStore } from '@/stores/use-app-store';

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
      <View className="flex-1 items-center justify-center bg-[#f8fafc] px-4">
        <Text className="text-sm text-[#64748b]">Report not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <Stack.Screen options={{ title: 'Report Details' }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
          <Text className="text-sm font-semibold text-[#0f172a]">Status: {report.syncStatus.toUpperCase()}</Text>
          <Text className="mt-1 text-xs text-[#334155]">Submitted: {new Date(report.createdAt).toLocaleString()}</Text>
          {report.syncedAt ? <Text className="mt-1 text-xs text-[#334155]">Synced: {new Date(report.syncedAt).toLocaleString()}</Text> : null}
        </View>

        <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
          <Text className="text-sm font-semibold text-[#0f172a]">Site Details</Text>
          <Text className="mt-1 text-xs text-[#334155]">{report.siteName}</Text>
          <Text className="mt-1 text-xs text-[#334155]">{report.contactPersonName} ({report.contactPhone})</Text>
          <Text className="mt-1 text-xs text-[#334155]">{report.location.address ?? 'No address'}</Text>
          <View className="mt-2 h-[130px] overflow-hidden rounded-lg border border-[#dbe4ee]">
            <WebView source={{ html: createLeafletHtml(report.location.latitude, report.location.longitude) }} scrollEnabled={false} />
          </View>
        </View>

        <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
          <Text className="text-sm font-semibold text-[#0f172a]">Checklist</Text>
          {report.checklist.map((item) => (
            <Text key={item.id} className="mt-1 text-xs text-[#334155]">
              {item.label}: {item.status.toUpperCase()} {item.status === 'fail' && item.failReason ? `- ${item.failReason}` : ''}
            </Text>
          ))}
          <Text className="mt-2 text-xs text-[#334155]">Observations: {report.observations || 'None'}</Text>
        </View>

        <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
          <Text className="text-sm font-semibold text-[#0f172a]">Photos</Text>
          <View className="mt-2 flex-row flex-wrap justify-between">
            {report.photos.map((photo) => (
              <View key={photo.id} className="mb-2 w-[48%]">
                <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 95, borderRadius: 8 }} />
                <Text className="mt-1 text-[10px] text-[#334155]">{photo.caption}</Text>
                <Text className="text-[10px] text-[#64748b]" numberOfLines={2}>{photo.watermarkText}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-xl border border-[#dbe4ee] bg-white p-3">
          <Text className="text-sm font-semibold text-[#0f172a]">Customer Signature</Text>
          <Text className="mt-1 text-xs text-[#334155]">{report.customerName}</Text>
          {report.signatureBase64 ? (
            <Image source={{ uri: report.signatureBase64 }} style={{ width: '100%', height: 130 }} resizeMode="contain" />
          ) : (
            <Text className="mt-2 text-xs text-[#64748b]">No signature image.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
