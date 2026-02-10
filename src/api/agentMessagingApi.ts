import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface AgentSession {
  id?: string;
  title?: string;
  settings?: any;
  [key: string]: any;
}

interface AgentResponse {
  success?: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
}

export const agentApi = {
  createSession: async (title: string, settings?: any): Promise<AgentResponse> => {
    try {
      const res = await api.post('/agent/sessions', { title, settings });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },
  listSessions: async (limit: number = 20, offset: number = 0): Promise<AgentResponse> => {
    try {
      const res = await api.get('/agent/sessions', { params: { limit, offset } });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },
  sendMessage: async (sessionId: string, content: string): Promise<AgentResponse> => {
    try {
      const res = await api.post(`/agent/sessions/${sessionId}/messages`, { content });
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },
  archiveSession: async (sessionId: string): Promise<AgentResponse> => {
    try {
      const res = await api.post(`/agent/sessions/${sessionId}/archive`);
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  }
};

