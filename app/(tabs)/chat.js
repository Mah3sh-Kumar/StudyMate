import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { getAIChatResponse } from '../../api/api';
import { useErrorModal } from '../../components/ErrorModal';

export default function ChatScreen() {
  const navTheme = useTheme();
  const { showError } = useErrorModal();
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI study assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIAvailable, setIsAIAvailable] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [textInputFocused, setTextInputFocused] = useState(false);

  const isInitialEmptyState = messages.length === 1;

  /* ---------------- SAFE STYLES ---------------- */

  const inputContainerStyle = [
    styles.inputContainer,
    {
      backgroundColor: navTheme.colors.card,
      borderTopColor: navTheme.colors.border,
    },
  ];

  /* ---------------- HEADER (EXTRACTED – SAFE) ---------------- */

  const renderListHeader = () => {
    if (!isInitialEmptyState) return null;

    return (
      <View style={styles.emptyStateContainer}>
        <View
          style={[
            styles.messageBubble,
            styles.aiBubble,
            {
              backgroundColor: navTheme.colors.card,
              borderColor: navTheme.colors.border,
              borderWidth: 1,
              maxWidth: '90%',
            },
          ]}
        >
          <Text style={[styles.messageText, { color: navTheme.colors.text }]}>
            Hello! I'm your AI study assistant. How can I help you today?
          </Text>
          <Text style={[styles.timestamp, { color: navTheme.colors.text }]}>
            Just now
          </Text>
        </View>
      </View>
    );
  };

  /* ---------------- MESSAGE RENDER ---------------- */

  const renderItemFunction = ({ item }) => {
    if (item.isTyping) {
      return (
        <View style={[styles.messageContainer, styles.aiMessage]}>
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <Text style={styles.typingText}>Thinking…</Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: item.isUser ? '#fff' : navTheme.colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        {!item.isUser && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => Clipboard.setStringAsync(item.text)}
          >
            <Text style={styles.copyButtonText}>📋</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIChatResponse([
        { role: 'system', content: 'You are a helpful study assistant.' },
        { role: 'user', content: userMessage.text },
      ]);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      showError({
        title: 'AI Error',
        message: 'Failed to get AI response',
        showRetryButton: false,
      });
    } finally {
      setIsTyping(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (
      scrollPosition >=
      contentHeight - Dimensions.get('window').height * 1.2
    ) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleScroll = useCallback(e => {
    setScrollPosition(e.nativeEvent.contentOffset.y);
    setContentHeight(e.nativeEvent.contentSize.height);
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={scrollViewRef}
          data={[
            ...messages,
            ...(isTyping
              ? [{ id: 'typing', isTyping: true }]
              : []),
          ]}
          renderItem={renderItemFunction}
          keyExtractor={item => item.id.toString()}
          onScroll={handleScroll}
          ListHeaderComponent={renderListHeader}
          keyboardShouldPersistTaps="handled"
        />

        <View style={inputContainerStyle}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything…"
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  messageContainer: { marginVertical: 6 },
  userMessage: { alignItems: 'flex-end' },
  aiMessage: { alignItems: 'flex-start' },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: { backgroundColor: '#6366F1' },
  aiBubble: { backgroundColor: '#F3F4F6' },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 11, opacity: 0.6, marginTop: 4 },
  typingText: { fontSize: 13, opacity: 0.6 },
  copyButton: { marginTop: 4 },
  copyButtonText: { fontSize: 18 },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  sendButton: {
    marginLeft: 10,
    padding: 12,
    backgroundColor: '#6366F1',
    borderRadius: 20,
  },
  sendButtonText: { color: '#fff', fontSize: 18 },
  emptyStateContainer: { alignItems: 'center', marginVertical: 20 },
});
