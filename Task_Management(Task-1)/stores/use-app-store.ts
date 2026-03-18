import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TaskFilter = 'all' | 'open' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type AppState = {
  isAuthenticated: boolean;
  userName: string;
  tasks: Task[];
  filter: TaskFilter;
  login: (userName: string) => void;
  logout: () => void;
  createTask: (title: string, description?: string) => void;
  updateTask: (id: string, changes: Partial<Pick<Task, 'title' | 'description'>>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
};

const nowIso = () => new Date().toISOString();

const createTaskId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: '',
      tasks: [],
      filter: 'all',

      login: (userName) => set({ isAuthenticated: true, userName }),

      logout: () =>
        set({
          isAuthenticated: false,
          userName: '',
          filter: 'all',
        }),

      createTask: (title, description = '') =>
        set((state) => ({
          tasks: [
            {
              id: createTaskId(),
              title,
              description,
              completed: false,
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
            ...state.tasks,
          ],
        })),

      updateTask: (id, changes) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...changes,
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'tasktrack-app-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useAppHydration() {
  const [hasHydrated, setHasHydrated] = useState(useAppStore.persist.hasHydrated());
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribeHydrate = useAppStore.persist.onHydrate(() => {
      setHasHydrated(false);
    });

    const unsubscribeFinishHydration = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    const ensureHydration = async () => {
      if (useAppStore.persist.hasHydrated()) {
        if (isMounted) {
          setHasHydrated(true);
        }
        return;
      }

      try {
        await Promise.race([
          useAppStore.persist.rehydrate(),
          new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);
        if (isMounted && !useAppStore.persist.hasHydrated()) {
          setUsedFallback(true);
        }
      } catch {
        if (isMounted) {
          setUsedFallback(true);
        }
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    };

    ensureHydration();

    return () => {
      isMounted = false;
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  return { hasHydrated, usedFallback };
}
