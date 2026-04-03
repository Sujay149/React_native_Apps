'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'REGIONAL' | 'CLUSTER' | 'COORDINATOR' | 'SUPERVISOR' | 'STAFF' | 'USER';

export type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId?: string;
  age?: number;
  gender?: string;
  category?: string;
  role: UserRole;
  createdAt: string;
};

type AppState = {
  isAuthenticated: boolean;
  user: UserData | null;
  authToken: string;
  
  login: (user: UserData, authToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserData>) => void;
  setAuthToken: (token: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      authToken: '',

      login: (user, authToken) => {
        set({
          isAuthenticated: true,
          user,
          authToken,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          authToken: '',
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setAuthToken: (token) => {
        set({ authToken: token });
      },
    }),
    {
      name: 'tasktrack-app-state',
      storage: createJSONStorage(() => {
        // Use localStorage for persistence
        if (typeof window !== 'undefined') {
          return {
            getItem: (name: string) => {
              try {
                const item = window.localStorage.getItem(name);
                return item ? item : null;
              } catch {
                return null;
              }
            },
            setItem: (name: string, value: string) => {
              try {
                window.localStorage.setItem(name, value);
              } catch {
                // Handle quota exceeded or other errors silently
              }
            },
            removeItem: (name: string) => {
              try {
                window.localStorage.removeItem(name);
              } catch {
                // Handle errors silently
              }
            },
          };
        }
        // Fallback for SSR
        const mem: Record<string, string> = {};
        return {
          getItem: (name: string) => mem[name] ?? null,
          setItem: (name: string, value: string) => {
            mem[name] = value;
          },
          removeItem: (name: string) => {
            delete mem[name];
          },
        };
      }),
    }
  )
);
