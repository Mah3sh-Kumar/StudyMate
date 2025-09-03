import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { useThemePreference } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { userService, studySessionService, dbUtils } from '../lib/database';

// Mock data for a generated plan
const mockPlan = [
  { id: '1', time: '9:00 AM - 10:30 AM', subject: 'Biology', task: 'Review Chapter 3: Cell Division', completed: true },
  { id: '2', time: '11:00 AM - 12:00 PM', subject: 'Calculus', task: 'Practice problems on derivatives', completed: false },
  { id: '3', time: '2:00 PM - 3:30 PM', subject: 'History', task: 'Read about the Renaissance period', completed: false },
];

export default function PlanScreen() {
  const { colors } = useThemePreference();
  const { user, updateStudyPreferences } = useAuth();
  const [subjects, setSubjects] = useState('');
  const [goals, setGoals] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);

  // Load user preferences and recent sessions on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Load user preferences and recent study sessions
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user study preferences
      const { data: preferences, error: prefError } = await userService.getStudyPreferences(user.id);
      if (!prefError && preferences) {
        setUserPreferences(preferences);
        setSubjects(preferences.study_subjects?.join(', ') || '');
        setGoals(preferences.study_goals?.join(', ') || '');
      }
      
      // Load recent study sessions for insights
      const { data: sessions, error: sessionsError } = await studySessionService.getUserSessions(user.id, 10);
      if (!sessionsError && sessions) {
        setRecentSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('❌ Error', dbUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

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
    if (!subjects.trim() || !goals.trim()) {
      Alert.alert('❌ Error', 'Please fill in both subjects and goals');
      return;
    }

    try {
      setLoading(true);
      
      // Parse subjects and goals into arrays
      const subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const goalsArray = goals.split(',').map(g => g.trim()).filter(g => g.length > 0);
      
      // Update in auth context
      const { error: authError } = await updateStudyPreferences(subjectsArray, goalsArray);
      if (authError) {
        Alert.alert('❌ Error', dbUtils.handleError(authError));
        return;
      }
      
      // Update in database
      const { error: dbError } = await userService.updateStudyPreferences(user.id, subjectsArray, goalsArray);
      if (dbError) {
        console.warn('Database update failed:', dbError);
      }
      
      Alert.alert('✅ Success', 'Study preferences saved successfully!');
      await loadUserData(); // Refresh data
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('❌ Error', dbUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const renderPlanItem = ({ item }) => (
    <View style={[styles.planItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.planTimeContainer}>
        <Text style={[styles.planTime, { color: colors.primary }]}>{item.time}</Text>
      </View>
      <View style={styles.planDetails}>
        <Text style={[styles.planSubject, { color: colors.text }]}>{item.subject}</Text>
        <Text style={[styles.planTask, { color: colors.text, opacity: 0.8 }]}>{item.task}</Text>
      </View>
      <View style={[styles.checkbox, { borderColor: colors.border }, item.completed && styles.checkboxCompleted]} />
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📅 AI Study Planner</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
          Create personalized study schedules
        </Text>
      </View>

      {!plan ? (
        <View style={styles.formContainer}>
          <View style={[styles.inputSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Subjects</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter your subjects (e.g., Math, History, Biology)"
              placeholderTextColor={colors.text + '80'}
              value={subjects}
              onChangeText={setSubjects}
            />
          </View>
          
          <View style={[styles.inputSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Goals</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="What are your study goals? (e.g., Ace my midterms)"
              placeholderTextColor={colors.text + '80'}
              value={goals}
              onChangeText={setGoals}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.generateButton, { backgroundColor: colors.primary }]} 
            onPress={handleGeneratePlan}
          >
            <Text style={styles.buttonText}>🚀 Generate Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={handleSavePreferences}
          >
            <Text style={[styles.saveButtonText, { color: colors.text }]}>💾 Save Preferences</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.planContainer}>
          <Text style={[styles.planTitle, { color: colors.text }]}>Your Study Plan for Today</Text>
          <FlatList
            data={plan}
            renderItem={renderPlanItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity 
            style={[styles.regenerateButton, { backgroundColor: colors.primary }]} 
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
    minWidth: 100,
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
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
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
