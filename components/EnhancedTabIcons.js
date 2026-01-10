import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// Enhanced tab icons with professional styling (no external dependencies)
export const EnhancedTabIcons = {
  Home: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#6366F1' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>{focused ? '🏠' : '🏘️'}</Text>
      </View>
    </View>
  ),
  
  Planner: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#10B981' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>📅</Text>
      </View>
    </View>
  ),
  
  Chat: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#3B82F6' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>💬</Text>
      </View>
    </View>
  ),
  
  Quiz: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#F59E0B' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>🧠</Text>
      </View>
    </View>
  ),
  
  Groups: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#EC4899' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>👥</Text>
      </View>
    </View>
  ),
  
  Tracker: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#06B6D4' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>📊</Text>
      </View>
    </View>
  ),
  
  Handsfree: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#8B5CF6' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>🎧</Text>
      </View>
    </View>
  ),
  
  Flashcards: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#EF4444' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>🃏</Text>
      </View>
    </View>
  ),
  
  Summarizer: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#10B981' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>📝</Text>
      </View>
    </View>
  ),
  
  Settings: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, focused && { backgroundColor: '#6B7280' }]}>
        <Text style={[styles.icon, { fontSize: 22 }]}>⚙️</Text>
      </View>
    </View>
  ),
};

// Simple version without enhanced styling (fallback)
export const SimpleTabIcons = {
  Home: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🏠</Text>
    </View>
  ),
  
  Planner: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📅</Text>
    </View>
  ),
  
  Chat: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>💬</Text>
    </View>
  ),
  
  Quiz: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🧠</Text>
    </View>
  ),
  
  Groups: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>👥</Text>
    </View>
  ),
  
  Tracker: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📊</Text>
    </View>
  ),
  
  Handsfree: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🎧</Text>
    </View>
  ),
  
  Flashcards: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🃏</Text>
    </View>
  ),
  
  Summarizer: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📝</Text>
    </View>
  ),
  
  Settings: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>⚙️</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 12,
  },
  focusedIcon: {
    transform: [{ scale: 1.05 }],
  },
  iconBackground: {
    padding: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  focusedBackground: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    textAlign: 'center',
  },
});

export default EnhancedTabIcons;
