import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

interface WeatherParams {
  latitude: number;
  longitude: number;
  units?: 'imperial' | 'metric';
}

interface DirectionsParams {
  origin: string;
  destination: string;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

interface AdventureDataParams {
  latitude: number;
  longitude: number;
  radius?: number;
  interests?: string[] | string;
}

export const pythonApi = {
  // GET /api/python/weather?lat=..&lng=..&units=imperial|metric
  getWeather: async (params: WeatherParams): Promise<ApiResponse> => {
    try {
      const { latitude, longitude, units = 'imperial' } = params || {};
      const response = await axiosInstance.get('/python/weather', {
        params: { lat: latitude, lng: longitude, units }
      });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch weather',
        error
      };
    }
  },

  // POST /api/python/directions { origin, destination, mode }
  getDirections: async ({ origin, destination, mode = 'driving' }: DirectionsParams): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post('/python/directions', {
        origin,
        destination,
        mode
      });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch directions',
        error
      };
    }
  },

  // GET /api/python/adventure-data?lat=..&lng=..&radius=..&interests=a,b
  getAdventureData: async ({ latitude, longitude, radius = 5000, interests = [] }: AdventureDataParams): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.get('/python/adventure-data', {
        params: {
          lat: latitude,
          lng: longitude,
          radius,
          interests: Array.isArray(interests) ? interests.join(',') : interests
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Failed to fetch adventure data',
        error
      };
    }
  }
};

