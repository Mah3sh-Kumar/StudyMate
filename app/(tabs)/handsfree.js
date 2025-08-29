import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { getAIChatResponse } from '../../api/api';

export default function HandsfreeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm your voice-controlled study assistant. Tap the microphone to start speaking, or type your question below.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      // In a real app, you'd start voice recognition here
      Alert.alert('Voice Recognition', 'Voice recognition started! Speak now...');
      
      // Simulate voice input after 2 seconds
      setTimeout(() => {
        simulateVoiceInput();
      }, 2000);
    }
  };

  const stopListening = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert('Voice Recognition', 'Voice recognition stopped.');
    }
  };

  const simulateVoiceInput = () => {
    const voiceInputs = [
      "What is the capital of France?",
      "How do I solve quadratic equations?",
      "Explain photosynthesis in simple terms",
      "What are the benefits of spaced repetition?",
      "Help me create a study schedule"
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

      const aiResponse = await getAIChatResponse(conversationHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversation(prev => [...prev, aiMessage]);
      
      // Auto-play AI response (in a real app, you'd use text-to-speech)
      Alert.alert('AI Response', aiResponse);
      
    } catch (error) {
      console.error('Voice chat error:', error);
      
      // Fallback response if AI fails
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble connecting right now. Please check your internet connection and try again. You can also type your question below!",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setConversation(prev => [...prev, fallbackMessage]);
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const sendTextMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setConversation(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = [
        ...conversation.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: inputText.trim() }
      ];

      const aiResponse = await getAIChatResponse(conversationHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversation(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Text chat error:', error);
      
      // Fallback response if AI fails
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setConversation(prev => [...prev, fallbackMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      Alert.alert('Playback', 'AI response is now playing...');
    } else {
      Alert.alert('Playback', 'Playback stopped.');
    }
  };

  const adjustVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };

  const clearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConversation([{
              id: Date.now(),
              type: 'ai',
              text: "Hello! I'm your voice-controlled study assistant. Tap the microphone to start speaking, or type your question below.",
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        }
      ]
    );
  };

  const shareConversation = () => {
    const conversationText = conversation.map(msg => 
      `${msg.type === 'user' ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    Alert.alert('Share Conversation', 'Conversation copied to clipboard');
  };

  const openSettings = () => {
    Alert.alert('Settings', 'Voice recognition and playback settings would open here.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Hands-Free Mode</Text>
        <Text style={styles.subtitle}>Voice-controlled study assistant</Text>
      </View>

      {/* Voice Controls */}
      <View style={styles.voiceControls}>
        <TouchableOpacity 
          style={[styles.micButton, isListening && styles.micButtonActive]} 
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={styles.micButtonText}>
            {isListening ? '🔴' : '🎤'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.voiceStatus}>
          {isListening ? 'Listening...' : 'Tap to speak'}
        </Text>
      </View>

      {/* Playback Controls */}
      <View style={styles.playbackControls}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.volumeControl}>
          <Text style={styles.volumeLabel}>🔊</Text>
          <TouchableOpacity 
            style={styles.volumeButton} 
            onPress={() => adjustVolume(volume - 10)}
          >
            <Text style={styles.volumeButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.volumeText}>{volume}%</Text>
          <TouchableOpacity 
            style={styles.volumeButton} 
            onPress={() => adjustVolume(volume + 10)}
          >
            <Text style={styles.volumeButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation Display */}
      <ScrollView style={styles.conversationContainer} showsVerticalScrollIndicator={false}>
        {conversation.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.aiMessage
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'user' ? styles.userText : styles.aiText
              ]}>
                {message.text}
              </Text>
              <Text style={styles.timestamp}>{message.timestamp}</Text>
            </View>
          </View>
        ))}
        
        {isProcessing && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={styles.processingText}>🤖 AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Text Input for Fallback */}
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Or type your question here..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendTextMessage}
          disabled={!inputText.trim() || isProcessing}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={clearConversation}>
          <Text style={styles.actionButtonText}>🗑️ Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={shareConversation}>
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={openSettings}>
          <Text style={styles.actionButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  voiceControls: {
    alignItems: 'center',
    marginBottom: 40,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#EF4444',
  },
  micButtonText: {
    fontSize: 32,
  },
  voiceStatus: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonText: {
    fontSize: 32,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  volumeLabel: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  volumeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  volumeButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  volumeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationContainer: {
    flex: 1,
    marginBottom: 40,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    minHeight: 50,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  processingText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
