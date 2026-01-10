import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navTheme = useTheme();
  const navigation = useNavigation();

  const navigateToScreen = (screenName) => {
    // Navigate to tab screens
    if (['chat', 'handsfree', 'groups'].includes(screenName)) {
      navigation.navigate(screenName);
    } else {
      // Navigate to non-tab screens
      navigation.navigate(screenName);
    }
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
      onPress: () => navigateToScreen('quiz')
    },
    {
      id: 3,
      title: '📝 Summarizer',
      description: 'Summarize notes instantly',
      color: '#10B981',
      onPress: () => navigateToScreen('summarizer')
    },
    {
      id: 4,
      title: '👥 Groups',
      description: 'Study with classmates',
      color: '#EC4899',
      onPress: () => navigateToScreen('groups')
    },
    {
      id: 5,
      title: '📊 Tracker',
      description: 'Monitor your progress',
      color: '#06B6D4',
      onPress: () => navigateToScreen('tracker')
    },
    {
      id: 6,
      title: '📋 Study Plan',
      description: 'Plan your study schedule',
      color: '#8B5CF6',
      onPress: () => navigateToScreen('plan')
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: navTheme.colors.text }]}>Welcome back! 👋</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>Your AI-powered study companion</Text>
      </View>

      {/* Featured Tools */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>Featured Tools</Text>
        <View style={styles.featuredContainer}>
          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: navTheme.colors.card, borderColor: '#8B5CF6' }]}
            onPress={() => navigateToScreen('handsfree')}
          >
            <View style={[styles.featuredIcon, { backgroundColor: '#8B5CF6' }]}>  
              <Text style={styles.featuredIconText}>🎧</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={[styles.featuredTitle, { color: navTheme.colors.text }]}>Hands-Free Mode</Text>
              <Text style={[styles.featuredDescription, { color: navTheme.colors.text }]}>Voice-controlled study assistant for learning on the go</Text>
            </View>
            <Text style={styles.featuredArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: navTheme.colors.card, borderColor: '#EF4444' }]}
            onPress={() => navigateToScreen('flashcards')}
          >
            <View style={[styles.featuredIcon, { backgroundColor: '#EF4444' }]}>  
              <Text style={styles.featuredIconText}>🃏</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={[styles.featuredTitle, { color: navTheme.colors.text }]}>Smart Flashcards</Text>
              <Text style={[styles.featuredDescription, { color: navTheme.colors.text }]}>Create and study with AI-powered flashcard decks</Text>
            </View>
            <Text style={styles.featuredArrow}>→</Text>
          </TouchableOpacity>
        </View>
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


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    marginTop: 4,
    opacity: 0.8,
  },
  section: {
    marginTop: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    marginLeft: 20,
    letterSpacing: 0.5,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  featureCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 170,
    width: '47%',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    opacity: 0.75,
  },

  featuredContainer: {
    marginHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 12,
  },
  featuredIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredIconText: {
    fontSize: 26,
    color: '#FFFFFF',
  },
  featuredContent: {
    flex: 1,
    marginLeft: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  featuredDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
  },
  featuredArrow: {
    fontSize: 24,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

