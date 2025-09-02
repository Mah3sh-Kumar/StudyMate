// File: app/(tabs)/_layout.tsx
// @ts-nocheck
import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { EnhancedTabIcons } from '../../components/EnhancedTabIcons';

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
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme === 'dark' ? DarkTheme.colors.border : DefaultTheme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <EnhancedTabIcons.Home color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="handsfree"
        options={{
          title: 'Handsfree',
          tabBarIcon: ({ color, focused }) => <EnhancedTabIcons.Handsfree color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => <EnhancedTabIcons.Chat color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => <EnhancedTabIcons.Groups color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
