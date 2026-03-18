import { Redirect } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import {
  AnalyticsDebugEvent,
  clearAnalyticsDebugEvents,
  subscribeAnalyticsDebugEvents,
} from '@/utils/analytics';

export default function AnalyticsScreen() {
  const { hasHydrated } = useAppHydration();
  const { isAuthenticated } = useAppStore();
  const [events, setEvents] = useState<AnalyticsDebugEvent[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeAnalyticsDebugEvents(setEvents);
    return unsubscribe;
  }, []);

  const totalCount = useMemo(() => events.length, [events.length]);

  if (!hasHydrated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helperText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Analytics Debug</Text>
          <Text style={styles.subtitle}>{totalCount} event{totalCount === 1 ? '' : 's'}</Text>
        </View>
        <Pressable style={styles.clearButton} onPress={clearAnalyticsDebugEvents}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptySubtitle}>
              Trigger actions like create task, complete task, add photo, map view, and profile view.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const propertiesText = JSON.stringify(item.properties, null, 2);

          return (
            <View style={styles.eventCard}>
              <Text style={styles.eventName}>{item.eventName}</Text>
              <Text style={styles.eventTime}>{item.createdAt}</Text>
              <Text style={styles.eventProps}>{propertiesText}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  clearButton: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  eventTime: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  eventProps: {
    marginTop: 8,
    fontSize: 12,
    color: '#334155',
    fontFamily: 'monospace',
  },
});
