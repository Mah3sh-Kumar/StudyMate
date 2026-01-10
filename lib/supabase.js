import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://koozfphoybhwzqolmgzn.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3pmcGhveWJod3pxb2xtZ3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTMxNTYsImV4cCI6MjA4MzMyOTE1Nn0.71x3TNXolowzBUd-dmMhl3NA_lvkVyEOBQWa4J9V5ko';

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env file.');
}

// Create a single client for both web and native. On native, use AsyncStorage.
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native has no URL to parse OAuth code; keep false there.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export { supabase };

// Optional helper exports
export const auth = supabase.auth;
export const db = supabase.from;
