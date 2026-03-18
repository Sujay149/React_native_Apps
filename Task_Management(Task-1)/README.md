# TaskTrack Mobile App

TaskTrack is an Expo + React Native task tracking app with local persistence and clean global state management.

## Features

- Dummy login screen with validation
- Task list with create, edit, delete, complete, and filter actions
- Task detail screen for drill-down editing
- Profile screen with task summary and logout
- Tab navigation for main sections (Tasks, Profile)
- Stack navigation for drill-down screen (Task Detail)
- Zustand store for auth and task state
- AsyncStorage persistence (state survives app restart)
- Pull-to-refresh on task list

## Tech Stack

- Expo Router
- React Navigation (tabs + stack via file-based routes)
- Zustand
- AsyncStorage

## Run the App

1. Install dependencies:

```bash
npm install
```

2. Start the app and open on Android:

```bash
npx expo start --android
```

If a real Android phone is used, make sure USB debugging is enabled and the device is connected.

## Project Structure

- `app/login.tsx`: Login screen
- `app/(tabs)/index.tsx`: Task list screen
- `app/task/[id].tsx`: Task detail screen
- `app/(tabs)/profile.tsx`: Profile screen
- `stores/use-app-store.ts`: Zustand + AsyncStorage state

## Assignment Summary (Simple 2-Line Points)

1. Expo setup
We built the app using Expo SDK 54 with Expo Router, so setup and run are simple on Android.
This gives fast development, easy device testing, and a clean project structure.

2. 4 screens with tab + stack navigation
We created Login, Task List, Task Detail, and Profile screens as required.
Tabs handle main sections, and stack route opens Task Detail from the task list.

3. Full CRUD with Zustand + AsyncStorage
We used Zustand for app state and actions like create, update, delete, and complete task.
AsyncStorage persistence keeps all tasks and login state after app restart.

4. Task fields implementation
Each task stores title, description, status, priority, location, and photos.
This model is centralized in the store so all screens use the same data structure.

5. Photo integration (expo-image-picker)
We added camera and gallery options in Task Detail using expo-image-picker.
Photo count is limited to 3 per task, with preview and remove support.

6. Location integration (expo-location)
We capture GPS coordinates and try reverse geocoding for readable address text.
If geocoding is unavailable, we safely fall back to latitude/longitude display.

7. Leaflet map in WebView
We built a Map tab using Leaflet inside react-native-webview.
All tasks with location are shown as markers with popup details.

8. Mixpanel tracking (5-6 key events)
We track task_created, task_completed, photo_attached, location_added, map_viewed, and profile_viewed.
In Expo Go we use safe fallback logging; in app builds Mixpanel sends real events.

9. Working Android task goal
Users can create tasks, attach photos, add location, view markers on map, and edit task data.
All data persists locally, so the app remains usable and consistent after restart.

10. Approach and logic used
We used modular utilities (image/location/analytics), plus a single source of truth store.
This keeps code clean, handles edge cases, and makes features easy to test and extend.
