import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import type { ApiResponse, AxiosErrorResponse } from '../types/common';

// Helper to extract error message from axios error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<AxiosErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  }
  return defaultMessage;
};

interface NotificationSettings {
  [key: string]: any;
}

export const notificationApi = {
  // Get all notifications for the user
  getNotifications: async (): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to get notifications'),
        error 
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to mark notification as read'),
        error 
      };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.patch('/notifications/mark-all-read');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to mark all notifications as read'),
        error 
      };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to delete notification'),
        error 
      };
    }
  },

  // Get notification settings
  getSettings: async (): Promise<ApiResponse<NotificationSettings>> => {
    try {
      const response = await axiosInstance.get('/notifications/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to get notification settings'),
        error 
      };
    }
  },

  // Update notification settings
  updateSettings: async (settings: NotificationSettings): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.patch('/notifications/settings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to update notification settings'),
        error 
      };
    }
  },

  // Web Push subscription methods
  subscribeToPush: async (userId: string, subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<ApiResponse> => {
    try {
      const notificationServiceUrl = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:5005';
      const response = await fetch(`${notificationServiceUrl}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          subscription
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || 'Failed to subscribe to push notifications',
          error: { status: response.status, statusText: response.statusText }
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to subscribe to push notifications',
        error
      };
    }
  },

  unsubscribeFromPush: async (userId: string, subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<ApiResponse> => {
    try {
      const notificationServiceUrl = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:5005';
      const response = await fetch(`${notificationServiceUrl}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          subscription
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || 'Failed to unsubscribe from push notifications',
          error: { status: response.status, statusText: response.statusText }
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to unsubscribe from push notifications',
        error
      };
    }
  }
};

