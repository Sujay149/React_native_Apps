import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/theme';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarActiveTintColor: theme.colors.primary,
				tabBarInactiveTintColor: theme.colors.textMuted,
				tabBarStyle: {
					borderTopColor: theme.colors.border,
					backgroundColor: theme.colors.surface,
				},
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Tasks',
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="format-list-checkbox" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					title: 'Map',
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
					),
				}}
			/>

			<Tabs.Screen name="task/[id]" options={{ href: null }} />
		</Tabs>
	);
}
