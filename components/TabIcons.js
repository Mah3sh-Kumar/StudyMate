import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// Custom tab icons with consistent styling
export const TabIcons = {
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

// Alternative modern icon set using symbols
export const ModernTabIcons = {
  Home: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>⌂</Text>
    </View>
  ),
  
  Planner: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📆</Text>
    </View>
  ),
  
  Chat: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>💭</Text>
    </View>
  ),
  
  Quiz: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>❓</Text>
    </View>
  ),
  
  Groups: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>👨‍👩‍👧‍👦</Text>
    </View>
  ),
  
  Tracker: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📈</Text>
    </View>
  ),
  
  Handsfree: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🎵</Text>
    </View>
  ),
  
  Flashcards: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🎴</Text>
    </View>
  ),
  
  Summarizer: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>📋</Text>
    </View>
  ),
  
  Settings: ({ color, size = 24, focused }) => (
    <View style={[styles.iconContainer, focused && styles.focusedIcon]}>
      <Text style={[styles.icon, { color, fontSize: size }]}>🔧</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  focusedIcon: {
    transform: [{ scale: 1.1 }],
  },
  icon: {
    textAlign: 'center',
  },
});

export default TabIcons;
