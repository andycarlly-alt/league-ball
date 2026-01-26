// src/services/geolocation.ts - REAL GEOLOCATION SERVICE

import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import type { FieldLocation } from '../state/AppStore';

class GeolocationService {
  /**
   * Get current user location (REAL GPS)
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use check-in features.'
        );
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);
      
      // Fallback to mock location for simulator
      if (__DEV__) {
        console.log('Using mock location (Baltimore, MD) - Dev mode');
        return {
          latitude: 39.2904,
          longitude: -76.6122,
        };
      }
      
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get distance to field
   */
  async getDistanceToField(
    fieldLocation: FieldLocation
  ): Promise<{ distance: number; distanceText: string } | null> {
    const userLocation = await this.getCurrentLocation();
    if (!userLocation) return null;

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      fieldLocation.latitude,
      fieldLocation.longitude
    );

    let distanceText: string;
    if (distance < 0.1) {
      const feet = Math.round(distance * 5280);
      distanceText = `${feet} feet away`;
    } else {
      distanceText = `${distance.toFixed(1)} miles away`;
    }

    return { distance, distanceText };
  }

  /**
   * Check if user is within check-in radius (500 feet = ~0.095 miles)
   */
  async isWithinCheckInRadius(fieldLocation: FieldLocation): Promise<boolean> {
    const result = await this.getDistanceToField(fieldLocation);
    if (!result) return false;

    const CHECK_IN_RADIUS = 0.095; // 500 feet in miles
    return result.distance <= CHECK_IN_RADIUS;
  }

  /**
   * Open navigation to field
   */
  async openNavigation(fieldLocation: FieldLocation): Promise<void> {
    const { latitude, longitude, name } = fieldLocation;
    const label = encodeURIComponent(name);

    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${latitude},${longitude}`
        : `geo:0,0?q=${latitude},${longitude}(${label})`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        await this.openGoogleMaps(fieldLocation);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open navigation app');
    }
  }

  /**
   * Open Google Maps (cross-platform)
   */
  async openGoogleMaps(fieldLocation: FieldLocation): Promise<void> {
    const { latitude, longitude, name } = fieldLocation;
    const label = encodeURIComponent(name);
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open Google Maps');
    }
  }

  /**
   * Open Waze navigation
   */
  async openWaze(fieldLocation: FieldLocation): Promise<void> {
    const { latitude, longitude } = fieldLocation;
    const url = `waze://?ll=${latitude},${longitude}&navigate=yes`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Waze Not Installed', 'Please install Waze to use this feature');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open Waze');
    }
  }

  /**
   * Show navigation options
   */
  async showNavigationOptions(fieldLocation: FieldLocation): Promise<void> {
    Alert.alert(
      '🗺️ Navigate to Field',
      `Choose your navigation app:`,
      [
        {
          text: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
          onPress: () => this.openNavigation(fieldLocation),
        },
        {
          text: 'Google Maps',
          onPress: () => this.openGoogleMaps(fieldLocation),
        },
        {
          text: 'Waze',
          onPress: () => this.openWaze(fieldLocation),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }
}

export const geolocationService = new GeolocationService();