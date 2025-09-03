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
    primary: 'rgb(0, 200, 255)', // electric blue for AMOLED displays
    background: 'rgb(0, 0, 0)', // pure black for OLED pixels off
    card: 'rgb(12, 12, 12)', // very dark gray for subtle elevation
    text: 'rgb(255, 255, 255)', // pure white for maximum contrast
    border: 'rgb(28, 28, 28)', // dark border for subtle separation
    notification: 'rgb(255, 110, 140)', // vivid pink for notifications
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


