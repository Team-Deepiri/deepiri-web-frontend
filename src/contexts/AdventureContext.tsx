import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { adventureApi } from '../api/adventureApi';
import toast from 'react-hot-toast';
import type { AppLocationLatLng } from '../types/common';

interface Adventure {
  _id: string;
  name?: string;
  title?: string;
  [key: string]: any;
}

interface AdventureData {
  interests?: string[];
  duration?: string;
  maxDistance?: number;
  socialMode?: boolean;
  friends?: string[];
}

interface AdventureContextType {
  currentAdventure: Adventure | null;
  adventureHistory: Adventure[];
  loading: boolean;
  userLocation: AppLocationLatLng | null;
  setUserLocation: (location: AppLocationLatLng | null) => void;
  generateAdventure: (adventureData: AdventureData) => Promise<{ success: boolean; adventure?: Adventure; message?: string }>;
  startAdventure: (adventureId: string) => Promise<{ success: boolean; adventure?: Adventure; message?: string }>;
  completeAdventure: (adventureId: string, feedback?: string | null) => Promise<{ success: boolean; adventure?: Adventure; message?: string }>;
  updateAdventureStep: (adventureId: string, stepIndex: number, action: string) => Promise<{ success: boolean; adventure?: Adventure; message?: string }>;
  getAdventure: (adventureId: string) => Promise<{ success: boolean; adventure?: Adventure; message?: string }>;
  shareAdventure: (adventureId: string, shareData: any) => Promise<{ success: boolean; message?: string }>;
  getAdventureRecommendations: (location: AppLocationLatLng, limit?: number) => Promise<{ success: boolean; recommendations?: any; message?: string }>;
  getAdventureAnalytics: (timeRange?: string) => Promise<{ success: boolean; analytics?: any; message?: string }>;
  loadAdventureHistory: () => Promise<void>;
  setCurrentAdventure: (adventure: Adventure | null) => void;
}

const AdventureContext = createContext<AdventureContextType | undefined>(undefined);

export const useAdventure = (): AdventureContextType => {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return context;
};

interface AdventureProviderProps {
  children: ReactNode;
}

