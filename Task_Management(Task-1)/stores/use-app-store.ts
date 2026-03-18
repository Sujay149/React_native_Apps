import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TaskFilter = 'all' | 'open' | 'done';
export type TaskStatus = 'open' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type LocationData = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  address?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  photos: string[]; // Array of photo URIs (up to 3)
  location?: LocationData;
  createdAt: string;
  updatedAt: string;
};

const normalizeTask = (task: Partial<Task>): Task => {
  const createdAt = task.createdAt ?? nowIso();
  return {
    id: task.id ?? createTaskId(),
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? (task.completed ? 'completed' : 'open'),
    priority: task.priority ?? 'medium',
    completed: Boolean(task.completed),
    photos: Array.isArray(task.photos) ? task.photos : [],
    location: task.location,
    createdAt,
    updatedAt: task.updatedAt ?? createdAt,
  };
};

type AppState = {
  isAuthenticated: boolean;
  userName: string;
  tasks: Task[];
  filter: TaskFilter;
  login: (userName: string) => void;
  logout: () => void;
  createTask: (
    title: string,
    description?: string,
    priority?: TaskPriority,
    location?: LocationData
  ) => void;
  updateTask: (
    id: string,
    changes: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addPhotoToTask: (taskId: string, photoUri: string) => void;
  removePhotoFromTask: (taskId: string, photoIndex: number) => void;
  updateTaskLocation: (taskId: string, location: LocationData) => void;
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

      createTask: (title, description = '', priority = 'medium', location) =>
        set((state) => ({
          tasks: [
            {
              id: createTaskId(),
              title,
              description,
              status: 'open',
              priority,
              completed: false,
              photos: [],
              location,
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
            ...state.tasks,
          ],
        })),

      updateTask: (id, changes) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) {
              return task;
            }

            const nextTask = {
              ...task,
              ...changes,
              updatedAt: nowIso(),
            };

            if (changes.status !== undefined) {
              nextTask.completed = changes.status === 'completed';
            } else if (changes.completed !== undefined) {
              nextTask.status = changes.completed ? 'completed' : 'open';
            }

            return nextTask;
          }),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  status: !task.completed ? 'completed' : 'open',
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      addPhotoToTask: (taskId, photoUri) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId && (task.photos?.length ?? 0) < 3
              ? {
                  ...task,
                  photos: [...(Array.isArray(task.photos) ? task.photos : []), photoUri],
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      removePhotoFromTask: (taskId, photoIndex) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  photos: (Array.isArray(task.photos) ? task.photos : []).filter(
                    (_, idx) => idx !== photoIndex,
                  ),
                  updatedAt: nowIso(),
                }
              : task,
          ),
        })),

      updateTaskLocation: (taskId, location) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  location,
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
      partialize: (state) => ({
        ...state,
        tasks: state.tasks.map((task) => normalizeTask(task)),
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AppState>) || {};
        return {
          ...currentState,
          ...persisted,
          tasks: Array.isArray(persisted.tasks)
            ? persisted.tasks.map((task) => normalizeTask(task as Partial<Task>))
            : currentState.tasks,
        };
      },
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
