import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'Light' | 'Dark' | 'System';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const c = useContext(ThemeContext);
  if (!c) throw new Error('useTheme must be inside ThemeProvider');
  return c;
};

function getSystem(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem('deepiri_theme') as Theme | null;
      if (raw === 'Dark' || raw === 'Light' || raw === 'System') return raw;
    } catch {}
    return 'Light';
  });

  const resolved: 'light' | 'dark' = theme === 'System' ? getSystem() : theme === 'Dark' ? 'dark' : 'light';

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem('deepiri_theme', t); } catch {}
    // persist to backend if logged in — fire and forget
    try {
      const token = localStorage.getItem('token');
      if (token) {
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:5100/api') + '/users/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme: t }),
        }).catch(() => {});
      }
    } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [resolved]);

  useEffect(() => {
    if (theme !== 'System') return;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = m.matches ? 'dark' : 'light';
      if (r === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>;
};
