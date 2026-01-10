import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { getAIChatResponse } from '../../api/api';
import { useTheme } from '@react-navigation/native';

// Import haptics if available
let Haptics;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log('expo-haptics not available');
}

export default function HandsfreeScreen() {
  const navTheme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm your voice-controlled study assistant. Tap the microphone to start speaking.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [cognitiveStatus, setCognitiveStatus] = useState("Analyzing your question");
  const [rotationAnimation] = useState(new Animated.Value(0));
  const [idlePulseAnimation] = useState(new Animated.Value(1));
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [waveAnimation] = useState([new Animated.Value(0.3), new Animated.Value(0.5), new Animated.Value(0.3)]);
  const [glowAnimation] = useState(new Animated.Value(0));
  
  const scrollViewRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const cognitiveIntervalRef = useRef(null);
  const rotationAnimationRef = useRef(null);
  const messageAnimations = useRef({});
  
  // Timer refs for organic audio waves
  const waveTimerRef = useRef(null);

  // Idle breathing animation
  useEffect(() => {
    let idleAnimation;
    if (!isListening && !isProcessing) {
      idleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(idlePulseAnimation, {
            toValue: 1.03,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(idlePulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      idlePulseAnimation.setValue(1);
    }
    
    return () => {
      if (idleAnimation) idleAnimation.stop();
    };
  }, [isListening, isProcessing]);

  // Ambient glow animation for idle AI presence
  useEffect(() => {
    let glowAnimationInstance;
    if (!isListening && !isProcessing) {
      glowAnimationInstance = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowAnimation, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.spring(glowAnimation, {
              toValue: 0,
              friction: 5,
              tension: 20,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      glowAnimation.setValue(0);
    }
    
    return () => {
      if (glowAnimationInstance) glowAnimationInstance.stop();
    };
  }, [isListening, isProcessing]);

  // Organic audio wave animation
  useEffect(() => {
    if (isListening) {
      // Set up interval to randomly vary wave heights
      waveTimerRef.current = setInterval(() => {
        // Randomly adjust wave values with small variations
        waveAnimation.forEach((anim, index) => {
          const randomFactor = 0.85 + Math.random() * 0.3; // Between 0.85 and 1.15
          Animated.timing(anim, {
            toValue: randomFactor,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }, 300 + Math.random() * 200); // Between 300-500ms
    } else {
      if (waveTimerRef.current) {
        clearInterval(waveTimerRef.current);
        waveTimerRef.current = null;
        // Reset wave animation values
        waveAnimation.forEach(anim => anim.setValue(0.3));
      }
    }
    
    return () => {
      if (waveTimerRef.current) {
        clearInterval(waveTimerRef.current);
      }
    };
  }, [isListening]);

  // Pulse animation for listening state
  useEffect(() => {
    if (isListening) {
      // Stop idle animation when listening
      idlePulseAnimation.setValue(1);
      
      // Microphone pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Audio wave animations
      waveAnimation.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400 + index * 100,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else {
      pulseAnimation.setValue(1);
      waveAnimation.forEach(anim => anim.setValue(0.3));
    }
  }, [isListening]);

  // Rotation animation for processing state
  useEffect(() => {
    if (isProcessing) {
      rotationAnimationRef.current = Animated.loop(
        Animated.timing(rotationAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
        rotationAnimation.setValue(0);
      }
    }
    
    return () => {
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }
    };
  }, [isProcessing]);

  // Cognitive status rotation during processing
  useEffect(() => {
    if (isProcessing) {
      const statuses = [
        "Analyzing your question",
        "Connecting relevant concepts",
        "Formulating a clear explanation"
      ];
      let currentIndex = 0;
      
      cognitiveIntervalRef.current = setInterval(() => {
        setCognitiveStatus(statuses[currentIndex]);
        currentIndex = (currentIndex + 1) % statuses.length;
      }, 1500);
    } else {
      if (cognitiveIntervalRef.current) {
        clearInterval(cognitiveIntervalRef.current);
        cognitiveIntervalRef.current = null;
      }
    }
    
    return () => {
      if (cognitiveIntervalRef.current) {
        clearInterval(cognitiveIntervalRef.current);
      }
    };
  }, [isProcessing]);

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      
      // Trigger haptic feedback if available
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Simulate voice input after 3 seconds
      setTimeout(() => {
        simulateVoiceInput();
      }, 3000);
    }
  };

  const stopListening = () => {
    if (isListening) {
      setIsListening(false);
      
      // Trigger haptic feedback if available
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const simulateVoiceInput = () => {
    const voiceInputs = [
      "What is the capital of France?",
      "How do I solve quadratic equations?",
      "Explain photosynthesis in simple terms",
      "What are the benefits of spaced repetition?"
    ];
    
    const randomInput = voiceInputs[Math.floor(Math.random() * voiceInputs.length)];
    handleVoiceInput(randomInput);
  };

  // Function to start typing animation
  const startTypingAnimation = (fullText) => {
    // Delay typing start for natural conversational rhythm
    setTimeout(() => {
      let index = 0;
      setTypingText('');
      
      typingIntervalRef.current = setInterval(() => {
        if (index < fullText.length) {
          setTypingText(prev => prev + fullText[index]);
          index++;
          
          // Scroll to bottom when typing progresses
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 10);
        } else {
          // Animation complete - add the full message to conversation
          clearInterval(typingIntervalRef.current);
          
          const aiMessage = {
            id: Date.now() + 1,
            type: 'ai',
            text: fullText,
            timestamp: new Date().toLocaleTimeString()
          };
          
          setConversation(prev => [...prev, aiMessage]);
          setShowTypingIndicator(false);
          setIsProcessing(false);
          setIsListening(false);
          
          // Trigger haptic feedback when typing starts
          if (Haptics) {
            Haptics.selectionAsync();
          }
        }
      }, 20); // Typing speed: 20ms per character
    }, 300); // Delay typing start by 300ms
  };

  const handleVoiceInput = async (voiceText) => {
    if (!voiceText.trim()) return;

    // Add user's voice input to conversation
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: voiceText,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = [
        ...conversation.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: voiceText }
      ];

      const aiResponse = await getAIChatResponse(voiceText, conversationHistory);
      
      if (aiResponse) {
        // Start typing animation
        setShowTypingIndicator(true);
        startTypingAnimation(aiResponse);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      };
      setConversation(prev => [...prev, errorMessage]);
      setShowTypingIndicator(false);
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const handleTextInput = async () => {
    if (!inputText.trim()) return;
    
    await handleVoiceInput(inputText.trim());
    setInputText('');
  };

  const clearConversation = () => {
    setConversation([
      {
        id: Date.now(),
        type: 'ai',
        text: "Hello! I'm your voice-controlled study assistant. Tap the microphone to start speaking.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Function to create animated message
  const AnimatedMessage = ({ message, index }) => {
    const messageAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;
    
    useEffect(() => {
      // Animate message on mount
      Animated.parallel([
        Animated.timing(messageAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Store the animation for potential cleanup
      messageAnimations.current[message.id] = { messageAnim, translateY };
      
      return () => {
        if (messageAnimations.current[message.id]) {
          delete messageAnimations.current[message.id];
        }
      };
    }, []);
    
    return (
      <Animated.View style={{
        opacity: messageAnim,
        transform: [{ translateY: message.type === 'user' ? translateY : translateY }]
      }}>
        <View
          style={[
            styles.messageContainer,
            message.type === 'user' ? styles.userMessage : styles.aiMessage,
            { 
              backgroundColor: message.type === 'user' ? navTheme.colors.card : navTheme.colors.card,
              borderLeftWidth: message.type === 'ai' ? 4 : 0,
              borderLeftColor: message.type === 'ai' ? (navTheme.dark ? '#6366F1' : '#4F46E5') : 'transparent'
            }
          ]}
        >
          <Text style={[
            styles.messageText,
            { color: message.type === 'user' ? navTheme.colors.text : navTheme.colors.text }
          ]}>
            {message.text}
          </Text>
        </View>
      </Animated.View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>Voice Assistant</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Speak to study smarter
        </Text>
      </View>

      {/* Microphone Button */}
      <View style={styles.microphoneContainer}>
        {/* Ambient glow ring when idle */}
        {!isListening && !isProcessing && (
          <Animated.View style={[
            styles.ambientGlow,
            {
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.15, 0.25]
              }),
              transform: [{
                scale: glowAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.05, 1.1]
                })
              }]
            }
          ]} />
        )}
        
        <TouchableOpacity
          style={[
            styles.microphoneButton,
            { backgroundColor: isListening ? '#EF4444' : navTheme.colors.primary || '#6366F1' }
          ]}
          onPress={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          <Animated.View style={[
            styles.microphoneIcon,
            { 
              transform: [{ scale: isListening ? pulseAnimation : idlePulseAnimation }],
              shadowRadius: isListening ? 20 : 16,
              shadowOpacity: isListening ? 0.4 : 0.35,
            }
          ]}>
            {isProcessing ? (
              <Animated.View style={{ transform: [{ rotate: rotationAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })}] }}>
                <Text style={styles.microphoneText}>●</Text>
              </Animated.View>
            ) : (
              <Text style={styles.microphoneText}>●</Text>
            )}
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={[styles.microphoneLabel, { color: navTheme.colors.text }]}> {isListening ? 'Listening... speak now' : isProcessing ? 'Thinking...' : 'Tap to speak'}</Text>
        
        {/* Cognitive status displayed below microphone when processing */}
        {isProcessing && (
          <Text style={[styles.cognitiveStatus, { color: navTheme.colors.text }]}> {cognitiveStatus}</Text>
        )}
        
        {isListening && (
          <View style={styles.audioWaves}>
            <Animated.View style={[
              styles.audioWave,
              { backgroundColor: navTheme.colors.primary || '#6366F1', opacity: waveAnimation[0] }
            ]} />
            <Animated.View style={[
              styles.audioWave,
              { backgroundColor: navTheme.colors.primary || '#6366F1', opacity: waveAnimation[1] }
            ]} />
            <Animated.View style={[
              styles.audioWave,
              { backgroundColor: navTheme.colors.primary || '#6366F1', opacity: waveAnimation[2] }
            ]} />
          </View>
        )}
      </View>

      {/* Text Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, { backgroundColor: navTheme.colors.card, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
          placeholder="Or type your question here..."
          placeholderTextColor={navTheme.colors.text}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
          onPress={handleTextInput}
          disabled={!inputText.trim() || isProcessing}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.conversationContainer} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {conversation.map((message, index) => (
          <AnimatedMessage key={message.id} message={message} index={index} />
        ))}
        
        {showTypingIndicator && (
          <Animated.View style={{
            opacity: 1,
            transform: [{ translateY: 0 }]
          }}>
            <View style={[styles.messageContainer, styles.aiMessage, { backgroundColor: navTheme.colors.card, borderLeftWidth: 4, borderLeftColor: navTheme.dark ? '#6366F1' : '#4F46E5' }]}> 
              <Text style={[styles.messageText, { color: navTheme.colors.text }]}>{typingText}<Text style={{opacity: 0.7}}>|</Text></Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Clear Button */}
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
        onPress={clearConversation}
      >
        <Text style={[styles.clearButtonText, { color: navTheme.colors.text }]}>Clear Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  microphoneContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  microphoneButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  microphoneIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneText: {
    fontSize: 50,
  },
  microphoneLabel: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonText: {
    fontSize: 20,
  },
  conversationContainer: {
    flex: 1,
    marginBottom: 16,
  },
  ambientGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#6366F1',
    opacity: 0.2,
    zIndex: -1,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  messageTimestamp: {
    fontSize: 11,
    opacity: 0.5,
    alignSelf: 'flex-end',
  },
  cognitiveStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  clearButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  audioWaves: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  audioWave: {
    width: 6,
    height: 28,
    borderRadius: 3,
  },
});
