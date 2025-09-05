import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { authService, getUserById } from '../lib/mockData';

const AuthContext = createContext();

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    errors: [
      ...(password.length < 6 ? ['Password must be at least 6 characters long'] : []),
      ...(!/(?=.*[a-z])/.test(password) ? ['Password must contain at least one lowercase letter'] : []),
      ...(!/(?=.*[A-Z])/.test(password) ? ['Password must contain at least one uppercase letter'] : []),
      ...(!/(?=.*\d)/.test(password) ? ['Password must contain at least one number'] : [])
    ]
  };
};

const formatAuthError = (error) => {
  if (!error) return null;
  
  const errorMessage = error.toLowerCase();
  
  // Network connectivity errors - MUST BE FIRST
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
      errorMessage.includes('internet_disconnected') || errorMessage.includes('connection') ||
      errorMessage.includes('timeout') || errorMessage.includes('offline') ||
      errorMessage.includes('err_internet_disconnected') || errorMessage.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (errorMessage.includes('email not confirmed') || errorMessage.includes('confirm')) {
    return 'Please verify your email address before signing in. Check your inbox for a verification link.';
  }
  
  if (errorMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (errorMessage.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  if (errorMessage.includes('password is too weak')) {
    return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
  }
  
  if (errorMessage.includes('signup is disabled')) {
    return 'New account registration is currently disabled. Please contact support.';
  }
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  
  return error; // Return original error if no specific handling
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Load initial user from AsyncStorage
    const initializeAuth = async () => {
      console.log('🔧 Initializing auth...');
      try {
        const storedUser = await AsyncStorage.getItem('auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('📱 Session loaded:', userData?.email || 'No user');
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        console.log('✅ Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Load profile from centralized mock data
      const user = getUserById(userId);
      if (user && user.profile) {
        setProfile(user.profile);
      } else {
        // Fallback profile if not found in mock data
        const fallbackProfile = {
          id: userId,
          full_name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          study_subjects: [],
          study_goals: [],
          preferences: {
            study_duration: 25,
            break_duration: 5,
            daily_goal_hours: 4
          }
        };
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      // Input validation
      if (!email || !password || !metadata?.full_name || !metadata?.username) {
        return { error: 'All fields are required' };
      }

      if (!validateEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { error: passwordValidation.errors[0] };
      }

      // Use centralized auth service
      const result = await authService.signup(email, password, metadata);
      
      if (result.error) {
        return { error: formatAuthError(result.error.message) };
      }

      const newUser = result.data.user;
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
      setUser(newUser);
      
      // Load profile from mock data
      await loadUserProfile(newUser.id);
      
      // Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);

      return { error: null, user: newUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: formatAuthError(error.message) };
    }
  };

  const signIn = async (email, password) => {
    try {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }

      if (!validateEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      // Use centralized auth service
      const result = await authService.login(email, password);
      
      if (result.error) {
        return { error: formatAuthError(result.error.message) };
      }

      const authenticatedUser = result.data.user;
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      // Load profile from mock data
      await loadUserProfile(authenticatedUser.id);
      
      // Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);

      return { error: null, user: authenticatedUser };
    } catch (error) {
      console.error('Signin error:', error);
      return { error: formatAuthError(error.message) };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      
      // Use centralized auth service
      await authService.logout();
      
      // Clear all user state and AsyncStorage
      await AsyncStorage.removeItem('auth_user');
      setUser(null);
      setProfile(null);
      
      // Navigate to login
      setTimeout(() => {
        router.replace('/auth/login');
      }, 100);
      
      console.log('SignOut successful');
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      // Still clear local state even if AsyncStorage fails
      setUser(null);
      setProfile(null);
      return { error: 'An error occurred while signing out. Please try again.' };
    }
  };

  const resetPassword = async (email) => {
    try {
      if (!email) {
        return { error: 'Email address is required' };
      }

      if (!validateEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      // Mock password reset - in real app this would send actual email
      console.log('Password reset requested for:', email);
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'An error occurred while sending the reset email. Please try again.' };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      if (!email) {
        return { error: 'Email address is required' };
      }

      if (!validateEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }

      // Mock email resend - in real app this would resend verification
      console.log('Verification email resend requested for:', email);
      return { error: null };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { error: 'An error occurred while resending the verification email. Please try again.' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) {
        return { error: 'Not authenticated' };
      }

      // Mock profile update - in real app this would update Supabase
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // Update stored user data
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...updates
        }
      };
      
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred while updating profile. Please try again.' };
    }
  };

  const updateStudyPreferences = async (subjects, goals) => {
    try {
      if (!user?.id) {
        return { error: 'Not authenticated' };
      }
      
      // Mock study preferences update
      const updatedProfile = {
        ...profile,
        study_subjects: subjects,
        study_goals: goals,
        updated_at: new Date().toISOString()
      };
      
      setProfile(updatedProfile);
      
      return { error: null };
    } catch (error) {
      console.error('Update study preferences error:', error);
      return { error: 'An unexpected error occurred while updating study preferences. Please try again.' };
    }
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return !loading && !!user;
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.username) return profile.username;
    if (user?.email) return user.email;
    return 'User';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        loading, 
        signUp, 
        signIn, 
        signOut, 
        resetPassword, 
        resendVerificationEmail, 
        updateProfile, 
        updateStudyPreferences,
        isAuthenticated,
        getUserDisplayName,
        // Utility functions
        validateEmail,
        validatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
