// @ts-nocheck
import { DarkTheme, DefaultTheme, ThemeProvider, DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProviderCustom, useThemePreference } from '../contexts/ThemeContext';
import DrawerContent from '../components/DrawerContent';
import { useAuth } from '../contexts/AuthContext';
import { createShadow } from '../utils/webSafeStyles';

export default function RootLayout() {
  console.log('🌐 RootLayout rendering');
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProviderCustom>
        <InnerNavigator fallbackScheme={colorScheme} />
      </ThemeProviderCustom>
    </AuthProvider>
  );
}

function InnerNavigator({ fallbackScheme }) {
  const { theme, ready, colors } = useThemePreference();
  const { user, loading, signOut } = useAuth();
  const scheme = ready ? theme : (fallbackScheme === 'dark' ? 'dark' : 'light');

  // Debug logging
  console.log('📱 InnerNavigator render:', { ready, loading, user: !!user, scheme });

  // Show loading while checking authentication
  if (!ready || loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#ffffff' 
      }}>
        <Text style={{ 
          fontSize: 18, 
          color: '#6366F1', 
          marginBottom: 10,
          fontWeight: 'bold'
        }}>
          🎓 StudyMate
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#666666' 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Always render the drawer navigator - individual screens will handle auth

  // Create custom navigation theme based on our app theme
  const customNavigationTheme = {
    dark: scheme === 'light' ? false : true,
    colors: {
      primary: colors?.primary || (scheme === 'light' ? DefaultTheme.colors.primary : DarkTheme.colors.primary),
      background: colors?.background || (scheme === 'light' ? DefaultTheme.colors.background : DarkTheme.colors.background),
      card: colors?.card || (scheme === 'light' ? DefaultTheme.colors.card : DarkTheme.colors.card),
      text: colors?.text || (scheme === 'light' ? DefaultTheme.colors.text : DarkTheme.colors.text),
      border: colors?.border || (scheme === 'light' ? DefaultTheme.colors.border : DarkTheme.colors.border),
      notification: colors?.notification || (scheme === 'light' ? DefaultTheme.colors.notification : DarkTheme.colors.notification),
    },
    fonts: scheme === 'light' ? DefaultTheme.fonts : DarkTheme.fonts,
  };

  const commonScreenOptions = ({ navigation }) => ({
    headerLeft: () => (
      <TouchableOpacity 
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
        style={{ 
          marginLeft: 15,
          padding: 10,
          borderRadius: 10,
          backgroundColor: colors?.primary + '30',
          borderWidth: 1,
          borderColor: colors?.primary + '50',
          ...createShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4
          })
        }}
        activeOpacity={0.7}
      >
        <Text 
          style={{
            color: colors?.text || (scheme === 'dark' || scheme === 'amoled' ? '#FFFFFF' : '#000000'), 
            fontSize: 20,
            fontWeight: 'bold'
          }}
        >
          ☰
        </Text>
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity 
        onPress={async () => {
          console.log('Logout button pressed');
          
          // Show confirmation alert
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                  try {
                    console.log('Attempting to sign out...');
                    const result = await signOut();
                    console.log('Sign out result:', result);
                    
                    if (result?.error) {
                      console.error('Logout error:', result.error);
                      Alert.alert('Error', result.error);
                    } else {
                      console.log('Logout successful, redirecting to login');
                      // Immediate navigation without timeout
                      router.replace('/auth/login');
                    }
                  } catch (err) {
                    console.error('Logout catch error:', err);
                    Alert.alert('Error', 'An unexpected error occurred during logout.');
                    // Force logout and redirect even if error occurs
                    router.replace('/auth/login');
                  }
                },
              },
            ]
          );
        }}
        style={{ 
          marginRight: 15,
          padding: 8,
          borderRadius: 8,
          backgroundColor: '#ff6b6b20',
          ...createShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 2
          })
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' }}>LOGOUT</Text>
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: colors?.card || (scheme === 'dark' || scheme === 'amoled' ? DarkTheme.colors.card : DefaultTheme.colors.card),
    },
    headerTitleStyle: {
      color: colors?.text || (scheme === 'dark' || scheme === 'amoled' ? DarkTheme.colors.text : DefaultTheme.colors.text),
      fontWeight: 'bold',
    },
  });

  return (
    <ThemeProvider value={customNavigationTheme}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={({ route }) => {
          // Hide drawer for auth screens
          const isAuthScreen = route.name?.includes('auth/');
          
          return {
            drawerStyle: {
              backgroundColor: colors?.background,
              width: 280,
            },
            headerShown: !isAuthScreen, // Hide header for auth screens
            drawerItemStyle: isAuthScreen ? { height: 0 } : undefined, // Hide from drawer
          };
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: "StudyMate", ...commonScreenOptions }} />
        <Drawer.Screen name="plan" options={{ title: "Study Plan", ...commonScreenOptions }} />
        <Drawer.Screen name="quiz" options={{ title: "Quiz", ...commonScreenOptions }} />
        <Drawer.Screen name="tracker" options={{ title: "Progress Tracker", ...commonScreenOptions }} />
        <Drawer.Screen name="flashcards" options={{ title: "Flashcards", ...commonScreenOptions }} />
        <Drawer.Screen name="summarizer" options={{ title: "Summarizer", ...commonScreenOptions }} />
        <Drawer.Screen name="settings" options={{ title: "Settings", ...commonScreenOptions }} />
        <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen 
          name="auth/login" 
          options={{ 
            headerShown: false, 
            drawerItemStyle: { height: 0 },
            swipeEnabled: false // Disable swipe to prevent accidental drawer opening
          }} 
        />
        <Drawer.Screen 
          name="auth/signup" 
          options={{ 
            headerShown: false, 
            drawerItemStyle: { height: 0 },
            swipeEnabled: false // Disable swipe to prevent accidental drawer opening
          }} 
        />
      </Drawer>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} backgroundColor={colors?.background} />
    </ThemeProvider>
  );
}