export const AdventureProvider: React.FC<AdventureProviderProps> = ({ children }) => {
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [adventureHistory, setAdventureHistory] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<AppLocationLatLng | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      getUserLocation();
      loadAdventureHistory();
    }
  }, [isAuthenticated, user]);

  const getUserLocation = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: AppLocationLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          console.log('📍 Location obtained:', location);
        },
        (error: GeolocationPositionError) => {
          console.warn('Location access denied or failed:', error.message);
          
          // Provide user-friendly feedback based on error type
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('📍 Using default location (New York City) - Location permission denied');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('📍 Using default location (New York City) - Location unavailable');
              break;
            case error.TIMEOUT:
              console.log('📍 Using default location (New York City) - Location request timeout');
              break;
            default:
              console.log('📍 Using default location (New York City) - Unknown location error');
              break;
          }
          
          // Default to New York City if location access fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.log('📍 Geolocation not supported - using default location (New York City)');
      // Default to New York City if geolocation is not supported
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  };

  const loadAdventureHistory = async (): Promise<void> => {
    try {
      const response = await adventureApi.getUserAdventures();
      if (response.success) {
        setAdventureHistory(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load adventure history:', error);
    }
  };

  const generateAdventure = async (adventureData: AdventureData): Promise<{ success: boolean; adventure?: Adventure; message?: string }> => {
    try {
      setLoading(true);
      
      const requestData = {
        location: userLocation || undefined,
        interests: adventureData.interests,
        duration: adventureData.duration,
        maxDistance: adventureData.maxDistance,
        socialMode: adventureData.socialMode,
        friends: adventureData.friends
      };

      const response = await adventureApi.generateAdventure(requestData);
      
      if (response.success) {
        const adventure = response.data;
        setCurrentAdventure(adventure);
        setAdventureHistory(prev => [adventure, ...prev]);
        toast.success('Adventure generated successfully!');
        return { success: true, adventure };
      } else {
        toast.error(response.message || 'Failed to generate adventure');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Adventure generation error:', error);
      toast.error('Failed to generate adventure. Please try again.');
      return { success: false, message: 'Failed to generate adventure. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const startAdventure = async (adventureId: string): Promise<{ success: boolean; adventure?: Adventure; message?: string }> => {
    try {
      const response = await adventureApi.startAdventure(adventureId);
      
      if (response.success) {
        const adventure = response.data;
        setCurrentAdventure(adventure);
        toast.success('Adventure started!');
        return { success: true, adventure };
      } else {
        toast.error(response.message || 'Failed to start adventure');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Start adventure error:', error);
      toast.error('Failed to start adventure. Please try again.');
      return { success: false, message: 'Failed to start adventure. Please try again.' };
    }
  };

  const completeAdventure = async (adventureId: string, feedback: string | null = null): Promise<{ success: boolean; adventure?: Adventure; message?: string }> => {
    try {
      const response = await adventureApi.completeAdventure(adventureId, feedback);
      
      if (response.success) {
        const adventure = response.data;
        setCurrentAdventure(null);
        setAdventureHistory(prev => 
          prev.map(a => a._id === adventureId ? adventure : a)
        );
        toast.success('Adventure completed! Great job!');
        return { success: true, adventure };
      } else {
        toast.error(response.message || 'Failed to complete adventure');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Complete adventure error:', error);
      toast.error('Failed to complete adventure. Please try again.');
      return { success: false, message: 'Failed to complete adventure. Please try again.' };
    }
  };

  const updateAdventureStep = async (adventureId: string, stepIndex: number, action: string): Promise<{ success: boolean; adventure?: Adventure; message?: string }> => {
    try {
      const response = await adventureApi.updateAdventureStep(adventureId, stepIndex, action);
      
      if (response.success) {
        const adventure = response.data;
        setCurrentAdventure(adventure);
        return { success: true, adventure };
      } else {
        toast.error(response.message || 'Failed to update step');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update step error:', error);
      toast.error('Failed to update step. Please try again.');
      return { success: false, message: 'Failed to update step. Please try again.' };
    }
  };

  const getAdventure = async (adventureId: string): Promise<{ success: boolean; adventure?: Adventure; message?: string }> => {
    try {
      const response = await adventureApi.getAdventure(adventureId);
      
      if (response.success) {
        return { success: true, adventure: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Get adventure error:', error);
      return { success: false, message: 'Failed to get adventure.' };
    }
  };

  const shareAdventure = async (adventureId: string, shareData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await adventureApi.shareAdventure(adventureId, shareData);
      
      if (response.success) {
        toast.success('Adventure shared successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to share adventure');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Share adventure error:', error);
      toast.error('Failed to share adventure. Please try again.');
      return { success: false, message: 'Failed to share adventure. Please try again.' };
    }
  };

  const getAdventureRecommendations = async (location: AppLocationLatLng, limit: number = 5): Promise<{ success: boolean; recommendations?: any; message?: string }> => {
    try {
      const response = await adventureApi.getAdventureRecommendations(location, limit);
      
      if (response.success) {
        return { success: true, recommendations: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Get recommendations error:', error);
      return { success: false, message: 'Failed to get recommendations.' };
    }
  };

  const getAdventureAnalytics = async (timeRange: string = '30d'): Promise<{ success: boolean; analytics?: any; message?: string }> => {
    try {
      const response = await adventureApi.getAdventureAnalytics(timeRange);
      
      if (response.success) {
        return { success: true, analytics: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, message: 'Failed to get analytics.' };
    }
  };

  const value: AdventureContextType = {
    currentAdventure,
    adventureHistory,
    loading,
    userLocation,
    setUserLocation,
    generateAdventure,
    startAdventure,
    completeAdventure,
    updateAdventureStep,
    getAdventure,
    shareAdventure,
    getAdventureRecommendations,
    getAdventureAnalytics,
    loadAdventureHistory,
    setCurrentAdventure
  };

  return (
    <AdventureContext.Provider value={value}>
      {children}
    </AdventureContext.Provider>
  );
};

