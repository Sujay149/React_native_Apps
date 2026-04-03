import { Redirect, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackEvent } from '@/utils/analytics';
import { loginUser, signupUser } from '@/utils/auth-api';

type AuthMode = 'login' | 'signup';
type SignupStep = 1 | 2 | 3;

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAppStore((state) => state.login);
  const { hasHydrated } = useAppHydration();

  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');
  const [village, setVillage] = useState('');
  const [mandal, setMandal] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true, delay: 100 }).start();
  }, [fadeAnim]);

  const validateEmail = (value: string) => /.+@.+\..+/.test(value);

  const validateStep1 = (): boolean => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return false;
    }

    if (!trimmedEmail) {
      setError('Please enter your email.');
      return false;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!trimmedPhone) {
      setError('Please enter your phone number.');
      return false;
    }

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID.');
      return false;
    }
    if (!age.trim()) {
      setError('Please enter your age.');
      return false;
    }
    if (!gender) {
      setError('Please select your gender.');
      return false;
    }
    if (!category) {
      setError('Please select your service category.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!state.trim()) {
      setError('Please enter your state.');
      return false;
    }
    if (!district.trim()) {
      setError('Please enter your district.');
      return false;
    }
    if (!mandal.trim()) {
      setError('Please enter your mandal.');
      return false;
    }
    if (!village.trim()) {
      setError('Please enter your village.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (signupStep === 1 && validateStep1()) {
      setSignupStep(2);
    } else if (signupStep === 2 && validateStep2()) {
      setSignupStep(3);
    }
  };

  const handlePrevStep = () => {
    if (signupStep > 1) {
      setSignupStep((prev) => (prev - 1) as SignupStep);
      setError('');
    }
  };

  const handleAuth = async () => {
    if (mode === 'login') {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !validateEmail(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.trim().length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setError('');
      setIsSubmitting(true);

      try {
        const auth = await loginUser({
          email: trimmedEmail,
          password,
        });

        login(trimmedEmail, auth.accessToken);
        router.replace('/(tabs)');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        trackEvent('user_login_failed', { reason: message });
      } finally {
        setIsSubmitting(false);
      }

      trackEvent('user_login_success', { email: trimmedEmail });
    } else {
      // Signup mode - validate step 3 and submit
      if (!validateStep3()) return;

      setError('');
      setIsSubmitting(true);

      try {
        await signupUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          employeeId: employeeId.trim(),
          age: parseInt(age, 10),
          gender,
          category,
          state: state.trim(),
          district: district.trim(),
          mandal: mandal.trim(),
          village: village.trim(),
        });

        const auth = await loginUser({
          email: email.trim().toLowerCase(),
          password,
        });

        login(email.trim().toLowerCase(), auth.accessToken);
        router.replace('/(tabs)');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        trackEvent('user_signup_failed', { reason: message });
      } finally {
        setIsSubmitting(false);
      }

      trackEvent('user_signup_success', { email: email.trim().toLowerCase() });
    }
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
                    <Image
                     source={require('../assets/images/logo.png')}
                     style={styles.appLogo}
                     resizeMode="contain"
                    />
                 </View>
              </View>

              {/* Hero */}
              <View style={styles.hero}>
                <Text style={styles.heroTitle}>Get Started Today</Text>
                <Text style={styles.heroSub}>Login or create your account to sync with BackendTask.</Text>
              </View>

              <View style={styles.modeSwitchRow}>
                <Pressable
                  onPress={() => {
                    setMode('login');
                    setSignupStep(1);
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

              {mode === 'signup' && (
                <View style={styles.stepIndicator}>
                  {[1, 2, 3].map((step) => (
                    <View key={step} style={[styles.stepDot, step <= signupStep && styles.stepDotActive]} />
                  ))}
                  <Text style={styles.stepText}>Step {signupStep} of 3</Text>
                </View>
              )}

              {mode === 'signup' ? (
                <>
                  {signupStep === 1 && (
                    <>
                      <View style={styles.fieldGroup}>
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

                      <View style={styles.fieldGroup}>
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
                            onChangeText={(v: string) => {
                              setPassword(v);
                              if (error) setError('');
                            }}
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Enter your password"
                            placeholderTextColor="#A1A1AA"
                            secureTextEntry={!showPassword}
                            returnKeyType="next"
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

                      <View style={styles.fieldGroup}>
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
                          />
                        </View>
                      </View>
                    </>
                  )}

                  {signupStep === 2 && (
                    <>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Employee ID</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="identifier"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={employeeId}
                            onChangeText={(v: string) => {
                              setEmployeeId(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter employee ID"
                            placeholderTextColor="#A1A1AA"
                            returnKeyType="next"
                          />
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Age</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="cake-variant-outline"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={age}
                            onChangeText={(v: string) => {
                              setAge(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter your age"
                            placeholderTextColor="#A1A1AA"
                            keyboardType="numeric"
                            returnKeyType="next"
                          />
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Gender</Text>
                        <View style={styles.genderRow}>
                          {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                            <Pressable
                              key={g}
                              onPress={() => {
                                setGender(g);
                                if (error) setError('');
                              }}
                              style={[
                                styles.genderBtn,
                                gender === g && styles.genderBtnActive,
                              ]}>
                              <Text style={[
                                styles.genderText,
                                gender === g && styles.genderTextActive,
                              ]}>
                                {g.charAt(0) + g.slice(1).toLowerCase()}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Service Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                          {['Home Care', 'Marketing', 'Security', 'Health', 'Education'].map((cat) => (
                            <Pressable
                              key={cat}
                              onPress={() => {
                                setCategory(cat);
                                if (error) setError('');
                              }}
                              style={[
                                styles.categoryBtn,
                                category === cat && styles.categoryBtnActive,
                              ]}>
                              <Text style={[
                                styles.categoryText,
                                category === cat && styles.categoryTextActive,
                              ]}>
                                {cat}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </>
                  )}

                  {signupStep === 3 && (
                    <>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>State</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="map-outline"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={state}
                            onChangeText={(v: string) => {
                              setState(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter your state"
                            placeholderTextColor="#A1A1AA"
                            returnKeyType="next"
                          />
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>District</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="map-outline"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={district}
                            onChangeText={(v: string) => {
                              setDistrict(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter your district"
                            placeholderTextColor="#A1A1AA"
                            returnKeyType="next"
                          />
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Mandal</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="map-outline"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={mandal}
                            onChangeText={(v: string) => {
                              setMandal(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter your mandal"
                            placeholderTextColor="#A1A1AA"
                            returnKeyType="next"
                          />
                        </View>
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Village</Text>
                        <View style={styles.inputWrap}>
                          <MaterialCommunityIcons
                            name="home-outline"
                            size={20}
                            color="#94A3B8"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            value={village}
                            onChangeText={(v: string) => {
                              setVillage(v);
                              if (error) setError('');
                            }}
                            style={styles.input}
                            placeholder="Enter your village"
                            placeholderTextColor="#A1A1AA"
                            returnKeyType="done"
                          />
                        </View>
                      </View>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Email Field for Login */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email or Employee ID</Text>
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
                        placeholder="Enter your email or employee ID"
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
                </>
              )}

              {mode === 'login' ? (
                <View style={styles.optionsRow}>
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
              {mode === 'signup' && signupStep < 3 ? (
                <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 10 }}>
                  <Pressable
                    onPress={handleNextStep}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[styles.btn]}>
                    <Text style={styles.btnText}>Next</Text>
                  </Pressable>
                </Animated.View>
              ) : (
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
              )}

              {mode === 'signup' && signupStep > 1 && (
                <Pressable
                  onPress={handlePrevStep}
                  style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </Pressable>
              )}

              {(mode === 'login' || signupStep === 1) && (
                <Pressable
                  onPress={() => {
                    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
                    setSignupStep(1);
                    setError('');
                  }}
                  style={styles.switchAuthModeLink}>
                  <Text style={styles.switchAuthModeText}>
                    {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                  </Text>
                </Pressable>
              )}

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
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 40 },
  container: { flex: 1, justifyContent: 'center', paddingTop: 20 },
  
  iconContainer: {
     alignItems: 'center',
     marginBottom: 30,
  },
  appIcon: {
      width: 50,
      height: 150,
     alignItems: 'center',
     justifyContent: 'center',
  },
    appLogo: {
      width: '100%',
      height: '100%',
  },

  hero: { marginBottom: 36, alignItems: 'center' },
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

  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#1E1B4B',
  },
  stepText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 12,
  },

  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderBtnActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#1E1B4B',
  },
  genderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  genderTextActive: {
    color: '#FFFFFF',
  },

  categoryScroll: {
    flexGrow: 0,
  },
  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#1E1B4B',
    borderColor: '#1E1B4B',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  secondaryBtn: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
  },
});
