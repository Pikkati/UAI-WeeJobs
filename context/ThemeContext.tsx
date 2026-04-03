import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setThemeMode } from '../constants/theme';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggle: () => Promise<void>;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('weejobs_theme');
        const initial = stored === 'light' ? 'light' : 'dark';
        setMode(initial);
        setThemeMode(initial);
      } catch {
        // ignore
        setThemeMode('dark');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const toggle = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    setThemeMode(next);
    await AsyncStorage.setItem('weejobs_theme', next);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggle, ready }}>
      {ready ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
