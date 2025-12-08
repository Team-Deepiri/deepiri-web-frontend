import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import type { ApiResponse, AxiosErrorResponse } from '../types/common';

interface EventData {
  title?: string;
  description?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  startTime?: string;
  endTime?: string;
  [key: string]: any;
}

// Helper to extract error message from axios error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<AxiosErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  }
  return defaultMessage;
};

export const eventApi = {
  // Create a new event
  createEvent: async (eventData: EventData): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post('/events', eventData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to create event'),
        error 
      };
    }
  },

  // Get event by ID
  getEventById: async (eventId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to get event'),
        error 
      };
    }
  },

  // Get nearby events
  getNearbyEvents: async (latitude: number, longitude: number, radius: number = 5000, interests: string[] = []): Promise<ApiResponse> => {
    try {
      const params = { 
        latitude, 
        longitude, 
        radius,
        interests: interests.join(',')
      };
      const response = await axiosInstance.get('/events/nearby', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to get nearby events'),
        error 
      };
    }
  },

  // Get user's events
  getUserEvents: async (): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.get('/events/user');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to get user events'),
        error 
      };
    }
  },

  // RSVP to an event
  rsvpToEvent: async (eventId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post(`/events/${eventId}/rsvp`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to RSVP to event'),
        error 
      };
    }
  },

  // Cancel RSVP to an event
  cancelRsvp: async (eventId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.post(`/events/${eventId}/cancel-rsvp`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to cancel RSVP'),
        error 
      };
    }
  },

  // Update event
  updateEvent: async (eventId: string, eventData: Partial<EventData>): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.patch(`/events/${eventId}`, eventData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to update event'),
        error 
      };
    }
  },

  // Delete event
  deleteEvent: async (eventId: string): Promise<ApiResponse> => {
    try {
      const response = await axiosInstance.delete(`/events/${eventId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: getErrorMessage(error, 'Failed to delete event'),
        error 
      };
    }
  }
};

