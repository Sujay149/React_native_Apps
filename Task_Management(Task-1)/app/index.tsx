import { Redirect } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function IndexRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { hasHydrated } = useAppHydration();

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Preparing TaskTrack...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 16,
    color: '#334155',
  },
});