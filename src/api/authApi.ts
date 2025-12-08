import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// DISABLED: Handle token expiration (causing infinite loops)
// TODO: Re-enable when backend is properly running
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log the error and reject - no auto-refresh
    if (!error.response) {
      console.warn('Backend server not reachable');
    }
    return Promise.reject(error);
  }
);

interface UserData {
  email: string;
  password: string;
  name?: string;
  [key: string]: any;
}

interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: any;
  message?: string;
  [key: string]: any;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  register: async (userData: UserData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  verifyToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  forgotPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  }
};

