import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';

// Mock data for a generated plan
const mockPlan = [
  { id: '1', time: '9:00 AM - 10:30 AM', subject: 'Biology', task: 'Review Chapter 3: Cell Division', completed: true },
  { id: '2', time: '11:00 AM - 12:00 PM', subject: 'Calculus', task: 'Practice problems on derivatives', completed: false },
  { id: '3', time: '2:00 PM - 3:30 PM', subject: 'History', task: 'Read about the Renaissance period', completed: false },
];

export default function PlanScreen() {
  const [subjects, setSubjects] = useState('');
  const [goals, setGoals] = useState('');
  const [plan, setPlan] = useState(null);

  const handleGeneratePlan = () => {
    // In a real app, you would call your OpenAI API here with subjects and goals.
    // For now, we'll use mock data after a short delay.
    setTimeout(() => {
      setPlan(mockPlan);
    }, 1000);
  };

  const renderPlanItem = ({ item }) => (
    <View style={[styles.planItem, item.completed && styles.planItemCompleted]}>
      <View style={styles.planTimeContainer}>
        <Text style={styles.planTime}>{item.time}</Text>
      </View>
      <View style={styles.planDetails}>
        <Text style={styles.planSubject}>{item.subject}</Text>
        <Text style={styles.planTask}>{item.task}</Text>
      </View>
      <TouchableOpacity>
        <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Study Planner</Text>
        <Text style={styles.headerSubtitle}>Let's create a personalized schedule for you.</Text>
      </View>

      {!plan ? (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>📚</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your subjects (e.g., Math, History)"
              placeholderTextColor="#9CA3AF"
              value={subjects}
              onChangeText={setSubjects}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>🎯</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What are your goals? (e.g., Ace my midterms)"
              placeholderTextColor="#9CA3AF"
              value={goals}
              onChangeText={setGoals}
            />
          </View>
          <TouchableOpacity style={styles.generateButton} onPress={handleGeneratePlan}>
            <Text style={styles.buttonIcon}>📅</Text>
            <Text style={styles.buttonText}>Generate My Plan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
            <Text style={styles.planTitle}>Your Plan for Today</Text>
            <FlatList
                data={plan}
                renderItem={renderPlanItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
            <TouchableOpacity style={styles.regenerateButton} onPress={() => setPlan(null)}>
                <Text style={styles.regenerateButtonText}>Create a New Plan</Text>
            </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 24, paddingTop: 50, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  formContainer: { paddingHorizontal: 24 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 8, fontSize: 20 },
  textInput: { flex: 1, height: 50, fontSize: 16 },
  generateButton: { backgroundColor: '#A78BFA', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonIcon: { fontSize: 20, marginRight: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  planTitle: { fontSize: 20, fontWeight: '600', color: '#374151', marginHorizontal: 24, marginBottom: 16 },
  planItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 24, marginBottom: 12 },
  planItemCompleted: { backgroundColor: '#F0FDF4' },
  planTimeContainer: { paddingRight: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  planTime: { color: '#6366F1', fontWeight: '600', fontSize: 14 },
  planDetails: { flex: 1, marginLeft: 12 },
  planSubject: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  planTask: { fontSize: 14, color: '#6B7280' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB' },
  checkboxCompleted: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
  regenerateButton: { alignItems: 'center', marginTop: 24 },
  regenerateButtonText: { color: '#6366F1', fontWeight: '600' },
});
