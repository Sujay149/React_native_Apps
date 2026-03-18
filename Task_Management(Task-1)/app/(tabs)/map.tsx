import { Redirect, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
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
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    window.addTaskMarker = function(task) {
      if (!task.location) return;
      
      const { latitude, longitude, address } = task.location;
      const marker = L.marker([latitude, longitude]).addTo(map);
      
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
      tasks.forEach(task => window.addTaskMarker(task));
      if (tasks.length > 0) {
        map.fitBounds(tasks
          .filter(t => t.location)
          .map(t => [t.location.latitude, t.location.longitude]));
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

  const tasksWithLocation = tasks.filter((task) => task.location);

  useFocusEffect(
    useCallback(() => {
      if (tasksWithLocation.length > 0) {
        trackMapViewed(tasksWithLocation.length);
      }
    }, [tasksWithLocation])
  );

  React.useEffect(() => {
    if (webViewRef.current && tasksWithLocation.length > 0) {
      const js = `window.updateMap(${JSON.stringify(tasksWithLocation)});`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [tasksWithLocation]);

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Map</Text>
        <Text style={styles.headerSubtitle}>
          {tasksWithLocation.length} task{tasksWithLocation.length !== 1 ? 's' : ''} with location
        </Text>
      </View>

      {tasksWithLocation.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks with locations yet</Text>
          <Text style={styles.emptySubtext}>
            Add a location to your tasks to see them on the map
          </Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
});
