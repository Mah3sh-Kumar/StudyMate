/*

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await auth.updateUser(updates);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

*/

// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial user
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      
      // Check if user has a profile and create one if missing
      if (currentUser) {
        await ensureProfileExists(currentUser);
      }
      
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Check if user has a profile and create one if missing
      if (currentUser) {
        await ensureProfileExists(currentUser);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, metadata) => {
    try {
      // Validate username format before attempting signup
      const username = metadata.username?.trim();
      if (!username || username.length < 3 || username.length > 30) {
        return { error: 'Username must be between 3 and 30 characters' };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { error: 'Username can only contain letters, numbers, and underscores' };
      }

      // Create Auth User with metadata
      // The database trigger will automatically create the profile from raw_user_meta_data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name?.trim() || '',
            username: username,
          },
        },
      });

      if (error) {
        console.error('SignUp error:', error);
        return { error: error.message };
      }

      const userId = data.user?.id;
      if (!userId) {
        return { error: 'User creation failed' };
      }

      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify profile was created by trigger, if not create it manually (fallback)
      const { data: profile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!profile && !checkError) {
        // Trigger didn't create profile, create it manually
        console.log('Creating profile manually (trigger may not exist)');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: metadata.full_name?.trim() || '',
            username: username,
          });

        if (insertError) {
          console.error('Manual profile creation failed:', insertError);
          return { error: 'Database error saving new user: ' + insertError.message };
        }
      }

      console.log('User signed up successfully:', userId);
      return { error: null };
    } catch (err) {
      console.error('SignUp exception:', err);
      return { error: err.message || 'An unexpected error occurred during signup' };
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message };
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message };
  };

  const resendVerificationEmail = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error?.message };
  };

  // Ensure profile exists for user
  const ensureProfileExists = async (user) => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!profile && !error) {
        // Profile doesn't exist, create it from auth metadata
        const fullName = user.user_metadata?.full_name || '';
        const username = user.user_metadata?.username || '';
        const email = user.email || '';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: email,
            full_name: fullName,
            username: username,
          });
        
        if (insertError) {
          console.warn('Auto-profile creation failed:', insertError);
        } else {
          console.log('Profile created automatically for user:', user.id);
        }
      }
    } catch (error) {
      console.warn('Error in ensureProfileExists:', error);
    }
  };

  const updateProfile = async (updates) => {
    // updates may include full_name, username
    const metadata = {};
    if (typeof updates.full_name === 'string') metadata.full_name = updates.full_name;
    if (typeof updates.username === 'string') metadata.username = updates.username;

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({ data: metadata });
    if (authError) return { error: authError.message };

    // Update profiles table if exists
    if (user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: metadata.full_name, username: metadata.username }, { onConflict: 'id' });
      if (profileError) return { error: profileError.message };
    }

    return { error: null };
  };

  const updateStudyPreferences = async (subjects, goals) => {
    if (!user?.id) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, study_subjects: subjects, study_goals: goals }, { onConflict: 'id' });
    return { error: error?.message };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword, resendVerificationEmail, updateProfile, updateStudyPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
