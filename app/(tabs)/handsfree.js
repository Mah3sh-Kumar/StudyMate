import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useThemePreference } from '../../contexts/ThemeContext';

// Get the screen width for responsive design
const { width } = Dimensions.get('window');
const NUM_BARS = 60; // Number of bars in the waveform

// A single animated bar component
const WaveformBar = ({ animation, primaryColor = '#3B82F6' }) => {
  const barStyle = {
    height: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['4%', '100%'], // Animate height from 4% to 100%
    }),
    opacity: animation.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0.4, 1, 0.4],
    })
  };

  return <Animated.View style={[styles.waveformBar, { backgroundColor: primaryColor }, barStyle]} />;
};


export default function HandsfreeScreen() {
  const { colors } = useThemePreference();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('Tap the microphone to start recording');
  const animations = useRef(Array.from({ length: NUM_BARS }, () => new Animated.Value(0))).current;
  const animationRef = useRef(null);
  

  // This function creates a looping animation sequence for the waveform
  const createAnimation = () => {
    // Animate the bars up
    const animateUp = () => {
        const animationsUp = animations.map(anim => Animated.timing(anim, {
            toValue: Math.random(),
            duration: Math.random() * 300 + 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        }));
        return Animated.parallel(animationsUp);
    };

    // Animate the bars down
    const animateDown = () => {
        const animationsDown = animations.map(anim => Animated.timing(anim, {
            toValue: 0.1,
            duration: Math.random() * 300 + 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        }));
        return Animated.parallel(animationsDown);
    };
    
    // Loop the up and down animations
    animationRef.current = Animated.loop(
        Animated.sequence([
            animateUp(),
            animateDown()
        ])
    );
    animationRef.current.start();
  };
  
  // Resets the bars to a minimal, static state
  const stopAndResetAnimation = () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      const parallelAnimations = animations.map(anim => 
        Animated.timing(anim, {
            toValue: 0.05,
            duration: 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
        })
      );
      Animated.parallel(parallelAnimations).start();
  };

  // Start or stop animations when recording state changes
  useEffect(() => {
    if (isRecording) {
      createAnimation();
    } else {
      stopAndResetAnimation();
    }
  }, [isRecording]);

  // Handle microphone button press
  const handleMicPress = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingText('Processing your request...');
      
      // Simulate processing
      setTimeout(() => {
        setRecordingText('Voice recording stopped. Tap to record again.');
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingText('Listening... Tap again to stop');
      
      // Check for microphone permissions (placeholder)
      Alert.alert(
        'Microphone Access',
        'This feature requires microphone permissions. Please enable them in your device settings.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Hands-Free Mode</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>Voice-powered study assistant</Text>
      </View>

      {/* Status Text */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: colors.text, opacity: 0.8 }]}>{recordingText}</Text>
      </View>

      {/* Animated Waveform */}
      <View style={styles.waveformContainer}>
        {animations.map((animation, index) => (
          <WaveformBar key={index} animation={animation} primaryColor={colors.primary} />
        ))}
      </View>

      {/* Microphone Button */}
      <View style={styles.micButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.micButton, 
            { 
              backgroundColor: isRecording ? colors.notification : colors.primary,
              borderColor: colors.border 
            }
          ]} 
          onPress={handleMicPress}
          activeOpacity={0.8}
        >
          <FontAwesome 
            name={isRecording ? 'stop-circle' : 'microphone'} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <Text style={[styles.micButtonText, { color: colors.text, opacity: 0.6 }]}>
          {isRecording ? 'Tap to stop' : 'Tap to start'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  waveformBar: {
    width: (width - 80) / NUM_BARS, // Calculate bar width dynamically
    marginHorizontal: 1,
    borderRadius: 3,
    minHeight: 4,
  },
  micButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  micButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

