import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to StudyMate!</Text>
        <Text style={styles.subtitle}>Your AI-powered study companion</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>🤖 AI-Powered Tools</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📄 AI Summarizer</Text>
          <Text style={styles.featureDescription}>
            Instantly condenses uploaded notes (PDFs, text) into key points
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📝 AI Quiz Generator</Text>
          <Text style={styles.featureDescription}>
            Creates multiple-choice quizzes from your study materials
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🃏 AI Flashcard Creator</Text>
          <Text style={styles.featureDescription}>
            Automatically generates flashcard decks from notes for memorization
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>🎯 Smart Features</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>📅 AI Study Planner</Text>
          <Text style={styles.featureDescription}>
            Develops personalized study schedules based on your subjects and goals
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>💬 AI Chat Assistant</Text>
          <Text style={styles.featureDescription}>
            Interactive chatbot to answer questions and explain complex topics
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🎤 Hands-Free Mode</Text>
          <Text style={styles.featureDescription}>
            Voice-controlled conversational mode for true hands-free learning
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>👥 Collaboration & Tracking</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>👥 Study Groups</Text>
          <Text style={styles.featureDescription}>
            Connect, chat, and share notes with classmates
          </Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>⏱️ Study Time Tracker</Text>
          <Text style={styles.featureDescription}>
            Monitor study sessions and visualize progress over time
          </Text>
        </View>
      </View>
      
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Start Studying</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Upload Notes</Text>
        </TouchableOpacity>
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    flex: 1,
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    gap: 16,
  },
  ctaButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A78BFA',
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#A78BFA',
    fontSize: 16,
    fontWeight: '600',
  },
});
