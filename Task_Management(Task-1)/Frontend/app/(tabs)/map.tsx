import { Redirect, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppHydration, useAppStore } from '@/stores/use-app-store';
import { trackMapViewed } from '@/utils/analytics';
import { theme } from '@/constants/theme';

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
				<MaterialCommunityIcons name="map-search-outline" size={34} color={theme.colors.textMuted} />
				<Text style={styles.helperText}>Loading map...</Text>
			</View>
		);
	}

	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return (
		<View style={styles.root}>
			<LinearGradient
				colors={[theme.colors.gradientA, theme.colors.gradientB, theme.colors.gradientC]}
				locations={[0, 0.45, 0.9]}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
				<View style={styles.container}>
					<View style={styles.heroCard}>
						<View style={styles.heroTopRow}>
							<View style={styles.heroBadge}>
								<Text style={styles.heroBadgeText}>Map</Text>
							</View>
							<View style={styles.heroCountPill}>
								<MaterialCommunityIcons name="map-marker-multiple-outline" size={13} color={theme.colors.primary} />
								<Text style={styles.heroCountText}>{markers.length} tasks</Text>
							</View>
						</View>
						<Text style={styles.title}>Task Locations</Text>
						<Text style={styles.subtitle}>Showing location-tagged tasks for quick dispatch context.</Text>
					</View>

					{markers.length === 0 ? (
						<View style={styles.emptyState}>
							<MaterialCommunityIcons name="map-marker-off-outline" size={34} color={theme.colors.textMuted} />
							<Text style={styles.emptyTitle}>No mapped tasks yet</Text>
							<Text style={styles.emptySubtitle}>Add location data to a task and it will appear here.</Text>
						</View>
					) : Platform.OS === 'web' ? (
						<View style={styles.emptyState}>
							<MaterialCommunityIcons name="cellphone-link-off" size={34} color={theme.colors.textMuted} />
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
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: theme.colors.background,
	},
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 16,
		gap: 12,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: theme.colors.background,
		gap: 8,
	},
	helperText: {
		color: theme.colors.textSecondary,
		fontSize: 14,
		fontWeight: '600',
	},
	heroCard: {
		backgroundColor: theme.colors.surface,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: theme.colors.borderSoft,
		padding: 16,
		...theme.shadows.card,
	},
	heroTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	heroBadge: {
		backgroundColor: theme.colors.primarySoft,
		borderRadius: theme.radii.round,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	heroBadgeText: {
		fontSize: 11,
		fontWeight: '700',
		color: theme.colors.primary,
		textTransform: 'uppercase',
		letterSpacing: 0.6,
	},
	heroCountPill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: theme.colors.primarySoft,
		borderRadius: theme.radii.round,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	heroCountText: {
		fontSize: 11,
		fontWeight: '700',
		color: theme.colors.primary,
	},
	title: {
		fontSize: 24,
		fontWeight: '800',
		color: theme.colors.textPrimary,
		marginTop: 10,
	},
	subtitle: {
		marginTop: 4,
		color: theme.colors.textSecondary,
		fontSize: 14,
	},
	mapCard: {
		flex: 1,
		borderRadius: 20,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
		...theme.shadows.soft,
	},
	nativeMap: {
		flex: 1,
		backgroundColor: theme.colors.surface,
	},
	emptyState: {
		flex: 1,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: theme.colors.border,
		backgroundColor: theme.colors.surface,
		padding: 16,
		gap: 6,
		alignItems: 'center',
		justifyContent: 'center',
		...theme.shadows.soft,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: theme.colors.textPrimary,
		marginTop: 8,
	},
	emptySubtitle: {
		fontSize: 13,
		color: theme.colors.textSecondary,
		textAlign: 'center',
		maxWidth: 260,
	},
});
