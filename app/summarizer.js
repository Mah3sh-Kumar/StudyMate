import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@react-navigation/native';
import { summarizeTextWithOpenAI } from '../api/api';

// Document upload functionality allows users to select and load text content from various file formats
// Supported formats: .txt (directly readable), .pdf/.doc/.docx (with manual text extraction)

export default function SummarizerScreen() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Document picking was cancelled');
        return;
      }

      const document = result.assets[0];
      console.log('Selected document:', document);

      const fileType = document.name.split('.').pop().toLowerCase();

      // For TXT files, read directly
      if (fileType === 'txt') {
        const content = await FileSystem.readAsStringAsync(document.uri, { encoding: FileSystem.EncodingType.UTF8 });
        setNotes(content);
        Alert.alert('Success', 'Document loaded successfully!');
        return;
      }

      // For PDF, DOC, DOCX, upload to backend for extraction
      // Note: pdf-lib doesn't support text extraction, so we use backend service for all document types
      if (['pdf', 'doc', 'docx'].includes(fileType)) {
        await extractPdfText(document);
      } else {
        Alert.alert('Unsupported Format', `File type .${fileType} is not supported.`);
      }

    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  // Extract text from documents using backend service
  // Note: pdf-lib doesn't support text extraction, so we use backend service for all document types
  const extractPdfText = async (fileAsset) => {
    setIsUploading(true);
    try {
      // Fall back to backend service since pdf-lib doesn't support text extraction
      await uploadFileToBackend(fileAsset);
    } catch (error) {
      console.error('Document processing error:', error);
      
      let errorMessage = 'Could not process this document.';
      
      if (error.message.includes('No text found')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Document processing failed: ${error.message}`;
      }
      
      Alert.alert('Processing Failed', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload file to backend for text extraction
  const uploadFileToBackend = async (fileAsset) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileAsset.uri,
        name: fileAsset.name,
        type: fileAsset.mimeType || 'application/octet-stream',
      });

      // Using a placeholder endpoint as per instruction
      // In production, this should be configured in api-config.js
      const API_ENDPOINT = 'https://api.studymate.com/v1/extract-document';

      console.log(`Uploading ${fileAsset.name} to ${API_ENDPOINT}...`);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.text) {
        setNotes(data.text);
        Alert.alert('Success', 'Document extracted successfully!');
      } else {
        throw new Error('No text returned from extraction service');
      }

    } catch (error) {
      console.error('File upload error:', error);

      let errorMessage = 'Could not extract text from this document.';

      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error: Could not reach the extraction server. Please check your internet connection or backend configuration.';
        // DEV: Uncomment the line below to simulate success for testing UI without a backend
        // setNotes("This is simulated extracted text from the PDF. The backend endpoint is currently a placeholder."); setIsUploading(false); return;
      } else if (error.message.includes('Upload failed')) {
        errorMessage = error.message;
      }

      Alert.alert('Extraction Failed', errorMessage);
    } finally {
      setIsUploading(false);
    }
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
            onPress={pickDocument}
            disabled={isUploading}
          >
            <Text style={[styles.uploadButtonText, { color: navTheme.colors.text }]}>
              {isUploading ? '⏳ Uploading...' : '📁 Upload Doc'}
            </Text>
          </TouchableOpacity>

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
          1. Paste or type your notes/text, or upload a document{'\n'}
          2. Click "Summarize" to get AI-powered summary{'\n'}
          3. Copy the summary for your studies{'\n'}
          Note: For PDF/DOC files, extract text first and paste it here
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
    marginTop: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  uploadButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    marginBottom: 22,
    minHeight: 130,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summarizeButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  summarizeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
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
