import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Try to get address via reverse geocoding
    const address = await reverseGeocode(coords.latitude, coords.longitude);

    return {
      ...coords,
      address,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length > 0) {
      const address = results[0];
      const addressString = [address.street, address.city, address.region, address.country]
        .filter(Boolean)
        .join(', ');
      return addressString || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
