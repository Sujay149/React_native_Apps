// Analytics helper for development and production
// Mixpanel is optional - app works without it

let mixpanel: any = null;
let mixpanelInitialized = false;

export const initializeMixpanel = async () => {
  if (mixpanelInitialized) return;
  mixpanelInitialized = true;

  try {
    // Optional import - only load if available
    const { Mixpanel } = await import('mixpanel-react-native');
    if (Mixpanel) {
      mixpanel = new Mixpanel('fc1d8ea18b7cc8f3b1e7f4d9a2c5b6e9', false);
      await mixpanel.init();
      console.log('✅ Mixpanel initialized');
    }
  } catch (error) {
    console.log('ℹ️  Mixpanel not available (using console tracking instead)');
    mixpanel = null;
  }
};

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  const eventData = { ...properties, timestamp: new Date().toISOString() };

  // Try Mixpanel if available
  if (mixpanel) {
    try {
      await mixpanel.track(eventName, eventData);
    } catch (error) {
      // Silently fail
    }
  }

  // Always log for development
  console.log(`📊 [Analytics] ${eventName}`, eventData);
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
