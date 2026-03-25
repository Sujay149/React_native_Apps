import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function IndexRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const { hasHydrated, usedFallback } = useAppHydration();

  // Debug log hydration state
  if (typeof window !== 'undefined') {
    console.log('[TaskTrack] Hydration state:', { hasHydrated, usedFallback });
  }

  if (!hasHydrated && !usedFallback) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <Text className="text-base text-[#334155]">Preparing TaskTrack...</Text>
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}