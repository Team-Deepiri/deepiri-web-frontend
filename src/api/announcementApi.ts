import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import type { ApiResponse, AxiosErrorResponse } from '../types/common';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<AxiosErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || defaultMessage;
  }
  return defaultMessage;
};

export interface Announcement {
  id: string;
  title: string;
  body: string;
  content?: string;
  author?: string;
  source: 'discord' | 'platform' | 'norozo';
  discordMessageId?: string;
  jumpUrl?: string;
  url?: string;
  createdAt: string;
}

export const announcementApi = {
  getAnnouncements: async (): Promise<ApiResponse<{ announcements: Announcement[] }>> => {
    try {
      const res = await axiosInstance.get('/announcements');
      // gateway returns { ok, announcements }
      const data = res.data?.announcements ? res.data : { announcements: res.data?.data?.announcements || [] };
      return { success: true, data } as any;
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Failed to fetch announcements'), error } as any;
    }
  },

  createAnnouncement: async (payload: { title: string; body: string }): Promise<ApiResponse<{ announcement: Announcement }>> => {
    try {
      const res = await axiosInstance.post('/announcements', payload);
      return { success: true, data: res.data } as any;
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Failed to create announcement'), error } as any;
    }
  },
};
