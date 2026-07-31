import { create } from 'zustand';

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  [key: string]: unknown;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser | null, token: string | null) => void;
  clearSession: () => void;
};

function normalizeToken(t: string | null | undefined): string | null {
  if (!t || t === 'null' || t === 'undefined') return null;
  return t;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: normalizeToken(localStorage.getItem('token')),
  isAuthenticated: Boolean(normalizeToken(localStorage.getItem('token'))),
  setSession: (user, token) => {
    const normalized = normalizeToken(token);
    if (normalized) localStorage.setItem('token', normalized);
    else localStorage.removeItem('token');
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user, token: normalized, isAuthenticated: Boolean(normalized) });
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
