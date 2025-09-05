import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/environment';

// Get Supabase configuration from environment
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
  throw new Error('Supabase configuration is incomplete');
}

// Log configuration status (safely, without exposing keys)
console.log('🔧 Fresh Supabase Client Configuration:');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('  Platform:', Platform.OS);


export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for session persistence on React Native
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    
    // Enable automatic token refresh for seamless experience
    autoRefreshToken: true,
    
    // Persist sessions across app restarts
    persistSession: true,
    
    // Detect session in URL only on web platforms (not needed for React Native)
    detectSessionInUrl: Platform.OS === 'web',
    
    // Flow type for authentication (PKCE is recommended for mobile)
    flowType: 'pkce'
  },
  
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'StudyMate-Fresh/1.0.0',
      'X-Platform': Platform.OS
    }
  },
  
  // Realtime configuration
  realtime: {
    // Connection timeout (30 seconds)
    timeout: 30000,
    
    // Heartbeat interval (keep connection alive)
    heartbeatIntervalMs: 30000
  },
  
  // Database configuration
  db: {
    schema: 'public'
  }
});

/**
 * Test Supabase connection health
 * 
 * This function performs basic connectivity tests to ensure
 * the Supabase client is properly configured and connected.
 * 
 * @returns {Promise<Object>} Connection health status
 */
export const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // Test 1: Check if we can get the current session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError && !sessionError.message.includes('session_not_found')) {
      return {
        success: false,
        error: `Session test failed: ${sessionError.message}`,
        details: { sessionError }
      };
    }
    
    console.log('✅ Session check passed');
    
    // Test 2: Test basic database connectivity
    // We'll use a simple query that should work even without tables
    const { error: dbError } = await supabaseClient
      .from('users') // This table doesn't exist yet, but connection will be tested
      .select('count')
      .limit(0); // Don't actually fetch data
    
    // Note: We expect this to fail with "table doesn't exist", not connection errors
    const isConnectionError = dbError && (
      dbError.message.includes('network') ||
      dbError.message.includes('fetch') ||
      dbError.message.includes('timeout') ||
      dbError.message.includes('connection')
    );
    
    if (isConnectionError) {
      return {
        success: false,
        error: `Database connection failed: ${dbError.message}`,
        details: { dbError }
      };
    }
    
    console.log('✅ Database connection test passed');
    
    // Success! Connection is working
    return {
      success: true,
      message: 'Supabase connection is healthy',
      details: {
        platform: Platform.OS,
        hasSession: !!sessionData?.session,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      error: `Unexpected error during connection test: ${error.message}`,
      details: { error: error.toString() }
    };
  }
};

/**
 * Get current user session
 * 
 * @returns {Promise<Object>} Current session data
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    return { session: data?.session, user: data?.session?.user, error };
  } catch (error) {
    return { session: null, user: null, error };
  }
};

/**
 * Sign out current user
 * 
 * @returns {Promise<Object>} Sign out result
 */
export const signOut = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut();
    return { success: !error, error };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Helper function to check if user is authenticated
 * 
 * @returns {Promise<boolean>} Authentication status
 */
export const isAuthenticated = async () => {
  const { session } = await getCurrentSession();
  return !!session;
};

// Export the client as default for easier imports
export default supabaseClient;

// Named exports for specific functionality
export {
  supabaseClient as supabase,
  getCurrentSession as getSession,
  isAuthenticated as checkAuth
};

// Log successful initialization
console.log('✅ Fresh Supabase client initialized successfully');