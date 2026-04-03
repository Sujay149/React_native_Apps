'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, signupUser, type SignupRequest, type LoginRequest } from '@/utils/auth-api';
import { useAppStore } from '@/stores/use-app-store';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';
type SignupStep = 1 | 2 | 3;

const CATEGORIES = ['Home Care', 'Marketing', 'Security', 'Health', 'Education'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
  }

  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Step 1 fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Signup Step 2 fields
  const [employeeId, setEmployeeId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [category, setCategory] = useState('');

  // Signup Step 3 fields
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = (): boolean => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError('');
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return false;
    }
    if (!age.trim()) {
      setError('Please enter your age');
      return false;
    }
    if (!gender) {
      setError('Please select your gender');
      return false;
    }
    if (!category) {
      setError('Please select your service category');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setError('');
    if (!state.trim()) {
      setError('Please enter your state');
      return false;
    }
    if (!district.trim()) {
      setError('Please enter your district');
      return false;
    }
    if (!mandal.trim()) {
      setError('Please enter your mandal');
      return false;
    }
    if (!village.trim()) {
      setError('Please enter your village');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email or employee ID');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // TODO: Parse the response and extract user data properly
      login(
        {
          id: '1',
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          phone: '',
          role: 'STAFF',
          createdAt: new Date().toISOString(),
        },
        response.accessToken
      );

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const signupData: SignupRequest = {
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
      };

      await signupUser(signupData);

      // Now login with the credentials
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      login(
        {
          id: '1',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          employeeId: employeeId.trim(),
          age: parseInt(age, 10),
          gender,
          category,
          role: 'STAFF',
          createdAt: new Date().toISOString(),
        },
        response.accessToken
      );

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-8">
      {/* Logo / Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">TaskTrack</h1>
        <p className="text-text-muted text-sm">Field Operations Management System</p>
      </div>

      {/* Mode Switch */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setMode('login');
            setSignupStep(1);
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2 rounded-md font-medium transition-smooth ${
            mode === 'login'
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-white'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-2 rounded-md font-medium transition-smooth ${
            mode === 'signup'
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Step Indicator for Signup */}
      {mode === 'signup' && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-smooth ${
                  step <= signupStep
                    ? 'bg-primary text-white'
                    : 'bg-border text-text-muted'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-1 mx-1 transition-smooth ${
                    step < signupStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
          <span className="text-sm text-text-muted ml-2">
            Step {signupStep} of 3
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-danger-soft border border-danger rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-success-soft border border-success rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-success text-sm">{success}</p>
        </div>
      )}

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email or Employee ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your email or employee ID"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      )}

      {/* Signup Form - Step 1 */}
      {mode === 'signup' && signupStep === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your password (min 6 characters)"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-smooth"
          >
            Next
          </button>
        </form>
      )}

      {/* Signup Form - Step 2 */}
      {mode === 'signup' && signupStep === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your employee ID"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your age"
              min="18"
              max="100"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGender(g);
                    if (error) setError('');
                  }}
                  className={`py-2 rounded-lg border font-medium transition-smooth ${
                    gender === g
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-secondary hover:border-primary'
                  }`}
                >
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Service Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (error) setError('');
                  }}
                  className={`py-2 px-2 rounded-lg border text-sm font-medium transition-smooth ${
                    category === cat
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-text-secondary hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 py-2 border border-border text-primary rounded-lg font-medium hover:bg-primary-soft transition-smooth"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-smooth"
            >
              Next
            </button>
          </div>
        </form>
      )}

      {/* Signup Form - Step 3 */}
      {mode === 'signup' && signupStep === 3 && (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your state"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your district"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Mandal
            </label>
            <input
              type="text"
              value={mandal}
              onChange={(e) => {
                setMandal(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your mandal"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Village
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => {
                setVillage(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your village"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 py-2 border border-border text-primary rounded-lg font-medium hover:bg-primary-soft transition-smooth"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
