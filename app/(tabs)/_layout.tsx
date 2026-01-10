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
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme === 'dark' ? '#374151' : '#E5E7EB',
          paddingBottom: 6,
          paddingTop: 6,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
