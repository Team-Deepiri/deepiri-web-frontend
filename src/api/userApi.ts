import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface UserData {
  name?: string;
  email?: string;
  [key: string]: any;
}

interface UserResponse {
  success?: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
}

export const userApi = {
  getProfile: async (): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  updateProfile: async (userData: UserData): Promise<UserResponse> => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  updatePreferences: async (preferences: any): Promise<UserResponse> => {
    try {
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  updateLocation: async (location: { latitude?: number; longitude?: number; address?: string }): Promise<UserResponse> => {
    try {
      const response = await api.put('/users/location', location);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getStats: async (): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getFriends: async (): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/friends');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  addFriend: async (friendId: string): Promise<UserResponse> => {
    try {
      const response = await api.post('/users/friends', { friendId });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  removeFriend: async (friendId: string): Promise<UserResponse> => {
    try {
      const response = await api.delete(`/users/friends/${friendId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  searchUsers: async (query: string, limit: number = 20): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getFavoriteVenues: async (): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/favorite-venues');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  addFavoriteVenue: async (venueData: any): Promise<UserResponse> => {
    try {
      const response = await api.post('/users/favorite-venues', venueData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  removeFavoriteVenue: async (venueId: string): Promise<UserResponse> => {
    try {
      const response = await api.delete(`/users/favorite-venues/${venueId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getLeaderboard: async (timeRange: string = '30d', limit: number = 50): Promise<UserResponse> => {
    try {
      const response = await api.get('/users/leaderboard', {
        params: { timeRange, limit }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  deleteAccount: async (password: string): Promise<UserResponse> => {
    try {
      const response = await api.delete('/users/account', { data: { password } });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  }
};

