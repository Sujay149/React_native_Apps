import { Redirect, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const { hasHydrated, usedFallback } = useAppHydration();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    if (!name.trim()) {
      setError('Name is required.');
      triggerShake();
      return;
    }
    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      triggerShake();
      return;
    }
    login(name.trim());
    router.replace('/(tabs)');
  };

  const handlePressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View className="flex-1 items-center justify-center gap-[10px] bg-[#eef4f0]">
        <View className="h-2 w-2 rounded-full bg-[#1a9e7a]" />
        <Text className="text-sm font-semibold text-[#6b8f85]">Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      className="flex-1 justify-center bg-[#eef4f0] px-6 py-8">

      {/* Decorative circles */}
      <View
        className="absolute -right-[50px] -top-[50px] h-[160px] w-[160px] rounded-full border-[1.5px] border-[rgba(26,158,122,0.12)] bg-[rgba(26,158,122,0.07)]"
        pointerEvents="none"
      />
      <View
        className="absolute right-7 top-7 h-[90px] w-[90px] rounded-full border-[1.5px] border-[rgba(26,158,122,0.09)] bg-[rgba(26,158,122,0.04)]"
        pointerEvents="none"
      />

      <Animated.View className="gap-0" style={{ transform: [{ translateX: shakeAnim }] }}>

        {/* Brand */}
        <View className="mb-7 flex-row items-center gap-[10px]">
          <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#1a9e7a]">
            <View className="h-[14px] w-[14px] rounded-[3px] bg-white" style={{ transform: [{ rotate: '45deg' }] }} />
          </View>
          <Text className="text-[18px] font-extrabold tracking-[-0.3px] text-[#1a2e2b]">TaskTrack</Text>
        </View>

        {/* Hero */}
        <View className="mb-6">
          <Text className="text-[28px] font-extrabold leading-[34px] tracking-[-0.5px] text-[#1a2e2b]">Welcome back 👋</Text>
          <Text className="mt-[5px] text-sm font-semibold text-[#6b8f85]">Sign in to manage your tasks</Text>
        </View>

        {/* Storage warning */}
        {Platform.OS === 'web' && usedFallback ? (
          <View className="mb-[14px] flex-row items-start gap-2 rounded-xl border border-[#f9d56e] bg-[#fffbeb] p-[10px]">
            <Text className="mt-px text-[13px] text-[#b45309]">⚠</Text>
            <Text className="flex-1 text-xs font-semibold leading-[17px] text-[#92400e]">
              Storage unavailable — data may not persist in this session.
            </Text>
          </View>
        ) : null}

        {/* Name field */}
        <View className="mb-[14px]">
          <Text className={`mb-[5px] text-[11px] font-bold tracking-[0.8px] ${nameFocused ? 'text-[#1a9e7a]' : 'text-[#6b8f85]'}`}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={(v) => { setName(v); if (error) setError(''); }}
            className={`rounded-xl border-[1.5px] px-[14px] py-[13px] text-[15px] font-semibold text-[#1a2e2b] ${nameFocused ? 'border-[#1a9e7a] bg-[#f7fdfb]' : 'border-[#d4e5de] bg-white'} ${error && !name.trim() ? 'border-[#dc4c3e]' : ''}`}
            placeholder="Your name"
            placeholderTextColor="#b0c9c2"
            autoCapitalize="words"
            returnKeyType="next"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        {/* Password field */}
        <View className="mb-[14px]">
          <Text className={`mb-[5px] text-[11px] font-bold tracking-[0.8px] ${passwordFocused ? 'text-[#1a9e7a]' : 'text-[#6b8f85]'}`}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
            className={`rounded-xl border-[1.5px] px-[14px] py-[13px] text-[15px] font-semibold text-[#1a2e2b] ${passwordFocused ? 'border-[#1a9e7a] bg-[#f7fdfb]' : 'border-[#d4e5de] bg-white'} ${error && password.trim().length < 4 ? 'border-[#dc4c3e]' : ''}`}
            placeholder="Min. 4 characters"
            placeholderTextColor="#b0c9c2"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </View>

        {/* Error */}
        {error ? (
          <View className="-mt-[6px] mb-2 flex-row items-center gap-[5px]">
            <View className="h-[5px] w-[5px] rounded-[3px] bg-[#dc4c3e]" />
            <Text className="text-xs font-bold text-[#dc4c3e]">{error}</Text>
          </View>
        ) : null}

        {/* Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            className="mt-1 flex-row items-center justify-center gap-[10px] rounded-xl bg-[#1a9e7a] py-[14px]"
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            <Text className="text-[15px] font-extrabold tracking-[0.2px] text-white">Sign In</Text>
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[rgba(0,0,0,0.12)]">
              <Text className="text-sm font-extrabold text-white">→</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Text className="mt-[14px] text-center text-[11px] font-semibold tracking-[0.2px] text-[#a0bcb6]">Use any valid name & password (4+ chars)</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
