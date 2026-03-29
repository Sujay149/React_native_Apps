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
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackEvent } from '@/utils/analytics';

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const { hasHydrated, usedFallback } = useAppHydration();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in on mount
  useRef(
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true, delay: 100 }).start()
  );

  const handleLogin = () => {
    if (!name.trim()) {
      setError('Please enter your email/name.');
      trackEvent('user_login_failed', { reason: 'missing_name' });
      return;
    }
    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      trackEvent('user_login_failed', { reason: 'short_password' });
      return;
    }
    login(name.trim());
    router.replace('/(tabs)');
  };

  const handlePressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#E5DCFA', '#F7E7EF', '#FFFFFF']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
              
              {/* App Icon */}
              <View style={styles.iconContainer}>
                 <View style={styles.appIcon}>
                    <Text style={styles.appIconText}>A</Text>
                 </View>
              </View>

              {/* Hero */}
              <View style={styles.hero}>
                <Text style={styles.heroTitle}>Get Started Today</Text>
                <Text style={styles.heroSub}>Sign up in just a few steps and take control of your field.</Text>
              </View>

              {/* Name Field (Labeled as Email in design) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color="#94A3B8"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={name}
                    onChangeText={(v) => { setName(v); if (error) setError(''); }}
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#A1A1AA"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color="#94A3B8"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10} style={{ paddingHorizontal: 10 }}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox}></View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </View>

              {/* Inline error */}
              {error ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Continue Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 10 }}>
                <Pressable
                  onPress={handleLogin}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.btn}>
                  <Text style={styles.btnText}>Continue</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.orContainer}>
                 <View style={styles.orLine} />
                 <Text style={styles.orText}>or</Text>
                 <View style={styles.orLine} />
              </View>

              <View style={styles.socialRow}>
                 <Pressable style={styles.socialBtn}>
                    <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                    <Text style={styles.socialBtnText}>Google</Text>
                 </Pressable>
                 <Pressable style={styles.socialBtn}>
                    <MaterialCommunityIcons name="apple" size={20} color="#000" />
                    <Text style={styles.socialBtnText}>Apple</Text>
                 </Pressable>
              </View>
              
              <Text style={styles.footerText}>
                By tapping "Continue", you agree to our{"\n"}
                <Text style={{fontWeight: '700', color: '#1E1B4B'}}>Privacy Policy & Terms of Service</Text>
              </Text>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1A1D28' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 40 },
  container: { flex: 1, justifyContent: 'center', paddingTop: 20 },
  
  iconContainer: {
     alignItems: 'center',
     marginBottom: 30,
  },
  appIcon: {
     width: 56,
     height: 56,
     backgroundColor: '#1E1B4B',
     borderRadius: 16,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#000',
     shadowOpacity: 0.1,
     shadowOffset: { width: 0, height: 10 },
     shadowRadius: 20,
     elevation: 5,
  },
  appIconText: {
     color: '#FA6EA0',
     fontSize: 28,
     fontWeight: '800',
  },

  hero: { marginBottom: 36, alignItems: 'center' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13, fontWeight: '700', color: '#1E1B4B',
    marginBottom: 8, paddingLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#F1F5F9',
    paddingHorizontal: 16, height: 56,
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E1B4B' },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E1', marginRight: 8 },
  rememberText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  forgotText: { fontSize: 13, color: '#1E1B4B', fontWeight: '700' },

  errorRow: { marginBottom: 12, alignItems: 'center' },
  errorText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },

  btn: {
    backgroundColor: '#1C1C28',
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1C28', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  orContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  orText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, marginHorizontal: 16, fontWeight: '500' },

  socialRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  socialBtn: {
     flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
     height: 52, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  socialBtnText: { fontSize: 14, fontWeight: '600', color: '#1E1B4B' },

  footerText: {
     marginTop: 40,
     textAlign: 'center',
     fontSize: 11,
     fontWeight: '500',
     color: '#94A3B8',
     lineHeight: 18,
  }
});
