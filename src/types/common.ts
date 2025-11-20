// Shared type definitions

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// Custom Location type (to avoid conflict with browser Location)
export interface AppLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// Alternative location format (lat/lng)
export interface AppLocationLatLng {
  lat: number;
  lng: number;
  address?: string;
}

// Axios error response data type
export interface AxiosErrorResponse {
  message?: string;
  error?: string;
  [key: string]: any;
}

