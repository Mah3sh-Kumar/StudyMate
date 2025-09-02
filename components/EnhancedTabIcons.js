import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// Enhanced tab icons with professional styling (no external dependencies)
export const EnhancedTabIcons = {
  Home: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#6366F1' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>🏠</Text>
      </View>
    </View>
  ),
  
  Planner: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#10B981' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>📅</Text>
      </View>
    </View>
  ),
  
  Chat: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#3B82F6' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>💬</Text>
      </View>
    </View>
  ),
  
  Quiz: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#F59E0B' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>🧠</Text>
      </View>
    </View>
  ),
  
  Groups: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#EC4899' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>👥</Text>
      </View>
    </View>
  ),
  
  Tracker: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#06B6D4' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>📊</Text>
      </View>
    </View>
  ),
  
  Handsfree: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#8B5CF6' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>🎧</Text>
      </View>
    </View>
  ),
  
  Flashcards: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#EF4444' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>🃏</Text>
      </View>
    </View>
  ),
  
  Summarizer: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#10B981' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>📝</Text>
      </View>
    </View>
  ),
  
  Settings: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <View style={[styles.iconBackground, focused && styles.focusedBackground, { backgroundColor: focused ? '#6B7280' : 'transparent' }]}>
        <Text style={[styles.icon, { color: focused ? '#FFFFFF' : color, fontSize: size }]}>⚙️</Text>
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
    borderRadius: 8,
  },
  focusedIcon: {
    transform: [{ scale: 1.1 }],
  },
  iconBackground: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  focusedBackground: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  icon: {
    textAlign: 'center',
  },
});

export default EnhancedTabIcons;
