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


import { useThemePreference } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { userService, dbUtils } from '../lib/database';
import { DatabaseSetup } from '../lib/setupDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme, setTheme, colors } = useThemePreference();

  const [notifications, setNotifications] = useState(true);
  const [aiFeatures, setAiFeatures] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [dbStats, setDbStats] = useState(null);

  // Load user profile data + preferences
  useEffect(() => {
    if (user) {
      loadUserProfile();
      checkDatabaseStatus();
    }
    loadPreferences();
  }, [user]);

  useEffect(() => {
    // No need for darkMode state, theme is managed by context
  }, [theme]);

  // Load profile
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await userService.getProfile(user.id);

      if (error) {
        console.warn('Profile not found in DB, fallback to auth metadata.');
        setFullName(user?.user_metadata?.full_name || '');
        setUsername(user?.user_metadata?.username || '');
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

  // Check database status and load stats
  const checkDatabaseStatus = async () => {
    try {
      const status = await DatabaseSetup.checkStatus();
      setDbStatus(status.status);
      
      if (status.status === 'connected') {
        const stats = await DatabaseSetup.getStats();
        if (stats.success) {
          setDbStats(stats.data);
        }
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus('error');
    }
  };

  // Initialize database
  const handleInitializeDatabase = async () => {
    try {
      setLoading(true);
      const result = await DatabaseSetup.setupAndTest();
      
      if (result.success) {
        Alert.alert('✅ Success', 'Database initialized successfully!');
        await checkDatabaseStatus();
      } else {
        Alert.alert('❌ Error', result.error);
      }
    } catch (error) {
      Alert.alert('❌ Error', dbUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // Create sample data
  const handleCreateSampleData = async () => {
    try {
      setLoading(true);
      const result = await DatabaseSetup.createSampleData();
      
      if (result.success) {
        Alert.alert('✅ Success', 'Sample data created successfully!');
        await checkDatabaseStatus();
      } else {
        Alert.alert('❌ Error', result.error);
      }
    } catch (error) {
      Alert.alert('❌ Error', dbUtils.handleError(error));
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
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>⚙️ Settings</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.8 }]}>Manage your account and preferences</Text>
        </View>
        <View style={[styles.headerDecoration, { backgroundColor: colors.primary }]} />
      </View>

      {/* Profile Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👤 Profile</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text, opacity: 0.7 }]}>Manage your personal information</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}> 
            <Text style={styles.avatarText}>{fullName.charAt(0) || user?.email?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: colors.text }]}>{fullName || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.text, opacity: 0.7 }]}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={colors.text + '80'}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor={colors.text + '80'}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveProfile} disabled={loading}>
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
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎨 Preferences</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text, opacity: 0.7 }]}>Customize your app experience</Text>
        </View>
        {/* Theme Buttons */}
        <View style={styles.themeButtonRow}>
          <TouchableOpacity
            style={[styles.themeButton, theme === 'light' && styles.themeButtonActive, { borderColor: colors.border, backgroundColor: theme === 'light' ? colors.primary : colors.card }]}
            onPress={() => setTheme('light')}
          >
            <Text style={[styles.themeButtonText, { color: theme === 'light' ? '#fff' : colors.text }]} numberOfLines={1}>Light</Text>
          </TouchableOpacity>
          <View style={styles.themeButtonSpacer} />
          <TouchableOpacity
            style={[styles.themeButton, theme === 'dark' && styles.themeButtonActive, { borderColor: colors.border, backgroundColor: theme === 'dark' ? colors.primary : colors.card }]}
            onPress={() => setTheme('dark')}
          >
            <Text style={[styles.themeButtonText, { color: theme === 'dark' ? '#fff' : colors.text }]} numberOfLines={1}>Dark</Text>
          </TouchableOpacity>
          <View style={styles.themeButtonSpacer} />
          <TouchableOpacity
            style={[styles.themeButton, theme === 'amoled' && styles.themeButtonActive, { borderColor: colors.border, backgroundColor: theme === 'amoled' ? colors.primary : colors.card }]}
            onPress={() => setTheme('amoled')}
          >
            <Text style={[styles.themeButtonText, { color: theme === 'amoled' ? '#fff' : colors.text }]} numberOfLines={1}>AMOLED</Text>
          </TouchableOpacity>
        </View>
        {/* Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>Receive study reminders and updates</Text>
            </View>
          </View>
          <Switch value={notifications} onValueChange={(val) => savePreferences({ notifications: val })} trackColor={{ false: '#d1d5db', true: colors.primary }} thumbColor={'#ffffff'} />
        </View>
        {/* AI Features */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🤖</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>AI Features</Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>Enable AI-powered study assistance</Text>
            </View>
          </View>
          <Switch value={aiFeatures} onValueChange={(val) => savePreferences({ aiFeatures: val })} trackColor={{ false: '#d1d5db', true: colors.primary }} thumbColor={'#ffffff'} />
        </View>
      </View>

      {/* Database Section */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💾 Database</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text, opacity: 0.7 }]}>Manage your data and database connection</Text>
        </View>
        
        {/* Database Status */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔗</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Database Status</Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>Connection: {dbStatus}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: dbStatus === 'connected' ? '#10B981' : dbStatus === 'error' ? '#EF4444' : '#F59E0B' }]}>
            <Text style={styles.statusText}>{dbStatus === 'connected' ? '✓' : dbStatus === 'error' ? '✗' : '?'}</Text>
          </View>
        </View>
        
        {/* Database Stats */}
        {dbStats && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📊</Text>
              <View style={styles.settingDetails}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Your Data</Text>
                <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>
                  {dbStats.decks} decks, {dbStats.flashcards} cards, {dbStats.sessions} sessions, {dbStats.groups} groups
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Database Actions */}
        {dbStatus !== 'connected' && (
          <TouchableOpacity style={[styles.settingItem, styles.actionItem]} onPress={handleInitializeDatabase}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>⚙️</Text>
              <View style={styles.settingDetails}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>Initialize Database</Text>
                <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>Set up database tables and structure</Text>
              </View>
            </View>
            <Text style={[styles.settingArrow, { color: colors.primary }]}>▶</Text>
          </TouchableOpacity>
        )}
        
        {dbStatus === 'connected' && (!dbStats || (dbStats.decks === 0 && dbStats.flashcards === 0)) && (
          <TouchableOpacity style={[styles.settingItem, styles.actionItem]} onPress={handleCreateSampleData}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌱</Text>
              <View style={styles.settingDetails}>
                <Text style={[styles.settingLabel, { color: colors.primary }]}>Create Sample Data</Text>
                <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.7 }]}>Add sample flashcards and groups to get started</Text>
              </View>
            </View>
            <Text style={[styles.settingArrow, { color: colors.primary }]}>▶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account Actions */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚠️ Account Actions</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text, opacity: 0.7 }]}>Manage your account</Text>
        </View>
        <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Delete Account</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>Permanently remove your account</Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, styles.dangerItem]} onPress={handleSignOut}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🚪</Text>
            <View style={styles.settingDetails}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Sign Out</Text>
              <Text style={[styles.settingDescription, styles.dangerText]}>Log out of your account</Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.text }]}>StudyMate v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.text, opacity: 0.7 }]}>Made with ❤️ for students</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  themeButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
    width: '100%',
  },
  themeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  themeButtonText: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  themeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  themeButtonSpacer: {
    width: 10,
  },
  container: { flex: 1 },
  header: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: { padding: 24, alignItems: 'center' },
  headerDecoration: { height: 4, width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: 'center', alignItems: 'center', marginRight: 20,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  profileDetails: { flex: 1 },
  profileName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 16 },
  inputGroup: { paddingHorizontal: 20, paddingBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  saveButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 16, borderRadius: 12, marginHorizontal: 20, marginBottom: 20 },
  saveButtonIcon: { fontSize: 18, marginRight: 8 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  settingDetails: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  settingDescription: { fontSize: 14 },
  settingArrow: { fontSize: 16, color: '#9ca3af' },
  dangerItem: { borderBottomColor: '#fee2e2' },
  dangerText: { color: '#dc2626' },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionItem: {
    backgroundColor: 'transparent',
  },
  footer: { padding: 30, alignItems: 'center', marginTop: 20 },
  version: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  footerText: { fontSize: 14, fontStyle: 'italic' },
});
