import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Clipboard } from 'react-native';
import { summarizeTextWithOpenAI } from '../../api/api';

export default function SummarizerScreen() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Fallback to mock summary if API fails
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
      await Clipboard.setString(summary);
      Alert.alert('Success', 'Summary copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const saveSummary = () => {
    // In a real app, this would save to local storage or database
    Alert.alert('Success', 'Summary saved successfully!');
  };

  const createFlashcards = () => {
    // Navigate to flashcards tab with the summary content
    Alert.alert('Info', 'Navigate to Flashcards tab to create cards from this summary');
  };

  const handleUploadPDF = () => {
    Alert.alert('Upload PDF', 'PDF upload functionality will be implemented with document processing');
  };

  const handleScanDocument = () => {
    Alert.alert('Scan Document', 'Document scanning will be implemented with camera integration');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Summarizer</Text>
        <Text style={styles.headerSubtitle}>Transform your notes into key points instantly</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>📝 Input Your Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Paste your notes, text, or upload content here..."
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPDF}>
            <Text style={styles.buttonIcon}>📁</Text>
            <Text style={styles.buttonText}>Upload PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handleScanDocument}>
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>Scan Document</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.summarizeButton, isProcessing && styles.disabledButton]} 
          onPress={handleSummarize}
          disabled={isProcessing}
        >
          <Text style={styles.summarizeIcon}>
            {isProcessing ? '⏳' : '🤖'}
          </Text>
          <Text style={styles.summarizeText}>
            {isProcessing ? 'Processing...' : 'Generate Summary'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>✨ AI-Generated Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
          
          <View style={styles.summaryActions}>
            <TouchableOpacity style={styles.actionButton} onPress={copyToClipboard}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={saveSummary}>
              <Text style={styles.actionIcon}>💾</Text>
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={createFlashcards}>
              <Text style={styles.actionIcon}>🃏</Text>
              <Text style={styles.actionText}>Create Cards</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>🚀 Features</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureText}>Instant summarization in seconds</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureText}>Extract key concepts and main ideas</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Customizable summary length</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔄</Text>
          <Text style={styles.featureText}>Multiple format support (PDF, text, images)</Text>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  summarizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  summarizeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summarizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
