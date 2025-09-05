import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

// Icon component for consistent icon rendering
const Icon = ({ name, size = 22, color = '#000' }) => {
  const iconMap = {
    home: '🏠',
    'calendar-check': '📅',
    'clipboard-text': '📋',
    'chart-line': '📊',
    albums: '🃏',
    'file-document-edit': '📝',
    database: '🗄️',
    settings: '⚙️',
    'information-circle-outline': 'ℹ️',
    'help-circle-outline': '❓',
    logout: '🚪'
  };
  return (
    <Text style={{ fontSize: size, color, textAlign: 'center', minWidth: size }}>
      {iconMap[name] || '❓'}
    </Text>
  );
};

const menuItems = [
  { label: 'Home', route: '(tabs)', iconName: 'home' },
  { label: 'Plan', route: 'plan', iconName: 'calendar-check' },
  { label: 'Quiz', route: 'quiz', iconName: 'clipboard-text' },
  { label: 'Tracker', route: 'tracker', iconName: 'chart-line' },
  { label: 'Flashcards', route: 'flashcards', iconName: 'albums' },
  { label: 'Summarizer', route: 'summarizer', iconName: 'file-document-edit' },

  { label: 'Settings', route: 'settings', iconName: 'settings' },
];

const DrawerContent = ({ navigation, state }) => {
  const { theme, colors } = useThemePreference();
  const { signOut, user, getUserDisplayName, profile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
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
            setLoggingOut(true);
            try {
              console.log('Drawer logout - Attempting to sign out...');
              const result = await signOut();
              console.log('Drawer logout - Sign out result:', result);
              
              if (result?.error) {
                console.error('Drawer logout error:', result.error);
                Alert.alert('Error', result.error);
              } else {
                console.log('Drawer logout successful, redirecting to login');
                router.replace('/auth/login');
              }
            } catch (error) {
              console.error('Drawer logout catch error:', error);
              Alert.alert('Error', 'An unexpected error occurred while signing out.');
              // Force navigation even if error occurs
              router.replace('/auth/login');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header with User Info */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.primary }]}>🎓 StudyMate</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {profile?.full_name || profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
            </Text>
            {user.email && (
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user.email}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, idx) => {
          const routeName = state?.routeNames?.find(route => route === item.route) || item.route;
          const focused = state?.routeNames?.indexOf(routeName) === state?.index;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                focused && {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                },
              ]}
              onPress={() => {
                try {
                  if (item.route === '(tabs)') {
                    // Special handling for Home - navigate to main tabs
                    navigation.navigate('(tabs)');
                  } else {
                    navigation.navigate(item.route);
                  }
                } catch (error) {
                  console.log('Navigation error:', error);
                  // Fallback to router.push if navigation.navigate fails
                  if (item.route === '(tabs)') {
                    router.push('/');
                  } else {
                    router.push(`/${item.route}`);
                  }
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Icon 
                  name={item.iconName} 
                  size={22} 
                  color={focused ? '#FFFFFF' : colors.text} 
                />
              </View>
              <Text
                style={[
                  styles.menuText,
                  {
                    color: focused ? '#FFFFFF' : colors.text,
                    fontWeight: focused ? 'bold' : 'normal',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}> 
        <TouchableOpacity 
          style={styles.footerBtn} 
          onPress={() => {
            try {
              navigation.navigate('About');
            } catch (error) {
              console.log('About navigation error:', error);
              // Could implement About page or show info modal
              Alert.alert('About', 'StudyMate - Your AI-Powered Study Companion');
            }
          }}
          disabled={loggingOut}
        >
          <Icon name="information-circle-outline" size={18} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>About</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerBtn} 
          onPress={() => {
            try {
              navigation.navigate('Help');
            } catch (error) {
              console.log('Help navigation error:', error);
              // Could implement Help page or show help modal
              Alert.alert('Help', 'Need assistance? Contact support or check our documentation.');
            }
          }}
          disabled={loggingOut}
        >
          <Icon name="help-circle-outline" size={18} color={colors.text} />
          <Text style={[styles.footerText, { color: colors.text }]}>Help</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerBtn, loggingOut && styles.footerBtnDisabled]} 
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Icon name="logout" size={18} color={colors.text} />
          )}
          <Text style={[styles.footerText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  menu: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, // Increase from 14 to 16
    paddingHorizontal: 16,
    marginVertical: 4, // Reduce from 6 to 4
    marginHorizontal: 8, // Add horizontal margin
    minHeight: 48, // Ensure adequate touch target
  },
  iconWrapper: {
    marginRight: 16,
    width: 28, // Fixed width for alignment
    alignItems: 'center',
  },
  menuText: {
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10, // Increase from 8 to 10
    paddingHorizontal: 8, // Increase from 4 to 8
    borderRadius: 8,
    minHeight: 40, // Ensure adequate touch target
  },
  footerBtnDisabled: {
    opacity: 0.6,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default DrawerContent;
