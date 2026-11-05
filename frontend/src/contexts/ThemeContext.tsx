'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'auto',
  isDark: true,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  // Determine dark state based on themeMode & time of day
  const calculateIsDark = (mode: ThemeMode): boolean => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;

    // 'auto' mode: check time of day
    // Daytime is 06:00 to 18:00 (light), Night is 18:00 to 06:00 (dark)
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    return isNight;
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('everythinganything_theme_mode') as ThemeMode | null;
    const initialMode: ThemeMode = saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'auto';
    setThemeModeState(initialMode);

    const dark = calculateIsDark(initialMode);
    setIsDark(dark);
    applyThemeClass(dark);

    // If auto, periodically re-check every minute for day/night change
    const interval = setInterval(() => {
      const currentSaved = (localStorage.getItem('everythinganything_theme_mode') as ThemeMode) || 'auto';
      if (currentSaved === 'auto') {
        const nextDark = calculateIsDark('auto');
        setIsDark(nextDark);
        applyThemeClass(nextDark);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const applyThemeClass = (dark: boolean) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('everythinganything_theme_mode', mode);
    const dark = calculateIsDark(mode);
    setIsDark(dark);
    applyThemeClass(dark);
  };

  const toggleTheme = () => {
    // Cycles: auto -> light -> dark -> auto
    if (themeMode === 'auto') {
      setThemeMode(isDark ? 'light' : 'dark');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('auto');
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

