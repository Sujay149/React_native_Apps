import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearAnalyticsUser, setAnalyticsUser, trackLoginSuccess, trackLogout } from '@/utils/analytics';

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

export type ChecklistStatus = 'pass' | 'fail' | 'na';

export type FieldReportChecklistItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  failReason?: string;
};

export type FieldReportPhoto = {
  id: string;
  uri: string;
  caption: string;
  createdAt: string;
  watermarkText: string;
};

export type FieldReportSyncStatus = 'pending' | 'synced';

export type FieldReport = {
  id: string;
  taskId: string;
  siteName: string;
  contactPersonName: string;
  contactPhone: string;
  location: LocationData;
  checklist: FieldReportChecklistItem[];
  observations: string;
  photos: FieldReportPhoto[];
  customerName: string;
  signatureBase64: string;
  syncStatus: FieldReportSyncStatus;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FieldReportDraft = {
  taskId: string;
  currentStep: 1 | 2 | 3 | 4 | 5;
  siteName: string;
  contactPersonName: string;
  contactPhone: string;
  location?: LocationData;
  checklist: FieldReportChecklistItem[];
  observations: string;
  photos: FieldReportPhoto[];
  customerName: string;
  signatureBase64: string;
};

const defaultChecklist = (): FieldReportChecklistItem[] => [
  { id: 'equipment-working', label: 'Equipment working', status: 'na' },
  { id: 'safety-gear', label: 'Safety gear present', status: 'na' },
  { id: 'site-clean', label: 'Site clean', status: 'na' },
];

const createDefaultDraft = (taskId: string): FieldReportDraft => ({
  taskId,
  currentStep: 1,
  siteName: '',
  contactPersonName: '',
  contactPhone: '',
  checklist: defaultChecklist(),
  observations: '',
  photos: [],
  customerName: '',
  signatureBase64: '',
});

const nowIso = () => new Date().toISOString();

const createTaskId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const createFieldReportId = () => `fr-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const normalizeChecklist = (items?: FieldReportChecklistItem[]) =>
  Array.isArray(items)
    ? items.map((item) => ({
        id: item.id,
        label: item.label,
        status: item.status ?? 'na',
        failReason: item.failReason ?? '',
      }))
    : defaultChecklist();

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

const normalizeFieldReport = (report: Partial<FieldReport>): FieldReport => {
  const createdAt = report.createdAt ?? nowIso();
  return {
    id: report.id ?? createFieldReportId(),
    taskId: report.taskId ?? '',
    siteName: report.siteName ?? '',
    contactPersonName: report.contactPersonName ?? '',
    contactPhone: report.contactPhone ?? '',
    location: report.location ?? {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    checklist: normalizeChecklist(report.checklist),
    observations: report.observations ?? '',
    photos: Array.isArray(report.photos) ? report.photos : [],
    customerName: report.customerName ?? '',
    signatureBase64: report.signatureBase64 ?? '',
    syncStatus: report.syncStatus ?? 'pending',
    syncedAt: report.syncedAt,
    createdAt,
    updatedAt: report.updatedAt ?? createdAt,
  };
};

const normalizeDraft = (draft: Partial<FieldReportDraft>): FieldReportDraft => {
  const base = createDefaultDraft(draft.taskId ?? '');
  return {
    ...base,
    ...draft,
    currentStep:
      draft.currentStep && [1, 2, 3, 4, 5].includes(draft.currentStep)
        ? draft.currentStep
        : 1,
    checklist: normalizeChecklist(draft.checklist),
    photos: Array.isArray(draft.photos) ? draft.photos : [],
  };
};

type AppState = {
  isAuthenticated: boolean;
  userName: string;
  tasks: Task[];
  fieldReports: FieldReport[];
  fieldReportDraft: FieldReportDraft | null;
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
  startFieldReportDraft: (taskId: string) => void;
  updateFieldReportDraft: (changes: Partial<FieldReportDraft>) => void;
  updateDraftChecklistItem: (
    itemId: string,
    status: ChecklistStatus,
    failReason?: string
  ) => void;
  addDraftPhoto: (photo: Omit<FieldReportPhoto, 'id' | 'createdAt'>) => void;
  updateDraftPhotoCaption: (photoId: string, caption: string) => void;
  removeDraftPhoto: (photoId: string) => void;
  clearFieldReportDraft: () => void;
  submitFieldReportFromDraft: () => FieldReport | null;
  markPendingReportsSynced: () => void;
  setFilter: (filter: TaskFilter) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: '',
      tasks: [],
      fieldReports: [],
      fieldReportDraft: null,
      filter: 'all',

      login: (userName) => {
        const trimmedUser = userName.trim();
        const analyticsUserId = trimmedUser.toLowerCase().replace(/\s+/g, '_');

        void setAnalyticsUser(analyticsUserId, trimmedUser);
        trackLoginSuccess(trimmedUser);

        set({ isAuthenticated: true, userName: trimmedUser });
      },

      logout: () =>
        set((state) => {
          if (state.userName) {
            trackLogout(state.userName);
          }
          void clearAnalyticsUser();

          return {
            isAuthenticated: false,
            userName: '',
            filter: 'all',
          };
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

      startFieldReportDraft: (taskId) =>
        set((state) => ({
          fieldReportDraft:
            state.fieldReportDraft?.taskId === taskId
              ? state.fieldReportDraft
              : createDefaultDraft(taskId),
        })),

      updateFieldReportDraft: (changes) =>
        set((state) => {
          if (!state.fieldReportDraft) {
            return state;
          }

          return {
            fieldReportDraft: {
              ...state.fieldReportDraft,
              ...changes,
            },
          };
        }),

      updateDraftChecklistItem: (itemId, status, failReason = '') =>
        set((state) => {
          if (!state.fieldReportDraft) {
            return state;
          }

          return {
            fieldReportDraft: {
              ...state.fieldReportDraft,
              checklist: state.fieldReportDraft.checklist.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status,
                      failReason: status === 'fail' ? failReason : '',
                    }
                  : item,
              ),
            },
          };
        }),

      addDraftPhoto: (photo) =>
        set((state) => {
          if (!state.fieldReportDraft || state.fieldReportDraft.photos.length >= 5) {
            return state;
          }

          return {
            fieldReportDraft: {
              ...state.fieldReportDraft,
              photos: [
                ...state.fieldReportDraft.photos,
                {
                  ...photo,
                  id: `photo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                  createdAt: nowIso(),
                },
              ],
            },
          };
        }),

      updateDraftPhotoCaption: (photoId, caption) =>
        set((state) => {
          if (!state.fieldReportDraft) {
            return state;
          }

          return {
            fieldReportDraft: {
              ...state.fieldReportDraft,
              photos: state.fieldReportDraft.photos.map((photo) =>
                photo.id === photoId ? { ...photo, caption } : photo,
              ),
            },
          };
        }),

      removeDraftPhoto: (photoId) =>
        set((state) => {
          if (!state.fieldReportDraft) {
            return state;
          }

          return {
            fieldReportDraft: {
              ...state.fieldReportDraft,
              photos: state.fieldReportDraft.photos.filter((photo) => photo.id !== photoId),
            },
          };
        }),

      clearFieldReportDraft: () => set({ fieldReportDraft: null }),

      submitFieldReportFromDraft: () => {
        let createdReport: FieldReport | null = null;

        set((state) => {
          const draft = state.fieldReportDraft;
          if (!draft || !draft.taskId || !draft.location) {
            return state;
          }

          createdReport = normalizeFieldReport({
            taskId: draft.taskId,
            siteName: draft.siteName,
            contactPersonName: draft.contactPersonName,
            contactPhone: draft.contactPhone,
            location: draft.location,
            checklist: draft.checklist,
            observations: draft.observations,
            photos: draft.photos,
            customerName: draft.customerName,
            signatureBase64: draft.signatureBase64,
            syncStatus: 'pending',
          });

          return {
            fieldReports: [createdReport, ...state.fieldReports],
            fieldReportDraft: null,
            tasks: state.tasks.map((task) =>
              task.id === draft.taskId
                ? {
                    ...task,
                    status: 'completed',
                    completed: true,
                    updatedAt: nowIso(),
                  }
                : task,
            ),
          };
        });

        return createdReport;
      },

      markPendingReportsSynced: () =>
        set((state) => ({
          fieldReports: state.fieldReports.map((report) =>
            report.syncStatus === 'pending'
              ? {
                  ...report,
                  syncStatus: 'synced',
                  syncedAt: nowIso(),
                  updatedAt: nowIso(),
                }
              : report,
          ),
        })),

      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'tasktrack-app-state',
      storage: createJSONStorage(() => {
        if (Platform.OS === 'web') {
          // SSR safety: window is not defined during Expo static pre-rendering
          if (typeof window === 'undefined') {
            const mem: Record<string, string> = {};
            return {
              getItem: async (name: string) => mem[name] ?? null,
              setItem: async (name: string, value: string) => {
                mem[name] = value;
              },
              removeItem: async (name: string) => {
                delete mem[name];
              },
            };
          }
          // Use localStorage directly (synchronous) so onFinishHydration fires immediately
          return {
            getItem: async (name: string) => window.localStorage.getItem(name),
            setItem: async (name: string, value: string) => {
              window.localStorage.setItem(name, value);
            },
            removeItem: async (name: string) => {
              window.localStorage.removeItem(name);
            },
          };
        }
        return AsyncStorage;
      }),
      partialize: (state) => ({
        ...state,
        tasks: state.tasks.map((task) => normalizeTask(task)),
        fieldReports: state.fieldReports.map((report) => normalizeFieldReport(report)),
        fieldReportDraft: state.fieldReportDraft ? normalizeDraft(state.fieldReportDraft) : null,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AppState>) || {};
        return {
          ...currentState,
          ...persisted,
          tasks: Array.isArray(persisted.tasks)
            ? persisted.tasks.map((task) => normalizeTask(task as Partial<Task>))
            : currentState.tasks,
          fieldReports: Array.isArray(persisted.fieldReports)
            ? persisted.fieldReports.map((report) => normalizeFieldReport(report as Partial<FieldReport>))
            : currentState.fieldReports,
          fieldReportDraft: persisted.fieldReportDraft
            ? normalizeDraft(persisted.fieldReportDraft as Partial<FieldReportDraft>)
            : currentState.fieldReportDraft,
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

    // On web with synchronous localStorage, hydration is instant.
    // If already hydrated just update the state and bail out early.
    if (useAppStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    const unsubscribeHydrate = useAppStore.persist.onHydrate(() => {
      if (isMounted) setHasHydrated(false);
    });

    const unsubscribeFinishHydration = useAppStore.persist.onFinishHydration(() => {
      if (isMounted) setHasHydrated(true);
    });

    // Hard-cap fallback: never stay stuck longer than 500ms
    const hardCapTimer = setTimeout(() => {
      if (isMounted) {
        setUsedFallback(true);
        setHasHydrated(true);
      }
    }, 500);

    const ensureHydration = async () => {
      try {
        await Promise.race([
          useAppStore.persist.rehydrate(),
          new Promise((resolve) => setTimeout(resolve, 400)),
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

    void ensureHydration();

    return () => {
      isMounted = false;
      clearTimeout(hardCapTimer);
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  return { hasHydrated, usedFallback };
}
