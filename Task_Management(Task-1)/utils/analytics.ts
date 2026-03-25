import Constants from 'expo-constants';
import { loadMixpanel } from './mixpanel-loader';

const EXPO_EXTRA = (Constants.expoConfig?.extra ?? {}) as { mixpanelToken?: string };
const MIXPANEL_TOKEN = EXPO_EXTRA.mixpanelToken?.trim() ?? '';
const MAX_DEBUG_EVENTS = 100;
const MIXPANEL_HTTP_ENDPOINT = 'https://api.mixpanel.com/track?verbose=1';
const MIXPANEL_ENGAGE_HTTP_ENDPOINT = 'https://api.mixpanel.com/engage?verbose=1';

type EventProps = Record<string, unknown>;
type PendingEvent = {
  eventName: string;
  properties: EventProps;
};

export type AnalyticsDebugEvent = {
  id: string;
  eventName: string;
  properties: EventProps;
  createdAt: string;
};

type MixpanelClient = {
  init: () => Promise<void>;
  track: (eventName: string, properties?: EventProps) => void | Promise<void>;
  identify?: (distinctId: string) => void | Promise<void>;
  reset?: () => void | Promise<void>;
  registerSuperProperties?: (properties: EventProps) => void | Promise<void>;
  getPeople?: () => {
    set?: (properties: EventProps) => void | Promise<void>;
  };
};

let mixpanel: MixpanelClient | null = null;
let initialized = false;
let analyticsDisabledReason: string | null = null;
let debugEvents: AnalyticsDebugEvent[] = [];
let pendingEvents: PendingEvent[] = [];
let anonymousDistinctId = `anon_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
let superProperties: EventProps = {
  platform: Constants.platform?.ios ? 'ios' : Constants.platform?.android ? 'android' : 'web',
  app_version: Constants.expoConfig?.version ?? 'unknown',
};
let currentUserId: string | null = null;
let currentUserName = '';
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

const getDistinctId = () => {
  return currentUserId ?? anonymousDistinctId;
};

const callMixpanelMethod = async <T = unknown>(
  methodName: string,
  ...args: unknown[]
): Promise<T | undefined> => {
  if (!mixpanel) return undefined;

  const method = (mixpanel as unknown as Record<string, unknown>)[methodName];
  if (typeof method !== 'function') {
    return undefined;
  }

  try {
    return (await (method as (...methodArgs: unknown[]) => unknown)(...args)) as T;
  } catch (error) {
    console.log(`[Analytics] ${methodName} failed.`, error);
    return undefined;
  }
};

const flushPendingEvents = async () => {
  if (!mixpanel || pendingEvents.length === 0) {
    return;
  }

  const eventsToFlush = [...pendingEvents];
  pendingEvents = [];

  await Promise.all(
    eventsToFlush.map(async ({ eventName, properties }) => {
      await callMixpanelMethod('track', eventName, properties);
    }),
  );
};

const sendEventViaHttp = async (eventName: string, properties: EventProps) => {
  if (!MIXPANEL_TOKEN) {
    return false;
  }

  const payload = [
    {
      event: eventName,
      properties: {
        token: MIXPANEL_TOKEN,
        distinct_id: getDistinctId(),
        time: Math.floor(Date.now() / 1000),
        ...properties,
      },
    },
  ];

  try {
    const response = await fetch(MIXPANEL_HTTP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    console.log('[Analytics] HTTP fallback track failed.', error);
    return false;
  }
};

const sendUserProfileViaHttp = async (userId: string, userName: string) => {
  if (!MIXPANEL_TOKEN) {
    return false;
  }

  const payload = [
    {
      $token: MIXPANEL_TOKEN,
      $distinct_id: userId,
      $set: {
        $name: userName,
        name: userName,
        last_login_at: new Date().toISOString(),
      },
    },
  ];

  try {
    const response = await fetch(MIXPANEL_ENGAGE_HTTP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return true;
  } catch (error) {
    console.log('[Analytics] HTTP user profile set failed.', error);
    return false;
  }
};

const applyUserContext = async () => {
  if (!mixpanel || !currentUserId) {
    return;
  }

  await callMixpanelMethod('identify', currentUserId);

  const people = mixpanel.getPeople?.();
  if (people?.set) {
    await people.set({
      name: currentUserName,
      last_login_at: new Date().toISOString(),
    });
  }
};

export const initializeMixpanel = async () => {
  if (initialized) return;
  initialized = true;

  if (!MIXPANEL_TOKEN) {
    analyticsDisabledReason = 'Missing Mixpanel token';
    console.log('[Analytics] Missing Mixpanel token, using console logging only.');
    return;
  }

  if (isExpoGo()) {
    analyticsDisabledReason = 'Expo Go native SDK unavailable';
    console.log('[Analytics] Expo Go detected, using HTTP fallback tracking.');
    return;
  }

  try {
    const Mixpanel = await loadMixpanel();
    if (!Mixpanel) throw new Error('Mixpanel SDK not available on this platform');
    const client = new Mixpanel(MIXPANEL_TOKEN, false) as MixpanelClient;
    await client.init();
    mixpanel = client;

    await callMixpanelMethod('registerSuperProperties', superProperties);
    await applyUserContext();
    await flushPendingEvents();

    console.log('[Analytics] Mixpanel initialized.');
  } catch (error) {
    analyticsDisabledReason = 'Mixpanel init failed';
    console.log('[Analytics] Mixpanel unavailable, using console logging only.', error);
    mixpanel = null;
  }
};

export const registerAnalyticsSuperProperties = async (properties: EventProps) => {
  superProperties = { ...superProperties, ...properties };

  if (mixpanel) {
    await callMixpanelMethod('registerSuperProperties', superProperties);
  }
};

export const setAnalyticsUser = async (userId: string, userName?: string) => {
  currentUserId = userId;
  currentUserName = userName ?? currentUserName;

  await registerAnalyticsSuperProperties({
    user_id: userId,
    user_name: currentUserName,
  });

  if (!mixpanel && MIXPANEL_TOKEN) {
    await sendUserProfileViaHttp(userId, currentUserName || 'User');
  }

  await applyUserContext();
};

export const clearAnalyticsUser = async () => {
  currentUserId = null;
  currentUserName = '';
  anonymousDistinctId = `anon_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  superProperties = {
    platform: superProperties.platform,
    app_version: superProperties.app_version,
  };

  if (mixpanel) {
    await callMixpanelMethod('reset');
    await callMixpanelMethod('registerSuperProperties', superProperties);
  }
};

