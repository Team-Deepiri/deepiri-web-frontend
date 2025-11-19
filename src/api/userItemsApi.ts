import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

interface ItemData {
  name?: string;
  description?: string;
  category?: string;
  type?: string;
  [key: string]: any;
}

interface ItemOptions {
  category?: string;
  type?: string;
  limit?: number;
  offset?: number;
  [key: string]: any;
}

interface UserItemsResponse {
  success?: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
}

export const userItemsApi = {
  // Get user items with filters
  getItems: async (options: ItemOptions = {}): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items', { params: options });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Get specific item
  getItem: async (itemId: string): Promise<UserItemsResponse> => {
    try {
      const response = await api.get(`/user-items/${itemId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Create new item
  createItem: async (itemData: ItemData): Promise<UserItemsResponse> => {
    try {
      const response = await api.post('/user-items', itemData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Update item
  updateItem: async (itemId: string, updateData: Partial<ItemData>): Promise<UserItemsResponse> => {
    try {
      const response = await api.put(`/user-items/${itemId}`, updateData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Delete item
  deleteItem: async (itemId: string, permanent: boolean = false): Promise<UserItemsResponse> => {
    try {
      const response = await api.delete(`/user-items/${itemId}`, {
        params: { permanent }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (itemId: string): Promise<UserItemsResponse> => {
    try {
      const response = await api.patch(`/user-items/${itemId}/favorite`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Add memory to item
  addMemory: async (itemId: string, memoryData: any): Promise<UserItemsResponse> => {
    try {
      const response = await api.post(`/user-items/${itemId}/memories`, memoryData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Share item
  shareItem: async (itemId: string, shareData: any): Promise<UserItemsResponse> => {
    try {
      const response = await api.post(`/user-items/${itemId}/share`, shareData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Get user statistics
  getStats: async (): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items/stats');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Search items
  searchItems: async (query: string, options: ItemOptions = {}): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items/search', {
        params: { q: query, ...options }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Get shared items
  getSharedItems: async (options: ItemOptions = {}): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items/shared', { params: options });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Get public items
  getPublicItems: async (options: ItemOptions = {}): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items/public', { params: options });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Export items
  exportItems: async (format: 'json' | 'csv' = 'json'): Promise<UserItemsResponse> => {
    try {
      const response = await api.get('/user-items/export', {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  // Bulk create items
  bulkCreateItems: async (items: ItemData[]): Promise<UserItemsResponse> => {
    try {
      const response = await api.post('/user-items/bulk', { items });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  }
};

// Item categories and types for forms
export const ITEM_CATEGORIES = [
  { value: 'adventure_gear', label: 'Adventure Gear', icon: '🎒' },
  { value: 'collectible', label: 'Collectible', icon: '💎' },
  { value: 'badge', label: 'Badge', icon: '🏆' },
  { value: 'achievement', label: 'Achievement', icon: '🥇' },
  { value: 'souvenir', label: 'Souvenir', icon: '🎁' },
  { value: 'memory', label: 'Memory', icon: '💭' },
  { value: 'photo', label: 'Photo', icon: '📸' },
  { value: 'ticket', label: 'Ticket', icon: '🎫' },
  { value: 'certificate', label: 'Certificate', icon: '📜' },
  { value: 'virtual_item', label: 'Virtual Item', icon: '💻' },
  { value: 'reward', label: 'Reward', icon: '🎖️' },
  { value: 'token', label: 'Token', icon: '🪙' },
  { value: 'other', label: 'Other', icon: '📦' }
] as const;

export const ITEM_TYPES = [
  { value: 'physical', label: 'Physical', icon: '🤲' },
  { value: 'digital', label: 'Digital', icon: '💾' },
  { value: 'virtual', label: 'Virtual', icon: '🌐' },
  { value: 'achievement', label: 'Achievement', icon: '🏅' },
  { value: 'badge', label: 'Badge', icon: '🏆' },
  { value: 'token', label: 'Token', icon: '🪙' },
  { value: 'memory', label: 'Memory', icon: '💭' },
  { value: 'experience', label: 'Experience', icon: '✨' }
] as const;

export const RARITY_LEVELS = [
  { value: 'common', label: 'Common', color: 'text-gray-400', bgColor: 'bg-gray-100' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-400', bgColor: 'bg-green-100' },
  { value: 'rare', label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-100' },
  { value: 'epic', label: 'Epic', color: 'text-purple-400', bgColor: 'bg-purple-100' },
  { value: 'legendary', label: 'Legendary', color: 'text-yellow-400', bgColor: 'bg-yellow-100' }
] as const;

export const EMOTIONS = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'excited', label: 'Excited', icon: '🤩' },
  { value: 'nostalgic', label: 'Nostalgic', icon: '🥺' },
  { value: 'proud', label: 'Proud', icon: '😤' },
  { value: 'grateful', label: 'Grateful', icon: '🙏' },
  { value: 'adventurous', label: 'Adventurous', icon: '🗺️' }
] as const;

