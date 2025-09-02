import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navTheme = useTheme();
  const navigation = useNavigation();

  const navigateToTab = (tabName) => {
    navigation.navigate(tabName);
  };

  const features = [
    {
      id: 1,
      title: '💬 AI Chat',
      description: 'Get instant help with study questions',
      color: '#3B82F6',
      onPress: () => navigateToTab('chat')
    },
    {
      id: 2,
      title: '🧠 Quiz',
      description: 'Create custom quizzes',
      color: '#F59E0B',
      onPress: () => navigateToTab('quiz')
    },
    {
      id: 3,
      title: '🃏 Flashcards',
      description: 'Study with interactive cards',
      color: '#EF4444',
      onPress: () => navigateToTab('flashcards')
    },
    {
      id: 4,
      title: '📝 Summarizer',
      description: 'Summarize notes instantly',
      color: '#10B981',
      onPress: () => navigateToTab('summarizer')
    },
    {
      id: 5,
      title: '👥 Groups',
      description: 'Study with classmates',
      color: '#EC4899',
      onPress: () => navigateToTab('groups')
    },
    {
      id: 6,
      title: '📊 Tracker',
      description: 'Monitor your progress',
      color: '#06B6D4',
      onPress: () => navigateToTab('tracker')
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: navTheme.colors.text }]}>Welcome back! 👋</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>Your AI-powered study companion</Text>
      </View>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>Study Tools</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}
              onPress={feature.onPress}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Text style={styles.featureIconText}>{feature.title.split(' ')[0]}</Text>
              </View>
              <Text style={[styles.featureTitle, { color: navTheme.colors.text }]}>
                {feature.title.split(' ').slice(1).join(' ')}
              </Text>
              <Text style={[styles.featureDescription, { color: navTheme.colors.text }]}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Start */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>Quick Start</Text>
        <View style={[styles.quickStartContainer, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={[styles.quickStartText, { color: navTheme.colors.text }]}>
            Ready to study? Choose a tool above to get started!
          </Text>
          <TouchableOpacity 
            style={[styles.quickStartButton, { backgroundColor: navTheme.colors.primary || '#6366f1' }]}
            onPress={() => navigateToTab('flashcards')}
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
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
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
  },
  quickStartContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  quickStartText: {
    fontSize: 16,
    marginBottom: 16,
  },
  quickStartButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

