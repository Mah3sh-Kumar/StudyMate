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
      <Drawer>
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
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