export const trackEvent = async (eventName: string, properties?: EventProps) => {
  const analyticsMode = mixpanel ? 'mixpanel' : MIXPANEL_TOKEN ? 'mixpanel_http' : 'console';

  const eventData = {
    ...superProperties,
    ...properties,
    timestamp: new Date().toISOString(),
    analytics_mode: analyticsMode,
    analytics_disabled_reason: MIXPANEL_TOKEN ? analyticsDisabledReason : 'Missing Mixpanel token',
  };

  addDebugEvent(eventName, eventData);

  if (mixpanel) {
    await callMixpanelMethod('track', eventName, eventData);
  } else if (MIXPANEL_TOKEN) {
    const wasSent = await sendEventViaHttp(eventName, eventData);
    if (!wasSent) {
      pendingEvents = [{ eventName, properties: eventData }, ...pendingEvents].slice(0, MAX_DEBUG_EVENTS);
    }
  } else {
    pendingEvents = [{ eventName, properties: eventData }, ...pendingEvents].slice(0, MAX_DEBUG_EVENTS);
  }

  console.log(`[Analytics] ${eventName}`, eventData);
};

export const trackLoginSuccess = (userName: string) => {
  trackEvent('user_login_success', { user_name: userName });
};

export const trackLogout = (userName: string) => {
  trackEvent('user_logout', { user_name: userName });
};

export const trackTaskCreated = (taskId: string, priority: string) => {
  trackEvent('task_created', { task_id: taskId, priority });
};

export const trackTaskCompleted = (taskId: string) => {
  trackEvent('task_completed', { task_id: taskId });
};

export const trackTaskModified = (taskId: string, modifiedFields: string[]) => {
  trackEvent('task_modified', {
    task_id: taskId,
    modified_fields: modifiedFields,
    modified_fields_count: modifiedFields.length,
  });
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

export const trackFieldReportCreated = (taskId: string, checklistFailedCount: number, photoCount: number) => {
  trackEvent('field_report_created', {
    task_id: taskId,
    checklist_failed_count: checklistFailedCount,
    photo_count: photoCount,
  });
};

export const trackFieldReportSynced = (syncedCount: number) => {
  trackEvent('field_report_synced', {
    synced_count: syncedCount,
  });
};
