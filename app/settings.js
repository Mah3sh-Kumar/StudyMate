import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';


import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useThemePreference } from '../contexts/ThemeContext';
import { userService } from '../lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useThemePreference();
  const navTheme = useTheme();

  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user profile data + preferences
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
    loadPreferences();
  }, [user]);

  useEffect(() => {
    setDarkMode(theme === 'dark');
  }, [theme]);

  // Load profile
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await userService.getProfile(user.id);

      if (error) {
        console.log('Profile not found in DB, creating from auth metadata...');
        
        // Try to create a profile from auth metadata if it doesn't exist
        const fullNameFromAuth = user?.user_metadata?.full_name || '';
        const usernameFromAuth = user?.user_metadata?.username || '';
        
        // Set the UI values from auth metadata
        setFullName(fullNameFromAuth);
        setUsername(usernameFromAuth);
        
        // Create the profile in the database if it doesn't exist
        if (user && (fullNameFromAuth || usernameFromAuth)) {
          const { error: dbError } = await userService.updateProfile(user.id, {
            full_name: fullNameFromAuth,
            username: usernameFromAuth,
            email: user.email,
          });
          
          if (dbError) {
            console.warn('Created profile from auth metadata, but DB sync failed:', dbError);
          } else {
            console.log('Profile created from auth metadata successfully');
          }
        }
      } else if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setFullName(user?.user_metadata?.full_name || '');
      setUsername(user?.user_metadata?.username || '');
    } finally {
      setLoading(false);
    }
  };

  // Preferences persistence
  const loadPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem('userPreferences');
      if (storedPrefs) {
        const { notifications, aiFeatures } = JSON.parse(storedPrefs);
        setNotifications(notifications);
        setAiFeatures(aiFeatures);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (prefs) => {
    try {
      const newPrefs = { notifications, aiFeatures, ...prefs };
      setNotifications(newPrefs.notifications);
      setAiFeatures(newPrefs.aiFeatures);
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Error', 'Failed to sign out');
          } else {
            router.replace('/auth/login');
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('❌ Error', 'Please enter your full name');
      return;
    }

    try {
      setLoading(true);

      const { error: authError } = await updateProfile({
        full_name: fullName.trim(),
        username: username.trim(),
      });

      if (authError) {
        Alert.alert('❌ Error', `Failed to update profile: ${authError}`);
        return;
      }

      const { error: dbError } = await userService.updateProfile(user.id, {
        full_name: fullName.trim(),
        username: username.trim(),
        email: user.email,
      });

      if (dbError) {
        console.warn('Database update failed:', dbError);
      }

      Alert.alert('✅ Success', 'Profile updated successfully!');
      await loadUserProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('❌ Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
            Alert.alert('Info', 'Account deletion feature coming soon');
          } },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your study data will be exported and sent to your email');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy details coming soon');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service details coming soon');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support at support@studymate.com');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: navTheme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: navTheme.colors.text }]}>⚙️ Settings</Text>
          <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
            Manage your account and preferences
          </Text>
        </View>
        <View
          style={[styles.headerDecoration, { backgroundColor: navTheme.colors.primary || '#6366f1' }]}
        />
      </View>

      {/* Profile Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>👤 Profile</Text>
          <Text style={[styles.sectionSubtitle, { color: navTheme.colors.text }]}>
            Manage your personal information
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: navTheme.colors.primary || '#6366f1' }]}>
            <Text style={styles.avatarText}>{fullName.charAt(0) || user?.email?.charAt(0) || 'U'}</Text>
          </View>

          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: navTheme.colors.text }]}>
              {fullName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: navTheme.colors.text }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: navTheme.colors.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: navTheme.colors.background,
                color: navTheme.colors.text,
                borderColor: navTheme.colors.border,
              },
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={navTheme.colors.text}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: navTheme.colors.text }]}>Username</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: navTheme.colors.background,
                color: navTheme.colors.text,
                borderColor: navTheme.colors.border,
              },
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor={navTheme.colors.text}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: navTheme.colors.primary || '#6366f1' }]}
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>🎨 Preferences</Text>
          <Text style={[styles.sectionSubtitle, { color: navTheme.colors.text }]}>
            Customize your app experience
          </Text>
        </View>

        {/* Dark Mode */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: navTheme.colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: navTheme.colors.text }]}>
                Switch between light and dark themes
              </Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={() => {
              setDarkMode(!darkMode);
              toggleTheme();
            }}
            trackColor={{ false: '#d1d5db', true: navTheme.colors.primary || '#6366f1' }}
            thumbColor={'#ffffff'}
          />
        </View>

        {/* Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: navTheme.colors.text }]}>Notifications</Text>
              <Text style={[styles.settingDescription, { color: navTheme.colors.text }]}>
                Receive study reminders and updates
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={(val) => savePreferences({ notifications: val })}
            trackColor={{ false: '#d1d5db', true: navTheme.colors.primary || '#6366f1' }}
            thumbColor={'#ffffff'}
          />
        </View>

        {/* AI Features */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🤖</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: navTheme.colors.text }]}>AI Features</Text>
              <Text style={[styles.settingDescription, { color: navTheme.colors.text }]}>
                Enable AI-powered study assistance
              </Text>
            </View>
          </View>
          <Switch
            value={aiFeatures}
            onValueChange={(val) => savePreferences({ aiFeatures: val })}
            trackColor={{ false: '#d1d5db', true: navTheme.colors.primary || '#6366f1' }}
            thumbColor={'#ffffff'}
          />
        </View>
      </View>

      {/* Account Actions */}
      <View
        style={[
          styles.section,
          { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>⚠️ Account Actions</Text>
          <Text style={[styles.sectionSubtitle, { color: navTheme.colors.text }]}>
            Manage your account
          </Text>
        </View>

        <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>
                Permanently remove your account
              </Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>▶</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleSignOut}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🚪</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Sign Out</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>
                Log out of your account
              </Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.version, { color: navTheme.colors.text }]}>StudyMate v1.0.0</Text>
        <Text style={[styles.footerText, { color: navTheme.colors.text }]}>
          Made with ❤️ for students
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: { padding: 24, alignItems: 'center' },
  headerDecoration: { height: 5, width: '100%' },
  title: { fontSize: 34, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  subtitle: { fontSize: 17, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  section: {
    marginTop: 22,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  sectionSubtitle: { fontSize: 15, color: '#6b7280' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', padding: 22 },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    justifyContent: 'center', alignItems: 'center', marginRight: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  profileDetails: { flex: 1 },
  profileName: { fontSize: 26, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  profileEmail: { fontSize: 16, color: '#6b7280' },
  inputGroup: { paddingHorizontal: 22, paddingBottom: 18 },
  inputLabel: { fontSize: 17, fontWeight: '700', marginBottom: 10, letterSpacing: 0.2 },
  input: { borderWidth: 1, borderRadius: 14, padding: 18, fontSize: 17 },
  saveButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 18, borderRadius: 14, marginHorizontal: 22, marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonIcon: { fontSize: 19, marginRight: 10 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 17, letterSpacing: 0.5 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  settingDetails: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingDescription: { fontSize: 14, color: '#6b7280' },
  settingArrow: { fontSize: 16, color: '#9ca3af' },
  dangerItem: { borderBottomColor: '#fee2e2' },
  dangerText: { color: '#dc2626' },
  footer: { padding: 30, alignItems: 'center', marginTop: 20 },
  version: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  footerText: { fontSize: 14, color: '#6b7280', fontStyle: 'italic' },
});
