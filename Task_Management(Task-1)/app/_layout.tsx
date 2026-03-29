import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeMixpanel, trackEvent } from '@/utils/analytics';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initializeAnalytics = async () => {
      // Initialize analytics client once when root layout mounts.
      await initializeMixpanel();
      await trackEvent('app_opened');
    };

    void initializeAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="task/field-report" options={{ headerShown: false }} />
          <Stack.Screen name="task/report/[reportId]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" backgroundColor="#F8F9FF" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
