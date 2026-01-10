/**
 * Theme-Consistent Error Modal Component for StudyMate App
 * 
 * This component displays errors in a user-friendly way using the app's theme.
 * It replaces Alert.alert with a consistent, styled modal.
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

// Create context for error modal
const ErrorModalContext = createContext();

// Error Modal Provider Component
export const ErrorModalProvider = ({ children }) => {
  const [errorState, setErrorState] = useState({
    isVisible: false,
    title: '',
    message: '',
    onRetry: null,
    showRetryButton: false
  });

  // Function to show error modal globally
  const showError = ({ title, message, onRetry, showRetryButton = false }) => {
    setErrorState({
      isVisible: true,
      title: title || 'Error',
      message: message || 'Something went wrong. Please try again later.',
      onRetry,
      showRetryButton
    });
  };

  const hideError = () => {
    setErrorState(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleRetry = () => {
    if (errorState.onRetry) {
      errorState.onRetry();
    }
    hideError();
  };

  const { theme } = useThemePreference();
  const currentTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ErrorModalContext.Provider value={{ showError }}>
      {children}
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorState.isVisible}
        onRequestClose={hideError}
      >
        <Pressable style={[styles.centeredView, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} onPress={hideError}>
          <Pressable 
            style={[styles.modalView, { 
              backgroundColor: currentTheme.colors.card,
              borderColor: currentTheme.colors.border,
            }]}
            onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <View style={styles.iconContainer}>
              <Text style={[styles.icon, { color: '#EF4444' }]}>⚠️</Text>
            </View>
            
            <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
              {errorState.title || 'Error'}
            </Text>
            
            <Text style={[styles.modalText, { color: currentTheme.colors.text }]}>
              {errorState.message || 'Something went wrong. Please try again later.'}
            </Text>
            
            <View style={styles.buttonContainer}>
              {errorState.showRetryButton && (
                <TouchableOpacity
                  style={[styles.button, styles.retryButton, { backgroundColor: currentTheme.colors.primary || '#6366F1' }]}
                  onPress={handleRetry}
                >
                  <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.dismissButton, { backgroundColor: '#9CA3AF' }]}
                onPress={hideError}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ErrorModalContext.Provider>
  );
};

// Hook to access the error modal from components
export const useErrorModal = () => {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error('useErrorModal must be used within an ErrorModalProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    width: '85%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginBottom: 15,
  },
  icon: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  retryButton: {
    backgroundColor: '#6366F1', // Primary theme color
  },
  dismissButton: {
    backgroundColor: '#9CA3AF', // Gray color
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Default ErrorModal component (kept for backward compatibility)
const ErrorModal = ({ isVisible, title, message, onDismiss, onRetry, showRetryButton = false }) => {
  // This component is kept for backward compatibility if needed elsewhere
  return null;
};

export default ErrorModal;