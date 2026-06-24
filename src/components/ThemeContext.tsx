/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeType } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  autoNightMode: boolean;
  setAutoNightMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('mailiq-theme') as ThemeType;
    if (saved && ['light', 'dark', 'night'].includes(saved)) {
      return saved;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [autoNightMode, setAutoNightModeState] = useState<boolean>(() => {
    return localStorage.getItem('mailiq-auto-night') === 'true';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('mailiq-theme', newTheme);
  };

  const setAutoNightMode = (enabled: boolean) => {
    setAutoNightModeState(enabled);
    localStorage.setItem('mailiq-auto-night', String(enabled));
  };

  // Check and apply scheduled Night Mode (9 PM to 7 AM)
  useEffect(() => {
    if (!autoNightMode) return;

    const checkTimeAndApply = () => {
      const now = new Date();
      const hour = now.getHours();
      // Between 9:00 PM (21) and 7:00 AM
      if (hour >= 21 || hour < 7) {
        if (theme !== 'night') {
          setTheme('night');
        }
      } else {
        // Daytime: if currently in night mode and scheduled, default back to light/dark
        if (theme === 'night') {
          const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setTheme(pref);
        }
      }
    };

    checkTimeAndApply();
    const interval = setInterval(checkTimeAndApply, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [autoNightMode, theme]);

  // Sync HTML class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'night');
    root.classList.add(theme);

    // Apply global background colors to body for smooth experience
    if (theme === 'night') {
      root.style.backgroundColor = '#1A1208';
      root.style.color = '#F5E6C8';
    } else if (theme === 'dark') {
      root.style.backgroundColor = '#0F172A';
      root.style.color = '#F1F5F9';
    } else {
      root.style.backgroundColor = '#F8FAFC';
      root.style.color = '#111827';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, autoNightMode, setAutoNightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
