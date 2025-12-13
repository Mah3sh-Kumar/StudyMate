import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { summarizeTextWithOpenAI } from '../api/api';

export default function SummarizerScreen() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navTheme = useTheme();

  const handleSummarize = async () => {
    if (!notes.trim()) {
      Alert.alert('Error', 'Please enter some notes to summarize');
      return;
    }

    setIsProcessing(true);
    
    try {
      const aiSummary = await summarizeTextWithOpenAI(notes);
      setSummary(aiSummary);
    } catch (error) {
      console.error('Summarization error:', error);
      const mockSummary = generateMockSummary(notes);
      setSummary(mockSummary);
      Alert.alert('Info', 'Using offline summary (AI service unavailable)');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockSummary = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, Math.min(5, sentences.length));
    return keyPoints.map((point, index) => `• ${point.trim()}`).join('\n\n');
  };

  const clearAll = () => {
    setNotes('');
    setSummary('');
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(summary);
      Alert.alert('Success', 'Summary copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>📝 AI Summarizer</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Summarize your notes and text instantly
        </Text>
      </View>

      {/* Input Section */}
      <View style={[styles.inputSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>📝 Your Notes</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
          placeholder="Paste your notes, text, or any content here..."
          placeholderTextColor={navTheme.colors.text}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={[styles.summarizeButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
          onPress={handleSummarize}
          disabled={isProcessing || !notes.trim()}
        >
          <Text style={styles.summarizeButtonText}>
            {isProcessing ? '🔄 Summarizing...' : '🚀 Summarize'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      {summary && (
        <View style={[styles.summarySection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>📋 Summary</Text>
          <Text style={[styles.summaryText, { color: navTheme.colors.text }]}>
            {summary}
          </Text>
          
          <View style={styles.summaryActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]}
              onPress={copyToClipboard}
            >
              <Text style={styles.actionButtonText}>📋 Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
              onPress={clearAll}
            >
              <Text style={[styles.actionButtonText, { color: navTheme.colors.text }]}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: navTheme.colors.text }]}>💡 How it works</Text>
        <Text style={[styles.instructionsText, { color: navTheme.colors.text }]}>
          1. Paste or type your notes/text{'\n'}
          2. Click "Summarize" to get AI-powered summary{'\n'}
          3. Copy the summary for your studies
        </Text>
      </View>
    </ScrollView>
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
  inputSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  summarizeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summarizeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionsSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
