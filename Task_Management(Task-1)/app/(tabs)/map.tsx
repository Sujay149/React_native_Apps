import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackMapViewed } from '@/utils/analytics';

type MarkerPayload = {
	id: string;
	title: string;
	description: string;
	status: string;
	address: string;
	latitude: number;
	longitude: number;
};

const DEFAULT_REGION: Region = {
	latitude: 20.5937,
	longitude: 78.9629,
	latitudeDelta: 12,
	longitudeDelta: 12,
};

const clampDelta = (value: number, fallback: number) => {
	if (!Number.isFinite(value) || value <= 0) {
		return fallback;
	}

	return Math.min(Math.max(value, 0.003), 35);
};

export default function MapScreen() {
	const router = useRouter();
	const { hasHydrated } = useAppHydration();
	const { isAuthenticated, tasks } = useAppStore();

	const markers = useMemo(
		() =>
			tasks
				.filter(
					(task) =>
						Boolean(task.location) &&
						Number.isFinite(task.location?.latitude) &&
						Number.isFinite(task.location?.longitude),
				)
				.map((task) => ({
					id: task.id,
					title: task.title,
					description: task.description,
					status: task.completed ? 'Completed' : 'Open',
					address: task.location?.address ?? '',
					latitude: task.location!.latitude,
					longitude: task.location!.longitude,
				})),
		[tasks],
	);

	const initialRegion = useMemo<Region>(() => {
		if (markers.length === 0) {
			return DEFAULT_REGION;
		}

		if (markers.length === 1) {
			return {
				latitude: markers[0].latitude,
				longitude: markers[0].longitude,
				latitudeDelta: 0.08,
				longitudeDelta: 0.08,
			};
		}

		const latitudes = markers.map((item) => item.latitude);
		const longitudes = markers.map((item) => item.longitude);

		const minLat = Math.min(...latitudes);
		const maxLat = Math.max(...latitudes);
		const minLng = Math.min(...longitudes);
		const maxLng = Math.max(...longitudes);

		const centerLat = (minLat + maxLat) / 2;
		const centerLng = (minLng + maxLng) / 2;

		return {
			latitude: centerLat,
			longitude: centerLng,
			latitudeDelta: clampDelta((maxLat - minLat) * 1.5, 0.4),
			longitudeDelta: clampDelta((maxLng - minLng) * 1.5, 0.4),
		};
	}, [markers]);

	useEffect(() => {
		if (hasHydrated && isAuthenticated) {
			trackMapViewed(markers.length);
		}
	}, [hasHydrated, isAuthenticated, markers.length]);

	if (!hasHydrated && Platform.OS !== 'web') {
		return (
			<View style={styles.centered}>
				<Text style={styles.helperText}>Loading map...</Text>
			</View>
		);
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.container}>
				<Text style={styles.title}>Task Locations</Text>
				<Text style={styles.subtitle}>Showing {markers.length} location-tagged tasks</Text>

				{markers.length === 0 ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>No mapped tasks yet</Text>
						<Text style={styles.emptySubtitle}>Add location data to a task and it will appear here.</Text>
					</View>
				) : Platform.OS === 'web' ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>Map is available on Android/iOS builds</Text>
						<Text style={styles.emptySubtitle}>Run on device/emulator to view interactive markers.</Text>
					</View>
				) : (
					<View style={styles.mapCard}>
						<MapView
							style={styles.nativeMap}
							initialRegion={initialRegion}
							showsCompass
							showsUserLocation={false}
							toolbarEnabled
							mapPadding={{ top: 20, right: 20, bottom: 20, left: 20 }}>
							{markers.map((marker) => (
								<Marker
									key={marker.id}
									coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
									title={marker.title}
									description={marker.description || marker.address || 'No details available'}
									onPress={() => router.push(`/task/${marker.id}`)}
								/>
							))}
						</MapView>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 16,
		backgroundColor: '#F8FAFC',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F8FAFC',
	},
	helperText: {
		color: '#334155',
		fontSize: 14,
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		color: '#0F172A',
	},
	subtitle: {
		marginTop: 4,
		marginBottom: 12,
		color: '#475569',
		fontSize: 14,
	},
	mapCard: {
		flex: 1,
		borderRadius: 14,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		backgroundColor: '#FFFFFF',
	},
	nativeMap: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	emptyState: {
		marginTop: 8,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		backgroundColor: '#FFFFFF',
		padding: 16,
		gap: 6,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#0F172A',
	},
	emptySubtitle: {
		fontSize: 13,
		color: '#64748B',
	},
});
