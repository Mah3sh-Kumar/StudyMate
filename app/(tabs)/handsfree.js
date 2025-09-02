import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Animated } from 'react-native';
import { getAIChatResponse } from '../../api/api';
import { useTheme } from '@react-navigation/native';

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
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Pulse animation for listening state
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isListening]);

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      Alert.alert('🎤 Voice Recognition', 'Voice recognition started! Speak now...');
      
      // Simulate voice input after 3 seconds
      setTimeout(() => {
        simulateVoiceInput();
      }, 3000);
    }
  };

  const stopListening = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert('🛑 Voice Recognition', 'Voice recognition stopped.');
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
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString()
        };
        setConversation(prev => [...prev, aiMessage]);
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
    } finally {
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
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConversation([
              {
                id: Date.now(),
                type: 'ai',
                text: "Hello! I'm your voice-controlled study assistant. Tap the microphone to start speaking.",
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>🎤 Voice Assistant</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Speak to study smarter
        </Text>
      </View>

      {/* Microphone Button */}
      <View style={styles.microphoneContainer}>
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
            { transform: [{ scale: pulseAnimation }] }
          ]}>
            <Text style={styles.microphoneText}>
              {isListening ? '🛑' : '🎤'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={[styles.microphoneLabel, { color: navTheme.colors.text }]}>
          {isListening ? 'Listening...' : 'Tap to speak'}
        </Text>
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
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation */}
      <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
        {conversation.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.aiMessage,
              { backgroundColor: message.type === 'user' ? navTheme.colors.primary || '#6366F1' : navTheme.colors.card }
            ]}
          >
            <Text style={[
              styles.messageText,
              { color: message.type === 'user' ? '#FFFFFF' : navTheme.colors.text }
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.messageTimestamp,
              { color: message.type === 'user' ? '#E0E7FF' : navTheme.colors.text }
            ]}>
              {message.timestamp}
            </Text>
          </View>
        ))}
        
        {isProcessing && (
          <View style={[styles.messageContainer, styles.aiMessage, { backgroundColor: navTheme.colors.card }]}>
            <Text style={[styles.messageText, { color: navTheme.colors.text }]}>
              Thinking... 🤔
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Clear Button */}
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
        onPress={clearConversation}
      >
        <Text style={[styles.clearButtonText, { color: navTheme.colors.text }]}>🗑️ Clear Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  microphoneContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  microphoneButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  microphoneIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneText: {
    fontSize: 32,
  },
  microphoneLabel: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 50,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonText: {
    fontSize: 20,
  },
  conversationContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  messageTimestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  clearButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
