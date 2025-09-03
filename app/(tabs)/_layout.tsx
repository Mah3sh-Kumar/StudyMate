// File: app/(tabs)/_layout.tsx
// @ts-nocheck
import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { EnhancedTabIcons } from '../../components/EnhancedTabIcons';
import BottomTabBar from '../../components/BottomTabBar';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const { theme } = useThemePreference();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <BottomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="handsfree"
        options={{ title: 'Handsfree' }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat' }}
      />
      <Tabs.Screen
        name="groups"
        options={{ title: 'Groups' }}
      />
    </Tabs>
  );
}
