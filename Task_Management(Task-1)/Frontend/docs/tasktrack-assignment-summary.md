# TaskTrack Assignment Summary

This file provides a concise summary of each assignment requirement and the approach used to implement it. Each point is explained in simple words, two lines per feature.

1. Expo setup
I built the app using Expo SDK 54 with Expo Router, so setup and run are simple on Android.
This gives fast development, easy device testing, and a clean project structure.

2. 4 screens with tab + stack navigation
I created Login, Task List, Task Detail, and Profile screens as required.
Tabs handle main sections, and stack route opens Task Detail from the task list.

3. Full CRUD with Zustand + AsyncStorage
I used Zustand for app state and actions like create, update, delete, and complete task.
AsyncStorage persistence keeps all tasks and login state after app restart.

4. Task fields implementation
Each task stores title, description, status, priority, location, and photos.
This model is centralized in the store so all screens use the same data structure.

5. Photo integration (expo-image-picker)
I added camera and gallery options in Task Detail using expo-image-picker.
Photo count is limited to 3 per task, with preview and remove support.

6. Location integration (expo-location)
I capture GPS coordinates and try reverse geocoding for readable address text.
If geocoding is unavailable, I safely fall back to latitude/longitude display.

7. Leaflet map in IbView
I built a Map tab using Leaflet inside react-native-Ibview.
All tasks with location are shown as markers with popup details.

8. Mixpanel tracking (5-6 key events)
I track task_created, task_completed, photo_attached, location_added, map_vieId, and profile_vieId.
In Expo Go I use safe fallback logging; in app builds Mixpanel sends real events.

9. Working Android task goal
Users can create tasks, attach photos, add location, view markers on map, and edit task data.
All data persists locally, so the app remains usable and consistent after restart.

10. Approach and logic used
I used modular utilities (image/location/analytics), plus a single source of truth store.
This keeps code clean, handles edge cases, and makes features easy to test and extend.
