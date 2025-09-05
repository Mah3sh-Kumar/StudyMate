import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { colors } = useThemePreference();
  const navigation = useNavigation();

  console.log('🏠 HomeScreen rendering with colors:', colors);

  // Fallback colors if theme is not ready
  const safeColors = colors || {
    background: '#ffffff',
    text: '#000000',
    card: '#ffffff',
    border: '#e5e5e5',
    primary: '#6366F1'
  };

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const features = [
    {
      id: 1,
      title: '💬 AI Chat',
      description: 'Get instant help with study questions',
      color: '#3B82F6',
      onPress: () => navigateToScreen('chat')
    },
    {
      id: 2,
      title: '🧠 Quiz',
      description: 'Create custom quizzes',
      color: '#F59E0B',
      onPress: () => navigation.navigate('quiz')
    },
    {
      id: 3,
      title: '🃏 Flashcards',
      description: 'Study with interactive cards',
      color: '#EF4444',
      onPress: () => navigation.navigate('flashcards')
    },
    {
      id: 4,
      title: '📝 Summarizer',
      description: 'Summarize notes instantly',
      color: '#10B981',
      onPress: () => navigation.navigate('summarizer')
    },
    {
      id: 5,
      title: '👥 Groups',
      description: 'Study with classmates',
      color: '#EC4899',
      onPress: () => navigateToScreen('groups')
    },
    {
      id: 6,
      title: '📊 Tracker',
      description: 'Monitor your progress',
      color: '#06B6D4',
      onPress: () => navigation.navigate('tracker')
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: safeColors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: safeColors.text }]}>Welcome back! 👋</Text>
        <Text style={[styles.subtitle, { color: safeColors.text, opacity: 0.8 }]}>Your AI-powered study companion</Text>
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: safeColors.text }]}>Study Tools</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}
              onPress={feature.onPress}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Text style={styles.featureIconText}>{feature.title.split(' ')[0]}</Text>
              </View>
              <Text style={[styles.featureTitle, { color: safeColors.text }]}>
                {feature.title.split(' ').slice(1).join(' ')}
              </Text>
              <Text style={[styles.featureDescription, { color: safeColors.text, opacity: 0.7 }]}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Start */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: safeColors.text }]}>Quick Start</Text>
        <View style={[styles.quickStartContainer, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}>
          <Text style={[styles.quickStartText, { color: safeColors.text, opacity: 0.8 }]}>
            Ready to study? Choose a tool above to get started!
          </Text>
          <TouchableOpacity 
            style={[styles.quickStartButton, { backgroundColor: safeColors.primary }]}
            onPress={() => navigation.navigate('flashcards')}
          >
            <Text style={styles.quickStartButtonText}>🚀 Start Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 40,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 20,
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 160,
    width: '45%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  quickStartContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStartText: {
    fontSize: 16,
    marginBottom: 16,
  },
  quickStartButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

