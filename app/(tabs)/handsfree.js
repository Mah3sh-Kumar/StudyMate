import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, StatusBar } from 'react-native-web';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

// Get the screen width for responsive design
const { width } = Dimensions.get('window');
const NUM_BARS = 60; // Number of bars in the waveform

// A single animated bar component
const WaveformBar = ({ animation }) => {
  const barStyle = {
    height: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['2%', '100%'], // Animate height from 2% to 100%
    }),
    opacity: animation.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0.5, 1, 0.5],
    })
  };

  return <Animated.View style={[styles.waveformBar, barStyle]} />;
};


export default function VoiceAssistantUI() {
  const [isRecording, setIsRecording] = useState(false);
  const animations = useRef(Array.from({ length: NUM_BARS }, () => new Animated.Value(0))).current;
  const animationRef = useRef(null);
  
  // This effect injects the FontAwesome font into the document head for web compatibility.
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    const fontFace = `
      @font-face {
        font-family: 'FontAwesome';
        src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.ttf?v=4.7.0') format('truetype');
      }
    `;
    style.appendChild(document.createTextNode(fontFace));
    document.head.appendChild(style);
  }, []);


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
    setIsRecording(!isRecording);
  };

  return (
    <LinearGradient
      colors={['#2A3A65', '#161C2E']}
      style={styles.container}
    >
        <StatusBar barStyle="light-content" />
        
        {/* Empty view to push the waveform down */}
        <View style={styles.placeholderView} />

        {/* --- Animated Waveform --- */}
        <View style={styles.waveformContainer}>
            {animations.map((animation, index) => (
                <WaveformBar key={index} animation={animation} />
            ))}
        </View>
        {/* --- End Waveform --- */}

        {/* Empty view to push the microphone up */}
        <View style={styles.placeholderView} />

        {/* Microphone Button */}
        <View style={styles.micButtonContainer}>
            <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
                <FontAwesome 
                    name={isRecording ? 'stop-circle' : 'microphone'} 
                    size={40} 
                    color="white" 
                />
            </TouchableOpacity>
        </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderView: {
      flex: 1,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxHeight: 100,
  },
  waveformBar: {
    width: (width - (NUM_BARS * 4)) / NUM_BARS, // Calculate bar width dynamically
    backgroundColor: '#98B1E4',
    marginHorizontal: 2,
    borderRadius: 5,
  },
  micButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 120,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});

