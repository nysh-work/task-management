/**
 * Location Service for handling geolocation features
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NamedLocation {
  id: string;
  name: string;
  coordinates: LocationCoordinates;
  radius: number; // in meters
}

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined';

// Check if browser supports geolocation
export const isGeolocationSupported = (): boolean => {
  return isBrowser && 'geolocation' in navigator;
};

// Get current position
export const getCurrentPosition = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (
  location1: LocationCoordinates,
  location2: LocationCoordinates
): number => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const earthRadius = 6371000; // Earth's radius in meters
  const lat1 = toRadians(location1.latitude);
  const lat2 = toRadians(location2.latitude);
  const deltaLat = toRadians(location2.latitude - location1.latitude);
  const deltaLon = toRadians(location2.longitude - location1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return earthRadius * c; // Distance in meters
};

// Check if user is near a specific location
export const isNearLocation = (
  userLocation: LocationCoordinates,
  targetLocation: NamedLocation
): boolean => {
  const distance = calculateDistance(userLocation, targetLocation.coordinates);
  return distance <= targetLocation.radius;
};

// Start watching location (for background tracking)
export const watchLocation = (
  onLocationUpdate: (location: LocationCoordinates) => void,
  onError?: (error: GeolocationPositionError) => void
): (() => void) => {
  if (!isGeolocationSupported()) {
    if (onError) {
      onError({
        code: 2,
        message: 'Geolocation is not supported by this browser.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    }
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );

  // Return a function to stop watching
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};

// Save a named location to localStorage
export const saveNamedLocation = (location: NamedLocation): void => {
  if (!isBrowser) return;
  
  const savedLocations = getSavedLocations();
  const updatedLocations = [...savedLocations.filter(loc => loc.id !== location.id), location];
  localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
};

// Get all saved locations from localStorage
export const getSavedLocations = (): NamedLocation[] => {
  if (!isBrowser) return [];
  
  try {
    const locationsJSON = localStorage.getItem('savedLocations');
    return locationsJSON ? JSON.parse(locationsJSON) : [];
  } catch (error) {
    console.error('Error loading saved locations:', error);
    return [];
  }
};

// Delete a saved location
export const deleteNamedLocation = (locationId: string): void => {
  if (!isBrowser) return;
  
  const savedLocations = getSavedLocations();
  const updatedLocations = savedLocations.filter(loc => loc.id !== locationId);
  localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
}; 