import { Redirect, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackMapViewed } from '@/utils/analytics';

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
    #map { width: 100%; height: 100vh; }
    .info { padding: 6px 8px; background: white; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.2); font-size: 14px; line-height: 1.4; }
    .info h4 { margin: 0 0 5px 0; color: #0f766e; font-weight: 600; }
    .info-description { color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([20, 0], 2);
    const markerLayer = L.layerGroup().addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    window.addTaskMarker = function(task) {
      if (!task.location) return;
      
      const { latitude, longitude, address } = task.location;
      const marker = L.marker([latitude, longitude]).addTo(markerLayer);
      
      const popupContent = \`
        <div class="info">
          <h4>\${task.title}</h4>
          <div class="info-description">\${task.description || 'No description'}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #94a3b8;">
            🎯 \${address}<br>
            📊 \${task.status}
          </div>
        </div>
      \`;
      
      marker.bindPopup(popupContent);
    };

    window.updateMap = function(tasks) {
      markerLayer.clearLayers();
      const validTasks = tasks.filter(t => t && t.location && Number.isFinite(t.location.latitude) && Number.isFinite(t.location.longitude));
      validTasks.forEach(task => window.addTaskMarker(task));
      if (validTasks.length > 1) {
        map.fitBounds(validTasks.map(t => [t.location.latitude, t.location.longitude]), { padding: [24, 24] });
      } else if (validTasks.length === 1) {
        map.setView([validTasks[0].location.latitude, validTasks[0].location.longitude], 14);
      }
    };
  </script>
</body>
</html>
`;

export default function MapScreen() {
  const { hasHydrated } = useAppHydration();
  const { tasks, isAuthenticated } = useAppStore();
  const webViewRef = React.useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = React.useState(false);

  const tasksWithLocation = tasks.filter((task) => task.location);

  useFocusEffect(
    useCallback(() => {
      if (tasksWithLocation.length > 0) {
        trackMapViewed(tasksWithLocation.length);
      }
    }, [tasksWithLocation])
  );

  const injectTasksIntoMap = React.useCallback(() => {
    if (!webViewRef.current || !isMapReady) return;
    const js = `window.updateMap && window.updateMap(${JSON.stringify(tasksWithLocation)}); true;`;
    webViewRef.current.injectJavaScript(js);
  }, [isMapReady, tasksWithLocation]);

  React.useEffect(() => {
    injectTasksIntoMap();
  }, [injectTasksIntoMap]);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="mt-3 text-sm text-[#64748b]">Loading map...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <View className="border-b border-[#e2e8f0] px-4 py-3">
        <Text className="text-2xl font-bold text-[#0f172a]">Task Map</Text>
        <Text className="mt-1 text-sm text-[#64748b]">
          {tasksWithLocation.length} task{tasksWithLocation.length !== 1 ? 's' : ''} with location
        </Text>
      </View>

      {tasksWithLocation.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-base font-semibold text-[#0f172a]">No tasks with locations yet</Text>
          <Text className="mt-2 text-center text-sm text-[#64748b]">
            Add a location to your tasks to see them on the map
          </Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML }}
          style={{ flex: 1 }}
          onLoadEnd={() => setIsMapReady(true)}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 items-center justify-center bg-[#f8fafc]">
              <ActivityIndicator size="large" color="#0f766e" />
            </View>
          )}
          scrollEnabled={true}
          scalesPageToFit
        />
      )}
    </SafeAreaView>
  );
}
