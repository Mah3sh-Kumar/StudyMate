import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

// Mock data for a generated plan
const mockPlan = [
  { id: '1', time: '9:00 AM - 10:30 AM', subject: 'Biology', task: 'Review Chapter 3: Cell Division', completed: true },
  { id: '2', time: '11:00 AM - 12:00 PM', subject: 'Calculus', task: 'Practice problems on derivatives', completed: false },
  { id: '3', time: '2:00 PM - 3:30 PM', subject: 'History', task: 'Read about the Renaissance period', completed: false },
];

export default function PlanScreen() {
  const navTheme = useTheme();
  const [subjects, setSubjects] = useState('');
  const [goals, setGoals] = useState('');
  const [plan, setPlan] = useState(null);
  const { updateStudyPreferences } = useAuth();

  const handleGeneratePlan = () => {
    if (!subjects.trim() || !goals.trim()) {
      Alert.alert('Error', 'Please fill in both subjects and goals');
      return;
    }
    
    // In a real app, you would call your OpenAI API here with subjects and goals.
    // For now, we'll use mock data after a short delay.
    setTimeout(() => {
      setPlan(mockPlan);
    }, 1000);
  };

  const handleSavePreferences = async () => {
    const { error } = await updateStudyPreferences(subjects.trim(), goals.trim());
    if (error) Alert.alert('Error', error); else Alert.alert('Saved', 'Study preferences saved');
  };

  const renderPlanItem = ({ item }) => (
    <View style={[styles.planItem, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
      <View style={styles.planTimeContainer}>
        <Text style={[styles.planTime, { color: navTheme.colors.primary || '#6366F1' }]}>{item.time}</Text>
      </View>
      <View style={styles.planDetails}>
        <Text style={[styles.planSubject, { color: navTheme.colors.text }]}>{item.subject}</Text>
        <Text style={[styles.planTask, { color: navTheme.colors.text }]}>{item.task}</Text>
      </View>
      <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: navTheme.colors.text }]}>📅 AI Study Planner</Text>
        <Text style={[styles.subtitle, { color: navTheme.colors.text }]}>
          Create personalized study schedules
        </Text>
      </View>

      {!plan ? (
        <View style={styles.formContainer}>
          <View style={[styles.inputSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>📚 Subjects</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Enter your subjects (e.g., Math, History, Biology)"
              placeholderTextColor={navTheme.colors.text}
              value={subjects}
              onChangeText={setSubjects}
            />
          </View>
          
          <View style={[styles.inputSection, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: navTheme.colors.text }]}>🎯 Goals</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="What are your study goals? (e.g., Ace my midterms)"
              placeholderTextColor={navTheme.colors.text}
              value={goals}
              onChangeText={setGoals}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.generateButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]} 
            onPress={handleGeneratePlan}
          >
            <Text style={styles.buttonText}>🚀 Generate Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]} 
            onPress={handleSavePreferences}
          >
            <Text style={[styles.saveButtonText, { color: navTheme.colors.text }]}>💾 Save Preferences</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.planContainer}>
          <Text style={[styles.planTitle, { color: navTheme.colors.text }]}>Your Study Plan for Today</Text>
          <FlatList
            data={plan}
            renderItem={renderPlanItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity 
            style={[styles.regenerateButton, { backgroundColor: navTheme.colors.primary || '#6366F1' }]} 
            onPress={() => setPlan(null)}
          >
            <Text style={styles.regenerateButtonText}>🔄 Create New Plan</Text>
          </TouchableOpacity>
        </View>
      )}
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
  formContainer: {
    marginBottom: 20,
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
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  generateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  planContainer: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTimeContainer: {
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  planTime: {
    fontWeight: '600',
    fontSize: 14,
  },
  planDetails: {
    flex: 1,
    marginLeft: 16,
  },
  planSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planTask: {
    fontSize: 14,
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  },
  regenerateButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regenerateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
