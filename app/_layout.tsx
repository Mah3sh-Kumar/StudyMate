// @ts-nocheck
import { DarkTheme, DefaultTheme, ThemeProvider, useNavigation, DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu, Home, MessageCircle, Users, Mic, BookOpen, Target, ClipboardCheck, Timer, Settings, FileText, Layers } from 'lucide-react-native';
import { LogBox } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProviderCustom, useThemePreference } from '../contexts/ThemeContext';
import { ErrorModalProvider } from '../components/ErrorModal';

// Disable all LogBox warnings in the app
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProviderCustom>
        <ErrorModalProvider>
          <InnerNavigator fallbackScheme={colorScheme} />
        </ErrorModalProvider>
      </ThemeProviderCustom>
    </AuthProvider>
  );
}

function InnerNavigator({ fallbackScheme }) {
  const { theme, ready } = useThemePreference();
  const scheme = ready ? theme : (fallbackScheme === 'dark' ? 'dark' : 'light');

  const commonScreenOptions = ({ navigation }) => ({
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginLeft: 15 }}>
        <Menu color={scheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text} />
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: scheme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card,
    },
    headerTitleStyle: {
      color: scheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text,
      fontWeight: 'bold',
    },
  });

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          drawerActiveTintColor: scheme === 'dark' ? '#A78BFA' : '#6366F1',
          drawerInactiveTintColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: '600',
            marginLeft: 8,
          },
          drawerStyle: {
            backgroundColor: scheme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card,
            width: 280,
          },
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 12,
            marginVertical: 2,
            paddingVertical: 8,
            paddingHorizontal: 12,
          },
          drawerIconStyle: {
            marginRight: 8,
          },
        }}
      >
        <Drawer.Screen 
          name="(tabs)" 
          options={{ 
            title: "Home",
            drawerIcon: ({ color, size }) => <Home color={color} size={size} />,
            ...commonScreenOptions 
          }} 
        />
        <Drawer.Screen 
          name="plan" 
          options={{
            title: "Study Planner",
            drawerIcon: ({ color, size }) => <Target color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen 
          name="quiz" 
          options={{
            title: "Quiz Generator",
            drawerIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen 
          name="tracker" 
          options={{
            title: "Time Tracker",
            drawerIcon: ({ color, size }) => <Timer color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen 
          name="flashcards" 
          options={{
            title: "Flashcards",
            drawerIcon: ({ color, size }) => <Layers color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen 
          name="summarizer" 
          options={{
            title: "AI Summarizer",
            drawerIcon: ({ color, size }) => <FileText color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen 
          name="settings" 
          options={{
            title: "Settings",
            drawerIcon: ({ color, size }) => <Settings color={color} size={size} />,
            ...commonScreenOptions
          }} 
        />
        <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="auth/login" options={{ headerShown: false, drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="auth/signup" options={{ headerShown: false, drawerItemStyle: { height: 0 } }} />
      </Drawer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
