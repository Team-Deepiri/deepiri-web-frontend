import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
import type { DeepiriRole } from '../types/roles';
import { getStoredRole, getUserRole, setStoredRole } from '../utils/roles';

// authApi rejects with the response body (see api/authApi.ts), so a failed login
// arrives here as the auth-service payload rather than an AxiosError.
//
// The auth-service runs express-validator on /auth/login and returns
// { message: "Validation failed", errors: [{ field, message }] }. Surface the
// specific rule messages instead of the unhelpful "Validation failed" lump.
const loginErrorMessage = (error: any): string => {
  const errors = error?.errors ?? error?.response?.data?.errors;
  const validationDetail = Array.isArray(errors)
    ? errors
        .map((e: any) => (typeof e?.message === 'string' ? e.message : ''))
        .filter(Boolean)
        .join(' ')
    : '';

  const data = error?.response?.data ?? error;
  const message = typeof data?.message === 'string' ? data.message : '';
  const errorField = typeof data?.error === 'string' ? data.error : '';
  const status = error?.status ?? error?.response?.status;

  const raw =
    validationDetail ||
    (message && message !== 'Validation failed' ? message : '') ||
    errorField ||
    (status === 401 || status === 403
      ? 'Invalid credentials'
      : status === 400
        ? 'Invalid login request'
        : 'Login failed. Please try again.');

  // Cap length as defense-in-depth against an oversized upstream string;
  // the value is rendered verbatim in a toast.
  return raw.length > 300 ? `${raw.slice(0, 300)}…` : raw;
};

// --- Interfaces ---

interface User {
  _id: string;
  name: string;
  email: string;
  metadata?: any;
  role?: string;
  deepiriRole?: string;
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
  deepiriRole: DeepiriRole | null;
  setDeepiriRole: (r: DeepiriRole) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// --- Context Setup ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Provider Component ---

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deepiriRole, setDeepiriRoleState] = useState<DeepiriRole | null>(() => getStoredRole());
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token') as string | null;
    return storedToken && storedToken !== 'null' && storedToken !== 'undefined' ? storedToken : null;
  });
  const navigate = useNavigate();

  const setDeepiriRole = (r: DeepiriRole) => {
    setStoredRole(r);
    setDeepiriRoleState(r);
    if (user) {
      const updated = { ...user, metadata: { ...(user.metadata || {}), deepiriRole: r } };
      setUser(updated);
      try { localStorage.setItem('user', JSON.stringify(updated)); } catch {}
    }
  };

  // --- INTERNAL HELPERS ---

  const normalizeToken = (t: string | null | undefined): string | null => {
    if (!t || t === 'null' || t === 'undefined') return null;
    return t;
  };

  const persistUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      const r = getUserRole(userData);
      if (r) {
        setDeepiriRoleState(r);
        try { localStorage.setItem('deepiri_role', r); } catch {}
      }
    } else {
      localStorage.removeItem('user');
    }
  };

  const persistToken = (newToken: string | null | undefined) => {
    const normalized = normalizeToken(newToken);
    setToken(normalized);
    if (normalized) {
      localStorage.setItem('token', normalized);
    } else {
      localStorage.removeItem('token');
    }
  };

  const clearSession = (): void => {
    persistUser(null);
    persistToken(null);
    localStorage.removeItem('refreshToken');
  };

  // --- INITIALIZATION ---

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const rawToken = localStorage.getItem('token') as string | null;
        const rawUser = localStorage.getItem('user') as string | null;
        
        const storedToken = normalizeToken(rawToken);
        
        if (storedToken && rawUser) {
          try {
            const userData = JSON.parse(rawUser);
            persistUser(userData);
            persistToken(storedToken);
            console.log('✅ Session restored');
          } catch (parseError) {
            console.warn('Invalid stored user data, clearing session');
            clearSession();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // --- AUTH METHODS ---

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);
      
      if (response.success) {
        const { user, token } = response;
        persistUser(user);
        persistToken(token);
        toast.success('Welcome back!');
        navigate('/home');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = loginErrorMessage(error);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nameOrData: string | object, email?: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      let payload: any;
      if (typeof nameOrData === 'object' && nameOrData !== null) {
        payload = nameOrData as any;
        // Normalize `name` -> `username` for gateway/auth-service validation
        if (payload.name && !payload.username) {
          payload.username = payload.name;
          delete payload.name;
        }
      } else {
        payload = { username: nameOrData as string, email: email || '', password: password || '' };
      }

      const response = await authApi.register(payload);
      
      if (response.success) {
        const { user, token } = response;
        persistUser(user);
        persistToken(token);
        toast.success('Account created successfully! Complete your profile.');
        navigate('/profile?onboarding=1');
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.error || error?.response?.data?.error || 'Registration failed.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    const wasLoggedIn = !!user;
    clearSession();
    if (!['/login', '/register', '/'].includes(window.location.pathname)) {
      navigate('/');
    }
    if (wasLoggedIn) {
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser: User): void => {
    persistUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    deepiriRole: deepiriRole || getUserRole(user),
    setDeepiriRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};