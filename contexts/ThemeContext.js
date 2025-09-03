import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const themeColors = {
  light: {
    primary: 'rgb(0, 106, 255)',
    background: 'rgb(248, 249, 251)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(25, 25, 28)',
    border: 'rgb(220, 222, 225)',
    notification: 'rgb(255, 80, 85)',
  },
  dark: {
    primary: 'rgb(64, 156, 255)',
    background: 'rgb(12, 12, 14)',
    card: 'rgb(24, 24, 26)',
    text: 'rgb(235, 235, 237)',
    border: 'rgb(50, 50, 54)',
    notification: 'rgb(255, 95, 90)',
  },
  amoled: {
    primary: 'rgb(0, 180, 255)', // brighter blue for AMOLED
    background: 'rgb(0, 0, 0)',
    card: 'rgb(10, 10, 12)',
    text: 'rgb(255, 255, 255)', // pure white for best contrast
    border: 'rgb(30, 30, 40)',
    notification: 'rgb(255, 100, 130)',
  },
};

const ThemeContext = createContext();


export function ThemeProviderCustom({ children }) {
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('studymate_theme');
        if (['light', 'dark', 'amoled'].includes(stored)) setTheme(stored);
      } catch {}
      setReady(true);
    })();
  }, []);

  // Cycle through all three themes
  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'amoled' : 'light';
    setTheme(next);
    try {
      await AsyncStorage.setItem('studymate_theme', next);
    } catch {}
  };

  // Direct setTheme for UI toggle
  const setThemeDirect = async (newTheme) => {
    if (!['light', 'dark', 'amoled'].includes(newTheme)) return;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('studymate_theme', newTheme);
    } catch {}
  };

  const value = { theme, toggleTheme, setTheme: setThemeDirect, ready, colors: themeColors[theme] };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemePreference = () => useContext(ThemeContext);


