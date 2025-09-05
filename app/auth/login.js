import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock } from '../../components/SimpleIcons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signIn, resetPassword, resendVerificationEmail, user, validateEmail } = useAuth();
  const { colors } = useThemePreference();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const validateInputs = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        const normalizedError = error.toLowerCase();
        
        if (normalizedError.includes('verify') || normalizedError.includes('confirm')) {
          Alert.alert(
            'Email Verification Required',
            'Please verify your email address before signing in. Check your inbox for a verification link.',
            [
              { text: 'OK' },
              {
                text: 'Resend Link',
                onPress: async () => {
                  const { error: resendError } = await resendVerificationEmail(email.trim());
                  if (resendError) {
                    Alert.alert('Error', resendError);
                  } else {
                    Alert.alert('Success', 'Verification link sent! Please check your email.');
                  }
                }
              }
            ]
          );
        } else if (normalizedError.includes('network error') || normalizedError.includes('internet connection')) {
          setErrors({ 
            general: `${error} Make sure you're connected to WiFi or mobile data and try again.` 
          });
        } else {
          setErrors({ general: error });
        }
      } else {
        // Successfully logged in - navigation will be handled by AuthContext
        console.log('Login successful, redirecting...');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling for network issues
      if (error.message && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('network') ||
          error.message.includes('internet_disconnected') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('connection')
        )) {
        setErrors({ 
          general: 'Connection failed. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        Alert.alert('Reset Failed', error);
      } else {
        Alert.alert(
          'Password Reset Sent', 
          'We\'ve sent a password reset link to your email. Please check your inbox and follow the instructions.'
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Unable to send reset email right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>🎓 StudyMate</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome back! Sign in to continue your learning journey</Text>
        </View>

        {errors.general && (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail 
                size={20} 
                color={errors.email ? colors.error : colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text, 
                    borderColor: errors.email ? colors.error : colors.border 
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: null }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
              />
            </View>
            {errors.email && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock 
                size={20} 
                color={errors.password ? colors.error : colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input, 
                  styles.inputWithIcon,
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text, 
                    borderColor: errors.password ? colors.error : colors.border 
                  }
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: null }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: colors.primary },
              loading && [styles.buttonDisabled, { backgroundColor: colors.disabled }]
            ]} 
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color={colors.background} />
                <Text style={[styles.buttonText, { color: colors.background, marginLeft: 8 }]}>
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={handleForgotPassword} 
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity disabled={loading} activeOpacity={0.7}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
    minHeight: 56,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  fieldError: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
