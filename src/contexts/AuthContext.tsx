import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (nameOrData: string | object, email?: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken && storedToken !== 'null' && storedToken !== 'undefined' ? storedToken : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          console.log('✅ Session restored from localStorage');
        } catch (parseError) {
          console.warn('Invalid stored user data, clearing session');
          clearSession();
        }
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  };

  const tryRefresh = async (): Promise<boolean> => {
    try {
      const res = await authApi.refreshToken();
      if (res.success) {
        const { user, token } = res.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
    } catch (error: any) {
      console.warn('Token refresh failed:', error.message);
    }
    return false;
  };

  const verifyToken = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await authApi.verifyToken();
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      } else {
        const refreshed = await tryRefresh();
        if (!refreshed) {
          clearSession();
        }
        return refreshed;
      }
    } catch (error: any) {
      console.warn('Token verification failed:', error.message);
      const refreshed = await tryRefresh();
      if (!refreshed) {
        clearSession();
      }
      return refreshed;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Welcome back!');
        navigate('/home');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nameOrData: string | object, email?: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const payload = typeof nameOrData === 'object'
        ? nameOrData
        : { name: nameOrData, email, password };
      const response = await authApi.register(payload);
      
      if (response.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Account created successfully!');
        navigate('/home');
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    clearSession();
    const currentPath = window.location.pathname;
    if (!['/login', '/register', '/'].includes(currentPath)) {
      navigate('/');
    }
    if (user) {
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

