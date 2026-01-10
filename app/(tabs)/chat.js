import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar, Keyboard, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { getAIChatResponse } from '../../api/api';
import { useErrorModal } from '../../components/ErrorModal';

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [textInputFocused, setTextInputFocused] = useState(false);
  const scrollViewRef = useRef();
  const { showError } = useErrorModal();

  // Function to group messages by sender
  const groupMessages = () => {
    const grouped = [];
    let currentGroup = [];
    
    for (let i = 0; i < messages.length; i++) {
      const currentMsg = messages[i];
      const prevMsg = i > 0 ? messages[i - 1] : null;
      
      // Check if we should group with the previous message
      const shouldGroup = prevMsg && 
                          prevMsg.isUser === currentMsg.isUser && 
                          Math.abs(new Date(currentMsg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) < 300000; // 5 minutes
      
      if (shouldGroup) {
        currentGroup.push(currentMsg);
      } else {
        if (currentGroup.length > 0) {
          grouped.push({ type: 'group', messages: currentGroup });
        }
        currentGroup = [currentMsg];
      }
    }
    
    if (currentGroup.length > 0) {
      grouped.push({ type: 'group', messages: currentGroup });
    }
    
    return grouped;
  };

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

  const sendMessage = async (messageText) => {
    // Ensure we only work with strings
    const rawText =
      typeof messageText === 'string'
        ? messageText
        : typeof inputText === 'string'
          ? inputText
          : '';

    const trimmedText = rawText.trim();
    if (!trimmedText) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText(''); // Clear input immediately after sending
    setIsTyping(true);

    try {
      if (isAIAvailable) {
        // Prepare conversation history for AI
        const conversationHistory = [
          ...messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: trimmedText }
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
        const fallbackResponse = getFallbackResponse(trimmedText);
        
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
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'  // Add system message type
        };
        
        setMessages(prev => [...prev, quotaMessage]);
      } else {
        // General fallback response
        const fallbackMessage = {
          id: Date.now() + 1,
          text: "I'm having trouble connecting right now. Please check your internet connection and try again. You can also try asking me about study techniques, math problems, or general knowledge questions!",
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'  // Add system message type
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    // Replace Alert.alert with error modal
    showError({
      title: 'Clear Chat',
      message: 'Are you sure you want to clear all messages?',
      onRetry: () => {
        setMessages([{
          id: Date.now(),
          text: "Hello! I'm your AI study assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        }]);
        // Reset AI availability when clearing chat
        setIsAIAvailable(true);
      },
      showRetryButton: true
    });
  };

  const copyMessage = async (messageText) => {
    try {
      await Clipboard.setStringAsync(messageText);
      // Replace Alert.alert with error modal for success
      showError({
        title: 'Copied!',
        message: 'Message copied to clipboard',
        showRetryButton: false
      });
    } catch (error) {
      // Replace Alert.alert with error modal for error
      showError({
        title: 'Error',
        message: 'Failed to copy message to clipboard',
        showRetryButton: false
      });
    }
  };

  const shareChat = async () => {
    const chatText = messages.map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.text}`).join('\n\n');
    try {
      await Clipboard.setStringAsync(chatText);
      // Replace Alert.alert with error modal for success
      showError({
        title: 'Share Chat',
        message: 'Chat history copied to clipboard',
        showRetryButton: false
      });
    } catch (error) {
      // Replace Alert.alert with error modal for error
      showError({
        title: 'Error',
        message: 'Failed to copy chat history',
        showRetryButton: false
      });
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

    // Replace Alert.alert with error modal
    showError({
      title: 'Suggested Questions',
      message: 'Try asking me one of these:',
      showRetryButton: false
    });
  };

  const resetAIService = () => {
    // Replace Alert.alert with error modal
    showError({
      title: 'Reset AI Service',
      message: 'This will attempt to reconnect to the AI service. Continue?',
      onRetry: () => {
        setIsAIAvailable(true);
        const resetMessage = {
          id: Date.now(),
          text: "🔄 AI service has been reset. I'll try to use the AI assistant again for your next message.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
          messageType: 'system'  // Add system message type
        };
        setMessages(prev => [...prev, resetMessage]);
      },
      showRetryButton: true
    });
  };

  // Smart auto-scroll to bottom only if user is near the bottom
  useEffect(() => {
    const shouldAutoScroll = scrollPosition >= contentHeight - Dimensions.get('window').height * 1.2;
    if (shouldAutoScroll && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, scrollPosition, contentHeight]);

  // Listen for keyboard events to show/hide bottom action buttons
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Handle scroll position to enable smart auto-scroll
  const handleScroll = useCallback((event) => {
    const { contentOffset, contentSize } = event.nativeEvent;
    setScrollPosition(contentOffset.y);
    setContentHeight(contentSize.height);
  }, []);

  // Check if only the initial assistant message exists
  const isInitialEmptyState = messages.length === 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: navTheme.colors.card }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: navTheme.colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 120}
      >


      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Empty state UI when only the initial message exists */}
        {isInitialEmptyState && (
          <View style={styles.emptyStateContainer}>
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1, maxWidth: '90%' }]}>
              <Text style={[styles.messageText, styles.aiText, { color: navTheme.colors.text }]}>Hello! I'm your AI study assistant. How can I help you today?</Text>
              <Text style={[styles.timestamp, { color: navTheme.colors.text }]}>Just now</Text>
            </View>
            
            <View style={styles.suggestionContainer}>
              <Text style={[styles.suggestionTitle, { color: navTheme.colors.text }]}>Try asking me about:</Text>
              <View style={styles.suggestionList}>
                <TouchableOpacity 
                  style={[styles.suggestionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                  onPress={() => setInputText("How can I improve my study habits?")}>
                  <Text style={[styles.suggestionText, { color: navTheme.colors.text }]}>Study techniques</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.suggestionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                  onPress={() => setInputText("What's the best way to memorize information?")}>
                  <Text style={[styles.suggestionText, { color: navTheme.colors.text }]}>Memory tips</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.suggestionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                  onPress={() => setInputText("Can you explain photosynthesis?")}>
                  <Text style={[styles.suggestionText, { color: navTheme.colors.text }]}>Science topics</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Render messages only if not in initial empty state */}
        {!isInitialEmptyState && messages.map((message, index) => {
          // Check if we should group with the previous message
          const shouldGroup = index > 0 && 
                              messages[index - 1].isUser === message.isUser && 
                              Math.abs(new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) < 300000 && // 5 minutes
                              message.messageType !== 'system'; // Don't group system messages
          
          // Skip rendering if this message should be grouped with the previous
          if (shouldGroup) {
            return null;
          }
          
          // Find consecutive messages from the same sender
          const getConsecutiveMessages = (startIndex) => {
            const result = [messages[startIndex]];
            for (let i = startIndex + 1; i < messages.length; i++) {
              const current = messages[i];
              const previous = messages[i - 1];
              
              if (current.isUser !== previous.isUser || 
                  Math.abs(new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()) >= 300000 ||
                  current.messageType === 'system' || previous.messageType === 'system') { // Don't group system messages
                break;
              }
              result.push(current);
            }
            return result;
          };
          
          const consecutiveMessages = getConsecutiveMessages(index);
          const isLastInGroup = consecutiveMessages.length > 1;
          
          // Handle system messages separately
          if (message.messageType === 'system') {
            return (
              <View 
                key={message.id} 
                style={[
                  styles.messageContainer,
                  styles.systemMessage  // Add system message style
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  styles.systemBubble,  // Add system bubble style
                  { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }
                ]}>
                  <Text style={[
                    styles.messageText,
                    styles.systemText,  // Add system text style
                    { color: navTheme.colors.text }
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[styles.timestamp, { color: navTheme.colors.text }]}>{message.timestamp}</Text>
                </View>
              </View>
            );
          }
          
          // Check if this is the latest AI message to show quick actions
          const isLatestAIMessage = !message.isUser && 
                                  index === messages.findIndex(msg => !msg.isUser && 
                                    messages.slice(index + 1).every(laterMsg => laterMsg.isUser || laterMsg.messageType === 'system')) &&
                                  !messages.slice(index + 1).some(laterMsg => !laterMsg.isUser && laterMsg.messageType !== 'system');
          
          return (
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
                {consecutiveMessages.map((msg, msgIdx) => (
                  <Fragment key={msg.id}>
                    <Text style={[
                      styles.messageText,
                      message.isUser ? styles.userText : [styles.aiText, { color: navTheme.colors.text }]
                    ]}>
                      {msg.text}
                    </Text>
                    {msgIdx < consecutiveMessages.length - 1 && <Text style={styles.groupSeparator}>{'\n'}</Text>}
                  </Fragment>
                ))}
                <Text style={[styles.timestamp, { color: navTheme.colors.text }]}>{message.timestamp}</Text>
              </View>
              
              {!message.isUser && (
                <>
                  <TouchableOpacity 
                    style={[styles.copyButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                    onPress={() => copyMessage(message.text)}
                  >
                    <Text style={[styles.copyButtonText, { color: navTheme.colors.text }]}>📋</Text>
                  </TouchableOpacity>
                  
                  {/* Show quick action chips only for the latest AI message */}
                  {isLatestAIMessage && (
                    <View style={styles.quickActionContainer}>
                      <TouchableOpacity 
                        style={[styles.quickActionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                        onPress={() => sendMessage(`Explain this with an example: ${message.text}`)}
                      >
                        <Text style={[styles.quickActionText, { color: navTheme.colors.text }]}>💡 Example</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.quickActionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                        onPress={() => sendMessage(`Convert this to an exam answer worth 5 marks: ${message.text}`)}
                      >
                        <Text style={[styles.quickActionText, { color: navTheme.colors.text }]}>📝 Exam</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.quickActionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                        onPress={() => sendMessage(`Summarize this: ${message.text}`)}
                      >
                        <Text style={[styles.quickActionText, { color: navTheme.colors.text }]}>📋 Summarize</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.quickActionChip, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}
                        onPress={() => sendMessage(`Add headings and structure to this: ${message.text}`)}
                      >
                        <Text style={[styles.quickActionText, { color: navTheme.colors.text }]}>📑 Structure</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        }).filter(Boolean)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border, borderWidth: 1 }]}> 
              <Text style={[styles.typingText, { color: navTheme.colors.text }]}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: navTheme.colors.card, borderTopColor: navTheme.colors.border }]}>
        <TextInput
          style={[styles.textInput, 
            { 
              backgroundColor: navTheme.colors.background, 
              color: navTheme.colors.text, 
              borderColor: textInputFocused ? '#6366F1' : navTheme.colors.border 
            },
            textInputFocused && styles.textInputFocused
          ]}
          placeholder="Ask me anything..."
          placeholderTextColor={navTheme.colors.text}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage()}
          onFocus={() => setTextInputFocused(true)}
          onBlur={() => setTextInputFocused(false)}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      {!keyboardVisible && (
      <View style={[styles.actionButtons, { backgroundColor: navTheme.colors.card, borderTopColor: navTheme.colors.border, opacity: keyboardVisible ? 0 : 1 }]}>
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
      )}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 0,  // Remove any top padding
  },

  subtitle: {
    fontSize: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB', // Soft background color
    marginTop: 0,  // Remove any top margin
  },
  messagesContentContainer: {
    paddingTop: 8,  // Reduced padding to minimize space
    paddingBottom: 16,
    backgroundColor: '#F9FAFB', // Match the container background
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'column',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14, // Reduced padding
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 }, // Reduced shadow offset
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 1, // Reduced elevation
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.1, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 1, // Reduced elevation
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 }, // Reduced shadow offset
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 1, // Reduced elevation
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    // Will be overridden with theme color
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemBubble: {
    maxWidth: '90%',
    backgroundColor: '#FEF3C7', // Yellow background for system messages
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
  systemText: {
    fontSize: 14,
    color: '#92400E', // Darker yellow text
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  copyButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 18,
    padding: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  copyButtonText: {
    fontSize: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120, // Allow up to 3-4 lines
    borderWidth: 1,
    minHeight: 50,
  },
  textInputFocused: {
    borderWidth: 2, // Thicker border when focused
  },
  sendButton: {
    backgroundColor: '#6366F1',
    padding: 14,
    borderRadius: 24,
    marginLeft: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  typingText: {
    fontSize: 13, // Slightly smaller font
    fontStyle: 'normal', // Removed italic
    opacity: 0.6, // Slightly more subtle
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  actionButton: {
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 14, // Reduced padding
    borderRadius: 18, // Slightly smaller border radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.05, // Reduced shadow opacity
    shadowRadius: 2, // Reduced shadow radius
    elevation: 1, // Reduced elevation
  },
  actionButtonText: {
    fontSize: 12, // Reduced font size
    fontWeight: '500', // Lighter font weight
  },
  statusBanner: {
    marginTop: 6,         // Further reduced margin
    padding: 8,           // Further reduced padding
    borderRadius: 8,      // Slightly smaller radius
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,         // Further reduced font size
    fontWeight: '500',    // Lighter weight
    textAlign: 'center',
    marginBottom: 1,        // Further reduced margin
  },
  statusSubtext: {
    fontSize: 11,         // Reduced font size
    textAlign: 'center',
    opacity: 0.7,         // Slightly more transparent
  },
  quickActionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginLeft: 10,
  },
  quickActionChip: {
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 5, // Reduced padding
    borderRadius: 14, // Slightly smaller border radius
    marginRight: 6, // Reduced margin
    marginBottom: 4,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 11, // Slightly smaller font
    fontWeight: '400', // Lighter font weight
  },
  
  // New styles for empty state
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  suggestionContainer: {
    marginTop: 20,
    width: '100%',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  suggestionList: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '400',
  },
  groupSeparator: {
    height: 8,
  },
});
