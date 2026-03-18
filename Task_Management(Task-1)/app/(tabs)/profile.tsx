import { Redirect, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackProfileViewed } from '@/utils/analytics';

export default function ProfileScreen() {
  const router = useRouter();
  const { hasHydrated, usedFallback } = useAppHydration();
  const { isAuthenticated, userName, tasks, logout } = useAppStore();

  const doneCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - doneCount;
  const inProgressCount = tasks.filter((task) => task.status === 'in-progress').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const photosCount = tasks.reduce((sum, task) => sum + (task.photos?.length || 0), 0);
  const locationsCount = tasks.filter((task) => task.location).length;

  useFocusEffect(
    useCallback(() => {
      trackProfileViewed(tasks.length, doneCount);
    }, [tasks.length, doneCount])
  );

  if (!hasHydrated && Platform.OS !== 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#0f766e" />
        <Text className="mt-2 text-sm text-[#64748b]">Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: '#f8fafc' }}>
        {Platform.OS === 'web' && usedFallback ? (
          <View className="rounded-[10px] border border-[#facc15] bg-[#fef9c3] p-[10px]">
            <Text className="text-xs font-medium text-[#713f12]">
              Storage is unavailable in this browser session. Data may not persist.
            </Text>
          </View>
        ) : null}

        <View className="items-center py-4">
          <View className="mb-3">
            <MaterialCommunityIcons name="account-circle" size={60} color="#0f766e" />
          </View>
          <Text className="text-2xl font-bold text-[#0f172a]">{userName || 'User'}</Text>
          <Text className="mt-1 text-sm text-[#64748b]">Task Manager</Text>
        </View>

        {/* Statistics Overview */}
        <View className="flex-row flex-wrap justify-between gap-3">
          <View className="w-[48%] items-center gap-1.5 rounded-xl bg-[#dcfce7] p-3">
            <MaterialCommunityIcons name="check-circle" size={28} color="#16a34a" />
            <Text className="text-[20px] font-bold text-[#0f172a]">{doneCount}</Text>
            <Text className="text-xs text-[#64748b]">Completed</Text>
          </View>

          <View className="w-[48%] items-center gap-1.5 rounded-xl bg-[#fef3c7] p-3">
            <MaterialCommunityIcons name="progress-clock" size={28} color="#d97706" />
            <Text className="text-[20px] font-bold text-[#0f172a]">{inProgressCount}</Text>
            <Text className="text-xs text-[#64748b]">In Progress</Text>
          </View>

          <View className="w-[48%] items-center gap-1.5 rounded-xl bg-[#dbeafe] p-3">
            <MaterialCommunityIcons name="circle-outline" size={28} color="#0284c7" />
            <Text className="text-[20px] font-bold text-[#0f172a]">{openCount}</Text>
            <Text className="text-xs text-[#64748b]">Open</Text>
          </View>

          <View className="w-[48%] items-center gap-1.5 rounded-xl bg-[#f3e8ff] p-3">
            <MaterialCommunityIcons name="percent" size={28} color="#a855f7" />
            <Text className="text-[20px] font-bold text-[#0f172a]">{completionRate}%</Text>
            <Text className="text-xs text-[#64748b]">Complete</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View className="gap-3 rounded-xl border border-[#e2e8f0] bg-white p-[14px]">
          <Text className="text-base font-semibold text-[#0f172a]">Activity Summary</Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="list-box" size={20} color="#64748b" />
              <Text className="text-sm text-[#475569]">Total Tasks</Text>
            </View>
            <Text className="text-base font-semibold text-[#0f766e]">{tasks.length}</Text>
          </View>

          <View className="h-px bg-[#e2e8f0]" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="camera" size={20} color="#64748b" />
              <Text className="text-sm text-[#475569]">Photos Attached</Text>
            </View>
            <Text className="text-base font-semibold text-[#0f766e]">{photosCount}</Text>
          </View>

          <View className="h-px bg-[#e2e8f0]" />

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" />
              <Text className="text-sm text-[#475569]">Locations Added</Text>
            </View>
            <Text className="text-base font-semibold text-[#0f766e]">{locationsCount}</Text>
          </View>
        </View>

        {/* Goals Section */}
        <View className="gap-[10px] rounded-xl bg-[#e0f2fe] p-[14px]">
          <Text className="text-sm font-semibold text-[#0f172a]">Your Progress</Text>
          <View className="h-2 overflow-hidden rounded bg-[#bfdbfe]">
            <View
              className="h-full rounded bg-[#0f766e]"
              style={{ width: `${completionRate}%` }}
            />
          </View>
          <Text className="text-xs text-[#475569]">
            {doneCount} of {tasks.length} tasks completed
          </Text>
        </View>

        <Pressable className="mt-[6px] flex-row items-center justify-center gap-2 rounded-[10px] border border-[#dc2626] py-3" onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text className="text-base font-semibold text-[#dc2626]">Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
