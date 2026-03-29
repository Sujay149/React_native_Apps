import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarActiveTintColor: '#1E1B4B',
				tabBarInactiveTintColor: '#94A3B8',
				tabBarStyle: {
					borderTopColor: '#E2E8F0',
					backgroundColor: '#FFFFFF',
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
