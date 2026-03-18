import { Mixpanel } from 'mixpanel-react-native';

const MIXPANEL_TOKEN = 'fc1d8ea18b7cc8f3b1e7f4d9a2c5b6e9'; // Replace with your actual token

let mixpanel: Mixpanel | null = null;

export const initializeMixpanel = async () => {
  try {
    mixpanel = new Mixpanel(MIXPANEL_TOKEN, false);
    await mixpanel.init();
    console.log('Mixpanel initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Mixpanel:', error);
  }
};

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  if (!mixpanel) {
    console.warn('Mixpanel not initialized');
    return;
  }

  try {
    await mixpanel.track(eventName, properties || {});
    console.log(`Event tracked: ${eventName}`, properties);
  } catch (error) {
    console.error(`Failed to track event ${eventName}:`, error);
  }
};

export const trackTaskCreated = async (taskId: string, priority: string) => {
  await trackEvent('task_created', {
    task_id: taskId,
    priority,
    timestamp: new Date().toISOString(),
  });
};

export const trackTaskCompleted = async (taskId: string) => {
  await trackEvent('task_completed', {
    task_id: taskId,
    timestamp: new Date().toISOString(),
  });
};

export const trackPhotoAttached = async (taskId: string, photoCount: number) => {
  await trackEvent('photo_attached', {
    task_id: taskId,
    photo_count: photoCount,
    timestamp: new Date().toISOString(),
  });
};

export const trackLocationAdded = async (taskId: string, latitude: number, longitude: number) => {
  await trackEvent('location_added', {
    task_id: taskId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
  });
};

export const trackMapViewed = async (taskCount: number) => {
  await trackEvent('map_viewed', {
    task_count: taskCount,
    timestamp: new Date().toISOString(),
  });
};

export const trackProfileViewed = async (totalTasks: number, completedTasks: number) => {
  await trackEvent('profile_viewed', {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_rate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
    timestamp: new Date().toISOString(),
  });
};
