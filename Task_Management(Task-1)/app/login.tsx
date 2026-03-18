import { Redirect, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
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
      <View style={styles.centered}>
        <View style={styles.loadingDot} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}>

      {/* Decorative circles */}
      <View style={[styles.deco, styles.decoLarge]} pointerEvents="none" />
      <View style={[styles.deco, styles.decoSmall]} pointerEvents="none" />

      <Animated.View style={[styles.inner, { transform: [{ translateX: shakeAnim }] }]}>

        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <View style={styles.brandDiamond} />
          </View>
          <Text style={styles.brandName}>TaskTrack</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome back 👋</Text>
          <Text style={styles.heroSub}>Sign in to manage your tasks</Text>
        </View>

        {/* Storage warning */}
        {Platform.OS === 'web' && usedFallback ? (
          <View style={styles.warnBox}>
            <Text style={styles.warnIcon}>⚠</Text>
            <Text style={styles.warnText}>
              Storage unavailable — data may not persist in this session.
            </Text>
          </View>
        ) : null}

        {/* Name field */}
        <View style={styles.field}>
          <Text style={[styles.label, nameFocused && styles.labelFocused]}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={(v) => { setName(v); if (error) setError(''); }}
            style={[
              styles.input,
              nameFocused && styles.inputFocused,
              error && !name.trim() && styles.inputError,
            ]}
            placeholder="Your name"
            placeholderTextColor="#b0c9c2"
            autoCapitalize="words"
            returnKeyType="next"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        {/* Password field */}
        <View style={styles.field}>
          <Text style={[styles.label, passwordFocused && styles.labelFocused]}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
            style={[
              styles.input,
              passwordFocused && styles.inputFocused,
              error && password.trim().length < 4 && styles.inputError,
            ]}
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
          <View style={styles.errorRow}>
            <View style={styles.errorDot} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable
            style={styles.btn}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            <Text style={styles.btnText}>Sign In</Text>
            <View style={styles.btnArrow}>
              <Text style={styles.btnArrowText}>→</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Text style={styles.footerHint}>Use any valid name & password (4+ chars)</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const TEAL = '#1a9e7a';
const BG = '#eef4f0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    gap: 10,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  loadingText: {
    color: '#6b8f85',
    fontSize: 14,
    fontWeight: '600',
  },
  deco: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  decoLarge: {
    width: 160,
    height: 160,
    top: -50,
    right: -50,
    backgroundColor: 'rgba(26,158,122,0.07)',
    borderColor: 'rgba(26,158,122,0.12)',
  },
  decoSmall: {
    width: 90,
    height: 90,
    top: 28,
    right: 28,
    backgroundColor: 'rgba(26,158,122,0.04)',
    borderColor: 'rgba(26,158,122,0.09)',
  },
  inner: {
    gap: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  brandMark: {
    width: 36,
    height: 36,
    backgroundColor: TEAL,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandDiamond: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a2e2b',
    letterSpacing: -0.3,
  },
  hero: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a2e2b',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 14,
    color: '#6b8f85',
    fontWeight: '600',
    marginTop: 5,
  },
  warnBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderColor: '#f9d56e',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  warnIcon: {
    color: '#b45309',
    fontSize: 13,
    marginTop: 1,
  },
  warnText: {
    flex: 1,
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b8f85',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  labelFocused: {
    color: TEAL,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d4e5de',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    color: '#1a2e2b',
  },
  inputFocused: {
    borderColor: TEAL,
    backgroundColor: '#f7fdfb',
  },
  inputError: {
    borderColor: '#dc4c3e',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    marginTop: -6,
  },
  errorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#dc4c3e',
  },
  errorText: {
    color: '#dc4c3e',
    fontSize: 12,
    fontWeight: '700',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnArrowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#a0bcb6',
    fontWeight: '600',
    marginTop: 14,
    letterSpacing: 0.2,
  },
});