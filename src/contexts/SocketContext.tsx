import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
/// <reference path="../types/react-hot-toast.d.ts" />

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinAdventureRoom: (adventureId: string) => void;
  leaveAdventureRoom: (adventureId: string) => void;
  joinEventRoom: (eventId: string) => void;
  leaveEventRoom: (eventId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Extract base URL without /api suffix for Socket.IO
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5100/api').replace('/api', '');
      const newSocket = io(baseUrl, {
        auth: {
          userId: user._id
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        newSocket.emit('join_user_room', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error: Error) => {
        console.warn('Socket connection error (backend may not be running):', error.message);
        setConnected(false);
        // Don't show error toast for development - backend might not be running
        if (import.meta.env.PROD) {
          toast.error('Connection to server lost. Please refresh the page.');
        }
      });

      // Adventure notifications
      newSocket.on('adventure_generated', (data: { name: string }) => {
        toast.success(`Adventure "${data.name}" is ready!`);
      });

      newSocket.on('adventure_started', (data: { name: string }) => {
        toast.success(`Adventure "${data.name}" has started!`);
      });

      newSocket.on('adventure_completed', (data: { points: number }) => {
        toast.success(`Adventure completed! You earned ${data.points} points!`);
      });

      newSocket.on('step_updated', (data: any) => {
        console.log('Step updated:', data);
      });

      // Event notifications
      newSocket.on('event_created', (data: { name: string }) => {
        toast.success(`New event: ${data.name}`);
      });

      newSocket.on('event_updated', (data: { name: string }) => {
        toast(`Event "${data.name}" has been updated`);
      });

      newSocket.on('event_cancelled', (data: { name: string }) => {
        toast.error(`Event "${data.name}" has been cancelled`);
      });

      newSocket.on('user_joined', (data: any) => {
        toast('Someone joined the event');
      });

      newSocket.on('user_left', (data: any) => {
        toast('Someone left the event');
      });

      // General notifications
      newSocket.on('notification', (data: { message: string; type?: string }) => {
        toast(data.message, {
          duration: 5000,
          icon: getNotificationIcon(data.type)
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinAdventureRoom = (adventureId: string): void => {
    if (socket && connected) {
      socket.emit('join_adventure_room', adventureId);
    }
  };

  const leaveAdventureRoom = (adventureId: string): void => {
    if (socket && connected) {
      socket.emit('leave_adventure_room', adventureId);
    }
  };

  const joinEventRoom = (eventId: string): void => {
    if (socket && connected) {
      socket.emit('join_event_room', eventId);
    }
  };

  const leaveEventRoom = (eventId: string): void => {
    if (socket && connected) {
      socket.emit('leave_event_room', eventId);
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    joinAdventureRoom,
    leaveAdventureRoom,
    joinEventRoom,
    leaveEventRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

const getNotificationIcon = (type?: string): string => {
  switch (type) {
    case 'adventure_generated':
      return '🎯';
    case 'step_reminder':
      return '⏰';
    case 'weather_alert':
      return '🌤️';
    case 'venue_change':
      return '📍';
    case 'friend_joined':
      return '👥';
    case 'badge_earned':
      return '🏆';
    case 'points_earned':
      return '⭐';
    case 'event_reminder':
      return '📅';
    default:
      return '🔔';
  }
};

