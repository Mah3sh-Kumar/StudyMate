import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { useEffect } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, resetPassword, resendVerificationEmail, user } = useAuth();
  const navTheme = useTheme();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        const normalized = (error || '').toLowerCase();
        if (normalized.includes('email not confirmed') || normalized.includes('confirm')) {
          Alert.alert(
            'Verify your email',
            'We sent you a verification link. Please verify your email before signing in.',
            [
              { text: 'OK' },
              {
                text: 'Resend link',
                onPress: async () => {
                  const { error: resendError } = await resendVerificationEmail(email.trim());
                  if (resendError) {
                    Alert.alert('Could not resend', resendError);
                  } else {
                    Alert.alert('Sent', 'Verification link resent. Check your inbox.');
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert('Login Failed', error);
        }
      } else {
        // Successfully logged in, navigate to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToUse = email.trim();
    if (!emailToUse) {
      Alert.alert('Forgot Password', 'Enter your email above first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPassword(emailToUse);
      if (error) {
        Alert.alert('Reset Failed', error);
      } else {
        Alert.alert('Check your inbox', 'We sent a password reset link to your email.');
      }
    } catch (_e) {
      Alert.alert('Error', 'Unable to send reset email right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: navTheme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: navTheme.colors.text }]}>🎓 StudyMate</Text>
          <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>Welcome back! Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: navTheme.colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: navTheme.colors.card, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: navTheme.colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: navTheme.colors.card, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword} disabled={loading}>
            <Text style={[styles.forgotPasswordText, { color: '#6366f1' }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: navTheme.colors.text }]}>Don't have an account? </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: '#6366f1' }]}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 46,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 22,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    padding: 18,
    fontSize: 17,
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 16,
  },
  linkText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
});
