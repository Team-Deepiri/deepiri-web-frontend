import axios, { AxiosInstance } from 'axios';
import type { ApiResponse, AxiosErrorResponse } from '../types/common';

// Only AGENT type for messaging Cyrex agent. No group or direct messaging.
export interface AgentChatRoom {
  id: string;
  type: 'AGENT';
  name?: string;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  lastMessage?: AgentMessage;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  chatRoomId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface AgentMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  metadata?: {
    fromAgent?: boolean;
    agentAction?: string;
    context?: any;
  };
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
export interface SendMessageToAgentRequest {
  content: string;
  messageType?: 'TEXT';
  metadata?: {
    context?: any;
    userIntent?: string;
  }
}

class AgentMessagingApi {
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

  // Get Cyrex agent chat room for user
  async getOrCreateAgentChat(): Promise<ApiResponse<AgentChatRoom>> {
    try {
      const response = await this.client.get<ApiResponse<AgentChatRoom[]>>('/api/messaging/chats');
      const agentChats = response.data.data?.filter((chat: { type: string; }) => chat.type === 'AGENT') || [];

      if (agentChats.length > 0) {
        return { 
          success: true, 
          data: agentChats[0], 
          message: 'Agent chat room retrieved successfully'
         };
      } else {
        // If no agent chat exists, create one
        const createResponse = await this.client.post<ApiResponse<AgentChatRoom>>('/api/messaging/chats', {
          type: 'AGENT',
          name: 'Cyrex Agent Chat',
          userIds: []
        });
        return createResponse.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get agent chat room W/O creating new one
  async getAgentChat(): Promise<ApiResponse<AgentChatRoom | null>> {
    try {
      const response = await this.client.get<ApiResponse<AgentChatRoom[]>>('/api/messaging/chats');
      const agentChats = response.data.data?.filter((chat: { type: string; }) => chat.type === 'AGENT') || [];
      
      return { 
        success: true, 
        data: agentChats[0] || null, 
        message: agentChats[0] ? 'Agent chat room retrieved successfully' : 'No agent chat room found'
       };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get messages for a chat room
  async getAgentMessages(
    chatRoomId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<ApiResponse<{ messages: AgentMessage[]; nextCursor?: string }>> {
    try {
      const result = await this.getOrCreateAgentChat();
      const chatRoomId = result.data?.id;

      if (!chatRoomId) { throw new Error('No agent chat room available'); }
      
      const params = new URLSearchParams({ limit: limit.toString() });
      if (cursor) params.append('cursor', cursor);

      const response = await this.client.get<ApiResponse<{ messages: AgentMessage[]; nextCursor?: string }>>(
        `/api/messaging/chats/${chatRoomId}/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send a message to an agent
  async sendMessageToAgent(data: SendMessageToAgentRequest): Promise<ApiResponse<AgentMessage>> {
    try {
      const result = await this.getOrCreateAgentChat();
      const chatRoomId = result.data?.id;

      if (!chatRoomId) { throw new Error('No agent chat room available'); }

      const response = await this.client.post<ApiResponse<AgentMessage>>(
        `/api/messaging/chats/${chatRoomId}/messages`,
        {
          content: data.content,
          messageType: data.messageType || 'TEXT',
          metadata: {
            ...data.metadata,
            fromAgent: false,
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    try {
      const result = await this.getOrCreateAgentChat();
      const chatRoomId = result.data?.id;

      if (!chatRoomId) { throw new Error('No agent chat room available'); }

      const response = await this.client.post<ApiResponse<void>>(
        `/api/messaging/chats/${chatRoomId}/messages/${messageId}/read`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const result = await this.getAgentChat();

      return {
        success: true,
        data: result.data?.unreadCount || 0,
        message: 'Unread message count retrieved successfully'
       };
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

export const agentMessagingApi = new AgentMessagingApi();