import { Redirect, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackEvent } from '@/utils/analytics';
import { loginUser, signupUser } from '@/utils/auth-api';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const { hasHydrated } = useAppHydration();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isCompactLayout = height < 860 || mode === 'signup';

  // Fade-in on mount
  useRef(
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true, delay: 100 }).start()
  );

  const validateEmail = (value: string) => /.+@.+\..+/.test(value);

  const handleAuth = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (mode === 'signup' && !trimmedName) {
      setError('Please enter your full name.');
      trackEvent('user_signup_failed', { reason: 'missing_name' });
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email.');
      trackEvent(mode === 'login' ? 'user_login_failed' : 'user_signup_failed', {
        reason: 'missing_email',
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      trackEvent(mode === 'login' ? 'user_login_failed' : 'user_signup_failed', {
        reason: 'invalid_email',
      });
      return;
    }

    if (mode === 'signup' && !trimmedPhone) {
      setError('Please enter your phone number.');
      trackEvent('user_signup_failed', { reason: 'missing_phone' });
      return;
    }

    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      trackEvent(mode === 'login' ? 'user_login_failed' : 'user_signup_failed', {
        reason: 'short_password',
      });
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      trackEvent('user_signup_failed', { reason: 'password_mismatch' });
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        await signupUser({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          password,
        });
      }

      const auth = await loginUser({
        email: trimmedEmail,
        password,
      });

      login(trimmedEmail, auth.accessToken);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      trackEvent(mode === 'login' ? 'user_login_failed' : 'user_signup_failed', {
        reason: message,
      });
      return;
    } finally {
      setIsSubmitting(false);
    }

    trackEvent(mode === 'login' ? 'user_login_success' : 'user_signup_success', {
      email: trimmedEmail,
    });
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
            contentContainerStyle={[styles.scroll, isCompactLayout && styles.scrollCompact]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
              
              {/* App Icon */}
              <View style={[styles.iconContainer, isCompactLayout && styles.iconContainerCompact]}>
                 <View style={styles.appIcon}>
                    <Image
                     source={require('../assets/images/logo.png')}
                     style={styles.appLogo}
                     resizeMode="contain"
                    />
                 </View>
              </View>

              {/* Hero */}
              <View style={[styles.hero, isCompactLayout && styles.heroCompact]}>
                <Text style={styles.heroTitle}>Get Started Today</Text>
                <Text style={styles.heroSub}>Login or create your account to sync with BackendTask.</Text>
              </View>

              <View style={styles.modeSwitchRow}>
                <Pressable
                  onPress={() => {
                    setMode('login');
                    setError('');
                  }}
                  style={[styles.modeSwitchButton, mode === 'login' && styles.modeSwitchButtonActive]}>
                  <Text style={[styles.modeSwitchText, mode === 'login' && styles.modeSwitchTextActive]}>Log In</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMode('signup');
                    setError('');
                  }}
                  style={[styles.modeSwitchButton, mode === 'signup' && styles.modeSwitchButtonActive]}>
                  <Text style={[styles.modeSwitchText, mode === 'signup' && styles.modeSwitchTextActive]}>Sign Up</Text>
                </Pressable>
              </View>

              {mode === 'signup' ? (
                <View style={[styles.fieldGroup, isCompactLayout && styles.fieldGroupCompact]}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={20}
                      color="#94A3B8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={name}
                      onChangeText={(v: string) => {
                        setName(v);
                        if (error) setError('');
                      }}
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#A1A1AA"
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              ) : null}

              {/* Email Field */}
              <View style={[styles.fieldGroup, isCompactLayout && styles.fieldGroupCompact]}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color="#94A3B8"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={(v: string) => {
                      setEmail(v);
                      if (error) setError('');
                    }}
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#A1A1AA"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {mode === 'signup' ? (
                <View style={[styles.fieldGroup, isCompactLayout && styles.fieldGroupCompact]}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={20}
                      color="#94A3B8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={phone}
                      onChangeText={(v: string) => {
                        setPhone(v);
                        if (error) setError('');
                      }}
                      style={styles.input}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#A1A1AA"
                      keyboardType="phone-pad"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              ) : null}

              {/* Password Field */}
              <View style={[styles.fieldGroup, isCompactLayout && styles.fieldGroupCompact]}>
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
                    onChangeText={(v: string) => {
                      setPassword(v);
                      if (error) setError('');
                    }}
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleAuth}
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

              {mode === 'signup' ? (
                <View style={[styles.fieldGroup, isCompactLayout && styles.fieldGroupCompact]}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons
                      name="lock-check-outline"
                      size={20}
                      color="#94A3B8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(v: string) => {
                        setConfirmPassword(v);
                        if (error) setError('');
                      }}
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#A1A1AA"
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleAuth}
                    />
                  </View>
                </View>
              ) : null}

              {mode === 'login' ? (
                <View style={[styles.optionsRow, isCompactLayout && styles.optionsRowCompact]}>
                  <View style={styles.checkboxRow}>
                    <View style={styles.checkbox}></View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </View>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </View>
              ) : null}

              {/* Inline error */}
              {error ? (
                <View style={styles.errorRow}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Continue Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 10 }}>
                <Pressable
                  onPress={handleAuth}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isSubmitting}
                  style={[styles.btn, isSubmitting && styles.btnDisabled]}>
                  <Text style={styles.btnText}>{isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}</Text>
                </Pressable>
              </Animated.View>

              <Pressable
                onPress={() => {
                  setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
                  setError('');
                }}
                style={styles.switchAuthModeLink}>
                <Text style={styles.switchAuthModeText}>
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                </Text>
              </Pressable>

                <View style={[styles.orContainer, isCompactLayout && styles.orContainerCompact]}>
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
              
              <Text style={[styles.footerText, isCompactLayout && styles.footerTextCompact]}>
                By tapping Continue, you agree to our{"\n"}
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
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 32 },
  scrollCompact: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  container: { flex: 1, justifyContent: 'flex-start', paddingTop: 8 },
  
  iconContainer: {
     alignItems: 'center',
     marginBottom: 30,
  },
  iconContainerCompact: {
    marginBottom: 16,
  },
  appIcon: {
      width: 50,
      height: 90,
     alignItems: 'center',
     justifyContent: 'center',
  },
    appLogo: {
      width: '100%',
      height: '100%',
  },

  hero: { marginBottom: 36, alignItems: 'center' },
  heroCompact: { marginBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', letterSpacing: -0.5, marginBottom: 8 },
  heroSub: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },

  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  modeSwitchButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  modeSwitchButtonActive: {
    backgroundColor: '#1E1B4B',
  },
  modeSwitchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modeSwitchTextActive: {
    color: '#FFFFFF',
  },

  fieldGroup: { marginBottom: 16 },
  fieldGroupCompact: { marginBottom: 12 },
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
  optionsRowCompact: { marginBottom: 16 },
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
  btnDisabled: {
    opacity: 0.65,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  switchAuthModeLink: {
    alignItems: 'center',
    marginTop: 14,
  },
  switchAuthModeText: {
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '700',
  },

  orContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  orContainerCompact: { marginVertical: 20 },
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
  },
  footerTextCompact: {
    marginTop: 20,
  },
});
