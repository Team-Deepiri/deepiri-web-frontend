import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notificationApi';
import {
  registerServiceWorker,
  requestNotificationPermission,
  getVapidPublicKey,
  subscribeToPushNotifications,
  getExistingSubscription,
  unsubscribeFromPushNotifications,
  subscriptionToJSON
} from '../utils/webPush';
import toast from 'react-hot-toast';

interface WebPushContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  registration: ServiceWorkerRegistration | null;
}

const WebPushContext = createContext<WebPushContextType | undefined>(undefined);

export const useWebPush = (): WebPushContextType => {
  const context = useContext(WebPushContext);
  if (!context) {
    throw new Error('useWebPush must be used within a WebPushProvider');
  }
  return context;
};

interface WebPushProviderProps {
  children: ReactNode;
}

export const WebPushProvider: React.FC<WebPushProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if Web Push is supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      // Check current permission status
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      // Register service worker
      registerServiceWorker().then((reg) => {
        if (reg) {
          setRegistration(reg);
          // Check if already subscribed
          getExistingSubscription(reg).then((subscription) => {
            setIsSubscribed(!!subscription);
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    // Auto-subscribe when user logs in
    if (isAuthenticated && user && isSupported && registration && !isSubscribed && permission === 'granted') {
      subscribe().catch((error) => {
        console.error('Auto-subscribe failed:', error);
      });
    }
  }, [isAuthenticated, user, isSupported, registration, isSubscribed, permission]);

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      console.warn('Web Push not supported or service worker not registered');
      return false;
    }

    try {
      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }

      // Get VAPID public key
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        toast.error('Failed to get VAPID public key');
        return false;
      }

      // Check for existing subscription
      let subscription = await getExistingSubscription(registration);
      
      if (!subscription) {
        // Create new subscription
        subscription = await subscribeToPushNotifications(registration, publicKey);
      }

      if (!subscription) {
        toast.error('Failed to subscribe to push notifications');
        return false;
      }

      // Send subscription to backend
      if (user) {
        const subscriptionJSON = subscriptionToJSON(subscription);
        const result = await notificationApi.subscribeToPush(user._id, subscriptionJSON);
        
        if (result.success) {
          setIsSubscribed(true);
          toast.success('Push notifications enabled');
          return true;
        } else {
          toast.error(result.message || 'Failed to register subscription');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      return false;
    }

    try {
      const subscription = await getExistingSubscription(registration);
      
      if (subscription && user) {
        const subscriptionJSON = subscriptionToJSON(subscription);
        await notificationApi.unsubscribeFromPush(user._id, subscriptionJSON);
      }

      const success = await unsubscribeFromPushNotifications(registration);
      
      if (success) {
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
      return false;
    }
  };

  const value: WebPushContextType = {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    registration
  };

  return (
    <WebPushContext.Provider value={value}>
      {children}
    </WebPushContext.Provider>
  );
};

