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

interface AdventureData {
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  preferences?: {
    interests?: string[];
    budget?: string;
    duration?: string;
    groupSize?: number;
  };
  [key: string]: any;
}

import type { AppLocationLatLng } from '../types/common';

interface AdventureResponse {
  success?: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
}

export const adventureApi = {
  generateAdventure: async (adventureData: AdventureData): Promise<AdventureResponse> => {
    try {
      const response = await api.post('/adventures/generate', adventureData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getAdventure: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.get(`/adventures/${adventureId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getUserAdventures: async (status: string | null = null, limit: number = 20, offset: number = 0): Promise<AdventureResponse> => {
    try {
      const params: { limit: number; offset: number; status?: string } = { limit, offset };
      if (status) params.status = status;
      
      const response = await api.get('/adventures', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  startAdventure: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/start`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  completeAdventure: async (adventureId: string, feedback: string | null = null): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/complete`, { feedback });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  updateAdventureStep: async (adventureId: string, stepIndex: number, action: string): Promise<AdventureResponse> => {
    try {
      const response = await api.put(`/adventures/${adventureId}/steps`, {
        stepIndex,
        action
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  shareAdventure: async (adventureId: string, shareData: any): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/share`, shareData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getAdventureRecommendations: async (location: AppLocationLatLng, limit: number = 5): Promise<AdventureResponse> => {
    try {
      const params = {
        lat: location.lat,
        lng: location.lng,
        limit
      };
      const response = await api.get('/adventures/recommendations', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getAdventureAnalytics: async (timeRange: string = '30d'): Promise<AdventureResponse> => {
    try {
      const response = await api.get('/adventures/analytics', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  cancelAdventure: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/cancel`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  pauseAdventure: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/pause`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  resumeAdventure: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.post(`/adventures/${adventureId}/resume`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  getAdventureVariations: async (adventureId: string): Promise<AdventureResponse> => {
    try {
      const response = await api.get(`/adventures/${adventureId}/variations`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  }
};

