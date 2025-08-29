import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Clipboard } from 'react-native';

export default function TrackerScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [sessionTimer, setSessionTimer] = useState(0);

  // Mock data for sessions
  useEffect(() => {
    const mockSessions = [
      { id: '1', subject: 'Biology', duration: 120, date: '2024-01-15', time: '09:00' },
      { id: '2', subject: 'Calculus', duration: 90, date: '2024-01-15', time: '14:00' },
      { id: '3', subject: 'History', duration: 60, date: '2024-01-14', time: '16:00' },
      { id: '4', subject: 'Biology', duration: 150, date: '2024-01-13', time: '10:00' },
      { id: '5', subject: 'Chemistry', duration: 75, date: '2024-01-12', time: '13:00' },
    ];
    setSessions(mockSessions);
    
    const total = mockSessions.reduce((sum, session) => sum + session.duration, 0);
    setTotalStudyTime(total);
  }, []);

  // Timer effect for active sessions
  useEffect(() => {
    let interval;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const startSession = () => {
    const newSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      subject: 'Current Session',
    };
    setCurrentSession(newSession);
    setIsTracking(true);
    setSessionTimer(0);
  };

  const stopSession = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.round((endTime - currentSession.startTime) / 1000 / 60); // in minutes
      
      const completedSession = {
        id: currentSession.id,
        subject: currentSession.subject,
        duration: duration,
        date: endTime.toISOString().split('T')[0],
        time: endTime.toTimeString().split(' ')[0].substring(0, 5),
      };
      
      setSessions(prev => [completedSession, ...prev]);
      setTotalStudyTime(prev => prev + duration);
      setCurrentSession(null);
      setIsTracking(false);
      setSessionTimer(0);
      
      Alert.alert('Session Complete', `You studied for ${duration} minutes!`);
    }
  };

  const pauseSession = () => {
    Alert.alert('Pause Session', 'Session paused. Resume functionality will be implemented.');
  };

  const editSession = (session) => {
    Alert.alert('Edit Session', `Edit functionality for ${session.subject} will be implemented.`);
  };

  const deleteSession = (session) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete the ${session.subject} session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSessions(prev => prev.filter(s => s.id !== session.id));
            setTotalStudyTime(prev => prev - session.duration);
            Alert.alert('Success', 'Session deleted');
          }
        }
      ]
    );
  };

  const shareProgress = async () => {
    const periodSessions = getPeriodData();
    const periodTotal = periodSessions.reduce((sum, s) => sum + s.duration, 0);
    const shareText = `📚 My Study Progress: ${formatTime(periodTotal)} this ${selectedPeriod}! 🎯`;
    
    try {
      await Clipboard.setString(shareText);
      Alert.alert('Success', 'Progress copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy progress');
    }
  };

  const exportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be implemented.');
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPeriodData = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (selectedPeriod) {
      case 'today':
        return sessions.filter(s => s.date === today);
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessions.filter(s => new Date(s.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessions.filter(s => new Date(s.date) >= monthAgo);
      default:
        return sessions;
    }
  };

  const getSubjectStats = () => {
    const periodSessions = getPeriodData();
    const stats = {};
    
    periodSessions.forEach(session => {
      if (stats[session.subject]) {
        stats[session.subject] += session.duration;
      } else {
        stats[session.subject] = session.duration;
      }
    });
    
    return Object.entries(stats)
      .map(([subject, duration]) => ({ subject, duration }))
      .sort((a, b) => b.duration - a.duration);
  };

  const periodSessions = getPeriodData();
  const subjectStats = getSubjectStats();
  const periodTotal = periodSessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Time Tracker</Text>
        <Text style={styles.headerSubtitle}>Monitor your learning progress</Text>
      </View>

      {/* Current Session */}
      {isTracking && currentSession && (
        <View style={styles.currentSessionCard}>
          <Text style={styles.currentSessionTitle}>🔄 Current Session</Text>
          <Text style={styles.currentSessionSubject}>{currentSession.subject}</Text>
          <Text style={styles.currentSessionTime}>
            Started at {currentSession.startTime.toTimeString().substring(0, 5)}
          </Text>
          <Text style={styles.timerDisplay}>{formatTimer(sessionTimer)}</Text>
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
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Text style={styles.startButtonText}>▶️ Start Study Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Period Selector */}
      <View style={styles.periodSelector}>
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
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Study Time</Text>
          <Text style={styles.statValue}>{formatTime(periodTotal)}</Text>
          <Text style={styles.statPeriod}>{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sessions</Text>
          <Text style={styles.statValue}>{periodSessions.length}</Text>
          <Text style={styles.statPeriod}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            {periodSessions.length > 0 ? formatTime(Math.round(periodTotal / periodSessions.length)) : '0m'}
          </Text>
          <Text style={styles.statPeriod}>Per Session</Text>
        </View>
      </View>

      {/* Subject Breakdown */}
      <View style={styles.subjectSection}>
        <Text style={styles.sectionTitle}>📚 Subject Breakdown</Text>
        {subjectStats.map((stat, index) => (
          <View key={index} style={styles.subjectItem}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{stat.subject}</Text>
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
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionSubject}>{session.subject}</Text>
              <Text style={styles.sessionDate}>{session.date} at {session.time}</Text>
            </View>
            <View style={styles.sessionActions}>
              <Text style={styles.sessionDuration}>{formatTime(session.duration)}</Text>
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
        
        <View style={styles.insightCard}>
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
        
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>⏰</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Best Study Time</Text>
            <Text style={styles.insightText}>
              Your most productive sessions are in the morning (9-11 AM)
            </Text>
          </View>
        </View>
        
        <View style={styles.insightCard}>
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
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>🚀 Tracking Features</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={styles.featureText}>Real-time tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Detailed analytics</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Goal setting</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>Progress visualization</Text>
          </View>
        </View>
      </View>
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
    marginTop: 60,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  currentSessionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    alignItems: 'center',
  },
  currentSessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
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
});
