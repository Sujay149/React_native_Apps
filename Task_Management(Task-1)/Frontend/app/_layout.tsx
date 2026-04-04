import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeMixpanel, trackEvent } from '@/utils/analytics';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const TextComponent = Text as unknown as {
      defaultProps?: { style?: unknown };
    };
    const TextInputComponent = TextInput as unknown as {
      defaultProps?: { style?: unknown };
    };

    TextComponent.defaultProps = TextComponent.defaultProps || {};
    TextComponent.defaultProps.style = [
      TextComponent.defaultProps.style,
      { fontFamily: 'PlusJakartaSans_400Regular' },
    ];

    TextInputComponent.defaultProps = TextInputComponent.defaultProps || {};
    TextInputComponent.defaultProps.style = [
      TextInputComponent.defaultProps.style,
      { fontFamily: 'PlusJakartaSans_400Regular' },
    ];
  }, []);

  useEffect(() => {
    const initializeAnalytics = async () => {
      // Initialize analytics client once when root layout mounts.
      await initializeMixpanel();
      await trackEvent('app_opened');
    };
    void initializeAnalytics();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
