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

const getDefaultBaseUrl = () => {
  // For server-side, use the backend URL from env
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  }
  // For client-side, use the public env var
  return (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
};

export const BACKEND_BASE_URL = getDefaultBaseUrl();

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
