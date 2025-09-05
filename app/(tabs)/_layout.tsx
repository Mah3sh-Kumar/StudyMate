// File: app/(tabs)/_layout.tsx
// @ts-nocheck
import { Tabs } from 'expo-router';
import { useThemePreference } from '../../contexts/ThemeContext';
import BottomTabBar from '../../components/BottomTabBar';
import AuthGuard from '../../components/AuthGuard';

export default function TabLayout() {
  const { theme } = useThemePreference();

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
