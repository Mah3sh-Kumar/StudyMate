import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://oyvmxabdpcnutnrzmpgc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dm14YWJkcGNudXRucnptcGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTU1NDEsImV4cCI6MjA3MjAzMTU0MX0.cCwzpiuuufGODI3RzWeTfWqBZ45IAV-qcVqFUfaHWt8'; // shortened here for safety

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
