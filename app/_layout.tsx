// @ts-nocheck
import { DarkTheme, DefaultTheme, ThemeProvider, useNavigation, DrawerActions } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TouchableOpacity } from 'react-native'; // Import TouchableOpacity
import { Menu } from 'lucide-react-native'; // Import Menu icon

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProviderCustom, useThemePreference } from '../contexts/ThemeContext';
import DrawerContent from '../components/DrawerContent';

export default function RootLayout() {
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
  const scheme = ready ? theme : (fallbackScheme === 'dark' ? 'dark' : 'light');

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
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginLeft: 15 }}>
        <Menu color={colors?.text || (scheme === 'dark' || scheme === 'amoled' ? DarkTheme.colors.text : DefaultTheme.colors.text)} />
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
        screenOptions={{
          drawerStyle: {
            backgroundColor: colors?.background,
            width: 280,
          },
          headerShown: true,
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: "StudyMate", ...commonScreenOptions }} />
        <Drawer.Screen name="plan" options={commonScreenOptions} />
        <Drawer.Screen name="quiz" options={commonScreenOptions} />
        <Drawer.Screen name="tracker" options={commonScreenOptions} />
        <Drawer.Screen name="flashcards" options={commonScreenOptions} />
        <Drawer.Screen name="summarizer" options={commonScreenOptions} />
        <Drawer.Screen name="settings" options={commonScreenOptions} />
        <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="auth/login" options={{ headerShown: false, drawerItemStyle: { height: 0 } }} />
        <Drawer.Screen name="auth/signup" options={{ headerShown: false, drawerItemStyle: { height: 0 } }} />
      </Drawer>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} backgroundColor={colors?.background} />
    </ThemeProvider>
  );
}
