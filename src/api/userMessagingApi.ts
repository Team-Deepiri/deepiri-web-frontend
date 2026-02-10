import axios, { AxiosInstance } from 'axios';
import type { ApiResponse, AxiosErrorResponse } from '../types/common';

// Types for messaging other users
export interface ChatRoom {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  chatRoomId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  readReceipts?: MessageReadReceipt[];
}

export interface MessageReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface CreateChatRoomRequest {
  type: 'DIRECT' | 'GROUP';
  name?: string;
  userIds: string[];
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  metadata?: Record<string, any>;
}

class MessagingApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5100',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all chat rooms for the current user
  async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    try {
      const response = await this.client.get<ApiResponse<ChatRoom[]>>('/api/messaging/chats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a specific chat room
  async getChatRoom(chatRoomId: string): Promise<ApiResponse<ChatRoom>> {
    try {
      const response = await this.client.get<ApiResponse<ChatRoom>>(`/api/messaging/chats/${chatRoomId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new chat room
  async createChatRoom(data: CreateChatRoomRequest): Promise<ApiResponse<ChatRoom>> {
    try {
      const response = await this.client.post<ApiResponse<ChatRoom>>('/api/messaging/chats', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get messages for a chat room
  async getMessages(
    chatRoomId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<ApiResponse<{ messages: Message[]; nextCursor?: string }>> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (cursor) params.append('cursor', cursor);
      
      const response = await this.client.get<ApiResponse<{ messages: Message[]; nextCursor?: string }>>(
        `/api/messaging/chats/${chatRoomId}/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send a message
  async sendMessage(chatRoomId: string, data: SendMessageRequest): Promise<ApiResponse<Message>> {
    try {
      const response = await this.client.post<ApiResponse<Message>>(
        `/api/messaging/chats/${chatRoomId}/messages`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark message as read
  async markMessageAsRead(chatRoomId: string, messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post<ApiResponse<void>>(
        `/api/messaging/chats/${chatRoomId}/messages/${messageId}/read`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add participant to chat room
  async addParticipant(chatRoomId: string, userId: string): Promise<ApiResponse<ChatParticipant>> {
    try {
      const response = await this.client.post<ApiResponse<ChatParticipant>>(
        `/api/messaging/chats/${chatRoomId}/participants`,
        { userId }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove participant from chat room
  async removeParticipant(chatRoomId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete<ApiResponse<void>>(
        `/api/messaging/chats/${chatRoomId}/participants/${userId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosErrorResponse;
      const message = axiosError.response?.data?.error || error.message;
      return new Error(message);
    }
    return error;
  }
}

export const messagingApi = new MessagingApi();