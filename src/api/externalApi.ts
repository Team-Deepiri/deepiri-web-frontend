import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

interface Location {
  latitude: number;
  longitude: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export const externalApi = {
  cyrexMessage: async (content: string, sessionId: string | null = null): Promise<any> => {
    try {
      const base = import.meta.env.VITE_CYREX_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/agent/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, session_id: sessionId })
      });
      if (!res.ok) throw await res.json();
      return await res.json();
    } catch (error) {
      throw error;
    }
  },
  // Get current weather for location
  getCurrentWeather: async (location: Location): Promise<ApiResponse> => {
    try {
      const params = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      const response = await axiosInstance.get('/external/weather', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to get weather data',
        error 
      };
    }
  },

  // Get nearby events from external sources
  getNearbyEvents: async (location: Location, radius: number = 5000, interests: string[] = []): Promise<ApiResponse> => {
    try {
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        radius,
        interests: interests.join(',')
      };
      const response = await axiosInstance.get('/external/events/nearby', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to get external events',
        error 
      };
    }
  },

  // Get travel directions
  getDirections: async (origin: Location, destination: Location, mode: string = 'walking'): Promise<ApiResponse> => {
    try {
      const params = {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode
      };
      const response = await axiosInstance.get('/external/directions', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to get directions',
        error 
      };
    }
  },

  // Geocode address to coordinates
  geocodeAddress: async (address: string): Promise<ApiResponse> => {
    try {
      const params = { address };
      const response = await axiosInstance.get('/external/geocode', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to geocode address',
        error 
      };
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (latitude: number, longitude: number): Promise<ApiResponse> => {
    try {
      const params = { latitude, longitude };
      const response = await axiosInstance.get('/external/reverse-geocode', { params });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return { 
        success: false, 
        message: axiosError.response?.data?.message || 'Failed to reverse geocode',
        error 
      };
    }
  }
};

