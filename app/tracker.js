import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@react-navigation/native';
import { studySessionService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

export default function TrackerScreen() {
  const navTheme = useTheme();
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionSubject, setSessionSubject] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Load user's study sessions on component mount
  useEffect(() => {
    if (user) {
      loadStudySessions();
    }
  }, [user]);

  // Load study sessions from database
  const loadStudySessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await studySessionService.getUserSessions(user.id, 100);
      
      if (error) {
        console.error('Error loading study sessions:', error);
        Alert.alert('❌ Error', 'Failed to load study sessions');
        return;
      }
      
      setSessions(data || []);
      
      // Calculate total study time
      const total = (data || []).reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    setTotalStudyTime(total);
    } catch (error) {
      console.error('Error loading study sessions:', error);
      Alert.alert('❌ Error', 'Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for active sessions
  useEffect(() => {
    let interval;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  // Start a new study session
  const startSession = async () => {
    if (!sessionSubject.trim()) {
      Alert.alert('❌ Error', 'Please enter a subject for your study session');
      return;
    }

    // Mock session creation
    const mockSession = {
      id: Date.now().toString(),
      subject: sessionSubject.trim(),
      startTime: new Date(),
      notes: sessionNotes,
    };

    setCurrentSession(mockSession);
    setIsTracking(true);
    setSessionTimer(0);
    setShowSessionForm(false);
    setSessionSubject('');
    setSessionNotes('');
    Alert.alert('🚀 Session Started', `Study session for ${sessionSubject.trim()} has begun!`);
  };

  // Mock stop session logic
  const stopSession = async () => {
    if (!currentSession) return;
    setCurrentSession(null);
    setIsTracking(false);
    setSessionTimer(0);
    setSessionNotes('');
    setIsPaused(false);
    Alert.alert('✅ Session Complete', 'Session stopped!');
  };

  // Pause/resume session logic
  const pauseSession = () => {
    if (!isTracking) return;
    setIsPaused((prev) => {
      const newPaused = !prev;
      Alert.alert(newPaused ? '⏸️ Paused' : '▶️ Resumed', newPaused ? 'Session paused.' : 'Session resumed.');
      return newPaused;
    });
  };

  // Edit session
  const editSession = async (session) => {
    Alert.alert(
      '✏️ Edit Session',
      `Edit functionality for ${session.subject} will be implemented in the next update.`,
      [{ text: 'OK' }]
    );
  };

  // Delete session
  const deleteSession = async (session) => {
    Alert.alert(
      '🗑️ Delete Session',
      `Are you sure you want to delete the ${session.subject} session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: This would require adding a deleteSession method to studySessionService
              // For now, we'll just remove it from the local state
            setSessions(prev => prev.filter(s => s.id !== session.id));
              setTotalStudyTime(prev => prev - (session.duration_minutes || 0));
              Alert.alert('✅ Success', 'Session deleted');
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('❌ Error', 'Failed to delete session');
            }
          }
        }
      ]
    );
  };

  // Get study statistics
  const getStudyStats = async () => {
    try {
      const { data, error } = await studySessionService.getStudyStats(user.id);
      
      if (error) {
        console.error('Error loading study stats:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error loading study stats:', error);
      return null;
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
        <Text style={[styles.loadingText, { color: navTheme.colors.text }]}>
          Loading study sessions...
        </Text>
      </View>
    );
  }

  // Get period data for selected time period
  const getPeriodData = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (selectedPeriod) {
      case 'today':
        return sessions.filter(s => s.start_time?.split('T')[0] === today);
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessions.filter(s => s.start_time && new Date(s.start_time) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessions.filter(s => s.start_time && new Date(s.start_time) >= monthAgo);
      default:
        return sessions;
    }
  };

  // Get subject statistics
  const getSubjectStats = () => {
    const periodSessions = getPeriodData();
    const stats = {};
    
    periodSessions.forEach(session => {
      if (stats[session.subject]) {
        stats[session.subject] += session.duration_minutes || 0;
      } else {
        stats[session.subject] = session.duration_minutes || 0;
      }
    });
    
    return Object.entries(stats)
      .map(([subject, duration]) => ({ subject, duration }))
      .sort((a, b) => b.duration - a.duration);
  };

  // Export data function
  const exportData = () => {
    Alert.alert('📤 Export Data', 'Export functionality will be implemented in the next update.');
  };

  // Share progress function
  const shareProgress = () => {
    Alert.alert('📤 Share Progress', 'Share functionality will be implemented in the next update.');
  };

  const periodSessions = getPeriodData();
  const subjectStats = getSubjectStats();
  const periodTotal = periodSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: navTheme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: navTheme.colors.text }]}>Study Time Tracker</Text>
      </View>

      {/* Current Session */}
      {isTracking && currentSession && (
        <View style={[styles.currentSessionCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.currentSessionTitle}>🔄 Current Session</Text>
          <Text style={[styles.currentSessionSubject, { color: navTheme.colors.text }]}>{currentSession.subject}</Text>
          <Text style={[styles.currentSessionTime, { color: navTheme.colors.text }]}>
            Started at {new Date(currentSession.start_time).toTimeString().substring(0, 5)}
          </Text>
          <Text style={[styles.timerDisplay, { color: navTheme.colors.text }]}>{formatTime(sessionTimer)}</Text>
          <View style={styles.sessionControls}>
            <TouchableOpacity style={styles.pauseButton} onPress={pauseSession}>
              <Text style={styles.pauseButtonText}>⏸️ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
              <Text style={styles.stopButtonText}>⏹️ Stop Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Start Session Button */}
      {!isTracking && (
        <View style={styles.startSection}>
          <TouchableOpacity style={styles.startButton} onPress={() => setShowSessionForm(true)}>
            <Text style={styles.startButtonText}>▶️ Start Study Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Session Form Modal */}
      {showSessionForm && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: navTheme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: navTheme.colors.text }]}>Start Study Session</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Subject (e.g., Math, Biology)"
              placeholderTextColor={navTheme.colors.text}
              value={sessionSubject}
              onChangeText={setSessionSubject}
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: navTheme.colors.background, color: navTheme.colors.text, borderColor: navTheme.colors.border }]}
              placeholder="Notes (optional)"
              placeholderTextColor={navTheme.colors.text}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: navTheme.colors.border }]}
                onPress={() => setShowSessionForm(false)}
              >
                <Text style={[styles.cancelText, { color: navTheme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={startSession}
              >
                <Text style={styles.confirmText}>Start Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
        <TouchableOpacity 
          style={[styles.periodTab, selectedPeriod === 'today' && styles.activePeriodTab]} 
          onPress={() => setSelectedPeriod('today')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'today' && styles.activePeriodText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodTab, selectedPeriod === 'week' && styles.activePeriodTab]} 
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.activePeriodText]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodTab, selectedPeriod === 'month' && styles.activePeriodTab]} 
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.activePeriodText]}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.periodTab, selectedPeriod === 'all' && styles.activePeriodTab]} 
          onPress={() => setSelectedPeriod('all')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'all' && styles.activePeriodText]}>All Time</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.statLabel}>Total Study Time</Text>
          <Text style={[styles.statValue, { color: navTheme.colors.text }]}>{formatTime(periodTotal)}</Text>
          <Text style={styles.statPeriod}>{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.statLabel}>Sessions</Text>
          <Text style={[styles.statValue, { color: navTheme.colors.text }]}>{periodSessions.length}</Text>
          <Text style={styles.statPeriod}>Completed</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={[styles.statValue, { color: navTheme.colors.text }]}>
            {periodSessions.length > 0 ? formatTime(Math.round(periodTotal / periodSessions.length)) : '0m'}
          </Text>
          <Text style={styles.statPeriod}>Per Session</Text>
        </View>
      </View>

      {/* Subject Breakdown */}
      <View style={styles.subjectSection}>
        <Text style={styles.sectionTitle}>📚 Subject Breakdown</Text>
        {subjectStats.map((stat, index) => (
          <View key={index} style={[styles.subjectItem, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
            <View style={styles.subjectInfo}>
              <Text style={[styles.subjectName, { color: navTheme.colors.text }]}>{stat.subject}</Text>
              <Text style={styles.subjectTime}>{formatTime(stat.duration)}</Text>
            </View>
            <View style={styles.subjectBar}>
              <View 
                style={[
                  styles.subjectProgress, 
                  { width: `${(stat.duration / periodTotal) * 100}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Sessions */}
      <View style={styles.sessionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Recent Sessions</Text>
          <TouchableOpacity style={styles.exportButton} onPress={exportData}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
        {periodSessions.slice(0, 5).map((session) => (
          <View key={session.id} style={[styles.sessionItem, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
                         <View style={styles.sessionInfo}>
               <Text style={[styles.sessionSubject, { color: navTheme.colors.text }]}>{session.subject}</Text>
               <Text style={[styles.sessionDate, { color: navTheme.colors.text }]}>
                 {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </Text>
             </View>
             <View style={styles.sessionActions}>
               <Text style={styles.sessionDuration}>{formatTime(session.duration_minutes * 60)}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => editSession(session)}>
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSession(session)}>
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Goals and Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>🎯 Insights & Goals</Text>
        
        <View style={[styles.insightCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.insightIcon}>📈</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Daily Goal Progress</Text>
            <Text style={styles.insightText}>
              You're {Math.round((periodTotal / 240) * 100)}% to your daily goal of 4 hours
            </Text>
            <View style={styles.goalBar}>
              <View 
                style={[
                  styles.goalProgress, 
                  { width: `${Math.min((periodTotal / 240) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>
        
        <View style={[styles.insightCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.insightIcon}>⏰</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Best Study Time</Text>
            <Text style={styles.insightText}>
              Your most productive sessions are in the morning (9-11 AM)
            </Text>
          </View>
        </View>
        
        <View style={[styles.insightCard, { backgroundColor: navTheme.colors.card, borderColor: navTheme.colors.border }]}>
          <Text style={styles.insightIcon}>🎓</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Top Subject</Text>
            <Text style={styles.insightText}>
              Biology is your most studied subject this week
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.shareButton} onPress={shareProgress}>
          <Text style={styles.shareText}>📤 Share Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      {/* Removed feature descriptions for distraction-free UI */}
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
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  currentSessionCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  currentSessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  currentSessionSubject: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentSessionTime: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sessionControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startSection: {
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodTab: {
    backgroundColor: '#A78BFA',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activePeriodText: {
    color: '#fff',
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statPeriod: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  subjectSection: {
    marginBottom: 24,
  },
  subjectItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  subjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  subjectTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  subjectBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  subjectProgress: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  exportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontSize: 20,
    color: '#4F46E5',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 20,
    color: '#EF4444',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  goalBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  actionSection: {
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    width: '48%',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
