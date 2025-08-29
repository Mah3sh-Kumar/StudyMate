import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Alert } from 'react-native';

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState('myGroups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('');
  const [myGroups, setMyGroups] = useState([
    {
      id: '1',
      name: 'Biology Study Group',
      subject: 'Biology',
      members: 8,
      lastActive: '2 hours ago',
      unreadMessages: 3,
      description: 'Study group for Biology 101 final exam preparation'
    },
    {
      id: '2',
      name: 'Math Warriors',
      subject: 'Calculus',
      members: 12,
      lastActive: '1 day ago',
      unreadMessages: 0,
      description: 'Advanced calculus problem solving and study sessions'
    }
  ]);

  const [availableGroups, setAvailableGroups] = useState([
    {
      id: '3',
      name: 'History Buffs',
      subject: 'World History',
      members: 15,
      lastActive: '30 minutes ago',
      description: 'Exploring world history through interactive discussions'
    },
    {
      id: '4',
      name: 'Chemistry Lab',
      subject: 'Chemistry',
      members: 6,
      lastActive: '3 hours ago',
      description: 'Lab report collaboration and experiment sharing'
    }
  ]);

  const createGroup = () => {
    if (!newGroupName.trim() || !newGroupSubject.trim()) {
      Alert.alert('Error', 'Please fill in both group name and subject');
      return;
    }
    
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      subject: newGroupSubject.trim(),
      members: 1,
      lastActive: 'Just now',
      unreadMessages: 0,
      description: `Study group for ${newGroupSubject.trim()}`
    };
    
    setMyGroups(prev => [newGroup, ...prev]);
    Alert.alert('Success', 'Group created successfully!');
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupSubject('');
  };

  const joinGroup = (group) => {
    // Remove from available groups and add to my groups
    setAvailableGroups(prev => prev.filter(g => g.id !== group.id));
    
    const joinedGroup = {
      ...group,
      members: group.members + 1,
      lastActive: 'Just now',
      unreadMessages: 0
    };
    
    setMyGroups(prev => [joinedGroup, ...prev]);
    Alert.alert('Success', `You've joined ${group.name}!`);
  };

  const leaveGroup = (group) => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setMyGroups(prev => prev.filter(g => g.id !== group.id));
            
            const leftGroup = {
              ...group,
              members: Math.max(0, group.members - 1),
              lastActive: 'Just now'
            };
            
            setAvailableGroups(prev => [leftGroup, ...prev]);
            Alert.alert('Success', `You've left ${group.name}`);
          }
        }
      ]
    );
  };

  const openGroupChat = (group) => {
    Alert.alert('Group Chat', `Opening chat for ${group.name}. Chat functionality will be implemented.`);
  };

  const searchGroups = (query) => {
    setSearchQuery(query);
    // In a real app, this would filter groups based on search query
  };

  const renderGroupItem = ({ item, isMyGroup = false }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupSubject}>{item.subject}</Text>
        </View>
        <View style={styles.groupStats}>
          <Text style={styles.memberCount}>{item.members} members</Text>
          <Text style={styles.lastActive}>{item.lastActive}</Text>
        </View>
      </View>
      
      <Text style={styles.groupDescription}>{item.description}</Text>
      
      {isMyGroup && item.unreadMessages > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadMessages} new</Text>
        </View>
      )}
      
      <View style={styles.groupActions}>
        {isMyGroup ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => openGroupChat(item)}>
              <Text style={styles.actionText}>Open Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaveButton} onPress={() => leaveGroup(item)}>
              <Text style={styles.leaveText}>Leave</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton} 
            onPress={() => joinGroup(item)}
          >
            <Text style={styles.joinText}>Join Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredMyGroups = myGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableGroups = availableGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Groups</Text>
        <Text style={styles.headerSubtitle}>Collaborate and learn together</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={searchGroups}
        />
      </View>

      <View style={styles.tabSection}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'myGroups' && styles.activeTab]} 
          onPress={() => setActiveTab('myGroups')}
        >
          <Text style={[styles.tabText, activeTab === 'myGroups' && styles.activeTabText]}>
            My Groups ({filteredMyGroups.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]} 
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Groups ({filteredAvailableGroups.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'myGroups' && (
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Study Groups</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateGroup(true)}
            >
              <Text style={styles.createButtonText}>+ Create Group</Text>
            </TouchableOpacity>
          </View>
          
          {filteredMyGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptyText}>Create your first study group or join an existing one!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMyGroups}
              renderItem={(item) => renderGroupItem(item, true)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            />
          )}
        </View>
      )}

      {activeTab === 'available' && (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Available Groups</Text>
          {filteredAvailableGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No groups found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or create a new group!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAvailableGroups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            />
          )}
        </View>
      )}

      {showCreateGroup && (
        <View style={styles.modalOverlay}>
          <View style={styles.createGroupModal}>
            <Text style={styles.modalTitle}>Create New Study Group</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Group Name"
              placeholderTextColor="#9CA3AF"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              placeholderTextColor="#9CA3AF"
              value={newGroupSubject}
              onChangeText={setNewGroupSubject}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateGroup(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={createGroup}
              >
                <Text style={styles.confirmText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>🚀 Group Features</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Group Chat</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📁</Text>
            <Text style={styles.featureText}>File Sharing</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Study Sessions</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Progress Tracking</Text>
          </View>
        </View>
      </View>
    </View>
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
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#A78BFA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  contentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  groupsList: {
    flex: 1,
  },
  groupCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupSubject: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  groupActions: {
    alignItems: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  leaveText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  joinButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  joinText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
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
  createGroupModal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  featuresSection: {
    marginTop: 24,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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
  messageItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageAvatar: {
    fontSize: 20,
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
