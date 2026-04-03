import { Platform } from 'react-native';
import Constants from 'expo-constants';

type ApiErrorShape = {
  message?: string;
  error?: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  employeeId?: string;
  age?: number;
  gender?: string;
  category?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
};

const configuredBaseUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();

const getExpoHostIp = () => {
  const constantsRecord = Constants as unknown as Record<string, unknown>;
  const expoConfig = (constantsRecord.expoConfig as Record<string, unknown> | undefined) ?? {};
  const manifest2 = (constantsRecord.manifest2 as Record<string, unknown> | undefined) ?? {};
  const manifest = (constantsRecord.manifest as Record<string, unknown> | undefined) ?? {};

  const hostUri =
    (expoConfig.hostUri as string | undefined) ??
    ((manifest2.extra as Record<string, unknown> | undefined)?.expoGo as Record<string, unknown> | undefined)
      ?.debuggerHost as string | undefined ??
    (manifest.debuggerHost as string | undefined);

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  if (!host) {
    return null;
  }

  return host;
};

const getDefaultBaseUrl = () => {
  const expoHostIp = getExpoHostIp();
  if (expoHostIp) {
    return `http://${expoHostIp}:8080`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  return 'http://localhost:8080';
};

export const BACKEND_BASE_URL = (configuredBaseUrl || getDefaultBaseUrl()).replace(/\/$/, '');

const getErrorMessage = (data: unknown, status: number) => {
  if (data && typeof data === 'object') {
    const body = data as ApiErrorShape;
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
  }

  return `Request failed with status ${status}`;
};

const postJson = async <T>(path: string, payload: unknown): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    console.warn('[Auth API] Network request failed', {
      path,
      baseUrl: BACKEND_BASE_URL,
    });
    throw new Error('Unable to connect. Please try again in a moment.');
  }

  const responseText = await response.text();
  let parsed: unknown = null;

  if (responseText) {
    try {
      parsed = JSON.parse(responseText) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed, response.status));
  }

  return parsed as T;
};

export const signupUser = (payload: SignupRequest) => {
  return postJson('/auth/signup', payload);
};

export const loginUser = (payload: LoginRequest) => {
  return postJson<LoginResponse>('/auth/login', payload);
};
