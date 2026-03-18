import Constants from 'expo-constants';

const MIXPANEL_TOKEN = 'fc1d8ea18b7cc8f3b1e7f4d9a2c5b6e9';
const MAX_DEBUG_EVENTS = 100;

type EventProps = Record<string, unknown>;
export type AnalyticsDebugEvent = {
  id: string;
  eventName: string;
  properties: EventProps;
  createdAt: string;
};

type MixpanelClient = {
  init: () => Promise<void>;
  track: (eventName: string, properties?: EventProps) => void | Promise<void>;
};

let mixpanel: MixpanelClient | null = null;
let initialized = false;
let debugEvents: AnalyticsDebugEvent[] = [];
const debugListeners = new Set<(events: AnalyticsDebugEvent[]) => void>();

const isExpoGo = () => Constants.appOwnership === 'expo';
const notifyDebugListeners = () => {
  const snapshot = [...debugEvents];
  debugListeners.forEach((listener) => listener(snapshot));
};

const addDebugEvent = (eventName: string, properties: EventProps) => {
  const createdAt = new Date().toISOString();
  const event: AnalyticsDebugEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    eventName,
    properties,
    createdAt,
  };

  debugEvents = [event, ...debugEvents].slice(0, MAX_DEBUG_EVENTS);
  notifyDebugListeners();
};

export const getAnalyticsDebugEvents = () => [...debugEvents];

export const subscribeAnalyticsDebugEvents = (
  listener: (events: AnalyticsDebugEvent[]) => void,
) => {
  debugListeners.add(listener);
  listener([...debugEvents]);

  return () => {
    debugListeners.delete(listener);
  };
};

export const clearAnalyticsDebugEvents = () => {
  debugEvents = [];
  notifyDebugListeners();
};

export const initializeMixpanel = async () => {
  if (initialized) return;
  initialized = true;

  if (isExpoGo()) {
    console.log('[Analytics] Expo Go detected, using console logging only.');
    return;
  }

  try {
    const { Mixpanel } = await import('mixpanel-react-native');
    const client = new Mixpanel(MIXPANEL_TOKEN, false) as MixpanelClient;
    await client.init();
    mixpanel = client;
    console.log('[Analytics] Mixpanel initialized.');
  } catch (error) {
    console.log('[Analytics] Mixpanel unavailable, using console logging only.', error);
    mixpanel = null;
  }
};

export const trackEvent = async (eventName: string, properties?: EventProps) => {
  const eventData = { ...properties, timestamp: new Date().toISOString() };
  addDebugEvent(eventName, eventData);

  if (mixpanel) {
    try {
      await mixpanel.track(eventName, eventData);
    } catch (error) {
      console.log('[Analytics] Track failed, event kept in console only.', error);
    }
  }

  console.log(`[Analytics] ${eventName}`, eventData);
};

export const trackTaskCreated = (taskId: string, priority: string) => {
  trackEvent('task_created', { task_id: taskId, priority });
};

export const trackTaskCompleted = (taskId: string) => {
  trackEvent('task_completed', { task_id: taskId });
};

export const trackPhotoAttached = (taskId: string, photoCount: number) => {
  trackEvent('photo_attached', { task_id: taskId, photo_count: photoCount });
};

export const trackLocationAdded = (taskId: string, latitude: number, longitude: number) => {
  trackEvent('location_added', { task_id: taskId, latitude, longitude });
};

export const trackMapViewed = (taskCount: number) => {
  trackEvent('map_viewed', { task_count: taskCount });
};

export const trackProfileViewed = (totalTasks: number, completedTasks: number) => {
  trackEvent('profile_viewed', {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_rate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
  });
};
