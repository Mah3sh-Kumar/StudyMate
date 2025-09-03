import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial user
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, metadata) => {
    // Step 1: Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error: error.message };

    const user = data.user;

    // Step 2: Save extra profile data in "profiles" table
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: user.id, // match auth user id
          full_name: metadata.full_name,
          username: metadata.username,
          email: email,
        },
      ]);

      if (profileError) return { error: profileError.message };
    }

    return { error: null };
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
