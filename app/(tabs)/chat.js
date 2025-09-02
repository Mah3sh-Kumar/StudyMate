import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { getAIChatResponse } from '../../api/api';

export default function ChatScreen() {
  const navTheme = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI study assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIAvailable, setIsAIAvailable] = useState(true);
  const scrollViewRef = useRef();

  // Fallback responses when AI is unavailable
  const getFallbackResponse = (userMessage) => {
    const fallbackResponses = {
      study: [
        "Here are some effective study techniques:\n• Use the Pomodoro Technique (25 min work + 5 min break)\n• Create mind maps for complex topics\n• Practice active recall with flashcards\n• Study in different environments\n• Get adequate sleep before exams",
        "Try these memory techniques:\n• Chunking: Break information into smaller groups\n• Mnemonics: Create memorable phrases\n• Spaced repetition: Review at increasing intervals\n• Visual association: Link concepts to images",
        "For better focus:\n• Eliminate distractions (put phone away)\n• Use ambient noise or white noise\n• Take regular breaks every 45-60 minutes\n• Stay hydrated and eat brain-boosting foods"
      ],
      math: [
        "Math problem-solving steps:\n1. Read the problem carefully\n2. Identify what you're solving for\n3. List given information\n4. Choose appropriate formulas\n5. Solve step by step\n6. Check your answer",
        "Common math mistakes to avoid:\n• Forgetting to carry/borrow in arithmetic\n• Misapplying order of operations\n• Not checking if answers make sense\n• Rushing through calculations"
      ],
      general: [
        "I'm currently experiencing technical difficulties, but here are some study tips:\n• Set specific, achievable goals\n• Use the Feynman Technique (explain concepts simply)\n• Join study groups for collaboration\n• Practice past exam questions\n• Maintain a consistent study schedule",
        "While I'm unavailable, try these resources:\n• Khan Academy for video explanations\n• Quizlet for flashcards\n• Wolfram Alpha for math problems\n• Your textbook's practice questions\n• Office hours with your professors"
      ]
    };

    const message = userMessage.toLowerCase();
    let category = 'general';
    
    if (message.includes('math') || message.includes('calculate') || message.includes('equation')) {
      category = 'math';
    } else if (message.includes('study') || message.includes('learn') || message.includes('memorize')) {
      category = 'study';
    }

    const responses = fallbackResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      if (isAIAvailable) {
        // Prepare conversation history for AI
        const conversationHistory = [
          ...messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: inputText.trim() }
        ];

        const aiResponse = await getAIChatResponse(conversationHistory);
        
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Use fallback responses
        const fallbackResponse = getFallbackResponse(inputText.trim());
        
        const fallbackMessage = {
          id: Date.now() + 1,
          text: fallbackResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Check if it's a quota/rate limit error
      if (error.message.includes('quota exceeded') || error.message.includes('rate limit')) {
        setIsAIAvailable(false);
        
        const quotaMessage = {
          id: Date.now() + 1,
          text: "⚠️ AI service is currently unavailable due to quota limits. I'll provide helpful study tips instead! Try asking me about study techniques, math problems, or learning strategies.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, quotaMessage]);
      } else {
        // General fallback response
        const fallbackMessage = {
          id: Date.now() + 1,
          text: "I'm having trouble connecting right now. Please check your internet connection and try again. You can also try asking me about study techniques, math problems, or general knowledge questions!",
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([{
              id: Date.now(),
              text: "Hello! I'm your AI study assistant. How can I help you today?",
              isUser: false,
              timestamp: new Date().toLocaleTimeString()
            }]);
            // Reset AI availability when clearing chat
            setIsAIAvailable(true);
          }
        }
      ]
    );
  };

  const copyMessage = async (messageText) => {
    try {
      await Clipboard.setStringAsync(messageText);
      Alert.alert('Copied!', 'Message copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  const shareChat = async () => {
    const chatText = messages.map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.text}`).join('\n\n');
    try {
      await Clipboard.setStringAsync(chatText);
      Alert.alert('Share Chat', 'Chat history copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy');
    }
  };

  const suggestQuestions = () => {
    const suggestions = [
      "How can I improve my study habits?",
      "What's the best way to memorize information?",
      "Can you explain photosynthesis?",
      "Help me solve: 2x + 5 = 13",
      "What are effective note-taking strategies?"
    ];

    Alert.alert(
      'Suggested Questions',
      'Try asking me one of these:',
      [
        ...suggestions.map(q => ({ text: q, onPress: () => setInputText(q) })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const resetAIService = () => {
    Alert.alert(
      'Reset AI Service',
      'This will attempt to reconnect to the AI service. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setIsAIAvailable(true);
            const resetMessage = {
              id: Date.now(),
              text: "🔄 AI service has been reset. I'll try to use the AI assistant again for your next message.",
              isUser: false,
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, resetMessage]);
          }
        }
      ]
    );
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: navTheme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>💬 AI Chat Assistant</Text>
        {!isAIAvailable && (
          <View style={[styles.statusBanner, { backgroundColor: navTheme.colors.border }]}>
            <Text style={[styles.statusText, { color: navTheme.colors.text }]}>
              ⚠️ AI Service Unavailable - Using Fallback Mode
            </Text>
            <Text style={[styles.statusSubtext, { color: navTheme.colors.text }]}>
              I'll provide helpful study tips and guidance
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.isUser
                ? styles.userBubble
                : [styles.aiBubble, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : [styles.aiText, { color: navTheme.colors.text }]
              ]}>
                {message.text}
              </Text>
              <Text style={[styles.timestamp, { color: navTheme.colors.text }]}>{message.timestamp}</Text>
            </View>
            
            {!message.isUser && (
              <TouchableOpacity 
                style={[styles.copyButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                onPress={() => copyMessage(message.text)}
              >
                <Text style={[styles.copyButtonText, { color: navTheme.colors.text }]}>📋</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}>
              <Text style={[styles.typingText, { color: navTheme.colors.text }]}>🤖 AI is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: navTheme.colors.card, borderTopColor: navTheme.colors.border }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
          placeholder="Ask me anything..."
          placeholderTextColor={navTheme.colors.text}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.actionButtons, { backgroundColor: navTheme.colors.card, borderTopColor: navTheme.colors.border }]}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: navTheme.colors.card }]} onPress={suggestQuestions}>
          <Text style={[styles.actionButtonText, { color: navTheme.colors.text }]}>💡 Suggestions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: navTheme.colors.card }]} onPress={shareChat}>
          <Text style={[styles.actionButtonText, { color: navTheme.colors.text }]}>📤 Share Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: navTheme.colors.card }]} onPress={clearChat}>
          <Text style={[styles.actionButtonText, { color: navTheme.colors.text }]}>🗑️ Clear Chat</Text>
        </TouchableOpacity>
        
        {!isAIAvailable && (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: navTheme.colors.card }]} onPress={resetAIService}>
            <Text style={[styles.actionButtonText, { color: navTheme.colors.text }]}>🔄 Reset AI</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 8,
  },
  aiBubble: {
    borderBottomLeftRadius: 8,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    // Will be overridden with theme color
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  copyButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 15,
    padding: 8,
    margin: 10,
  },
  copyButtonText: {
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 20,
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  typingText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
