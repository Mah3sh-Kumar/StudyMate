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
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useThemePreference } from '../../contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock, User } from '../../components/SimpleIcons';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signUp, validateEmail, validatePassword } = useAuth();
  const { colors } = useThemePreference();

  const validateInputs = () => {
    const newErrors = {};
    
    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        username: username.trim(),
      });
      
      if (error) {
        // Check if it's a network error and provide helpful message
        if (error.includes('Network error') || error.includes('internet connection')) {
          setErrors({ 
            general: `${error} Make sure you're connected to WiFi or mobile data and try again.` 
          });
        } else {
          setErrors({ general: error });
        }
      } else {
        Alert.alert(
          'Success!', 
          'Account created successfully! Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Signup successful, navigating to login...');
                router.replace('/auth/login');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      
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

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
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
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create your account to start your learning journey</Text>
        </View>

        {errors.general && (
          <View style={[styles.errorContainer, { backgroundColor: colors.errorBackground }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User 
                size={20} 
                color={errors.fullName ? colors.error : colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text, 
                    borderColor: errors.fullName ? colors.error : colors.border 
                  }
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearFieldError('fullName');
                }}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                editable={!loading}
              />
            </View>
            {errors.fullName && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View style={styles.inputWrapper}>
              <User 
                size={20} 
                color={errors.username ? colors.error : colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text, 
                    borderColor: errors.username ? colors.error : colors.border 
                  }
                ]}
                placeholder="Choose a username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  clearFieldError('username');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                editable={!loading}
              />
            </View>
            {errors.username && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{errors.username}</Text>
            )}
          </View>

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
                  clearFieldError('email');
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
                placeholder="Create a password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearFieldError('password');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
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

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Lock 
                size={20} 
                color={errors.confirmPassword ? colors.error : colors.textSecondary} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input, 
                  styles.inputWithIcon,
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text, 
                    borderColor: errors.confirmPassword ? colors.error : colors.border 
                  }
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearFieldError('confirmPassword');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.fieldError, { color: colors.error }]}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { backgroundColor: colors.primary },
              loading && [styles.buttonDisabled, { backgroundColor: colors.disabled }]
            ]} 
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color={colors.background} />
                <Text style={[styles.buttonText, { color: colors.background, marginLeft: 8 }]}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity disabled={loading} activeOpacity={0.7}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
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
    marginBottom: 30,
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
