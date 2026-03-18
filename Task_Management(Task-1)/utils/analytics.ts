// Analytics helper - uses console logging for development
// Mixpanel integration removed for Expo Go compatibility

export const initializeMixpanel = async () => {
  console.log('📊 Analytics logging initialized');
};

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  const eventData = { ...properties, timestamp: new Date().toISOString() };
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
