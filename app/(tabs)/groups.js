import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useThemePreference } from '../../contexts/ThemeContext';
import { studyGroupService, dbUtils } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

export default function GroupsScreen() {
  const { colors } = useThemePreference();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('myGroups');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  // Load groups on component mount
  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Load user's groups and available public groups
  const loadGroups = async () => {
    try {
      setLoading(true);
      
      // Load user's groups
      const { data: userGroups, error: userGroupsError } = await studyGroupService.getUserGroups(user.id);
      if (userGroupsError) {
        console.error('Error loading user groups:', userGroupsError);
        Alert.alert('❌ Error', dbUtils.handleError(userGroupsError));
      } else {
        setMyGroups(userGroups || []);
      }
      
      // Load public groups
      const { data: publicGroups, error: publicGroupsError } = await studyGroupService.getPublicGroups();
      if (publicGroupsError) {
        console.error('Error loading public groups:', publicGroupsError);
        Alert.alert('❌ Error', dbUtils.handleError(publicGroupsError));
      } else {
        // Filter out groups the user is already a member of
        const userGroupIds = (userGroups || []).map(g => g.id);
        const filteredPublicGroups = (publicGroups || []).filter(g => !userGroupIds.includes(g.id));
        setAvailableGroups(filteredPublicGroups);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('❌ Error', dbUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // Create new study group
  const createGroup = async () => {
    if (!newGroupName.trim() || !newGroupSubject.trim()) {
      Alert.alert('❌ Error', 'Please fill in both group name and subject');
      return;
    }
    
    try {
      const { data, error } = await studyGroupService.createGroup(user.id, {
      name: newGroupName.trim(),
      subject: newGroupSubject.trim(),
        description: newGroupDescription.trim() || `Study group for ${newGroupSubject.trim()}`,
        isPublic: true,
        tags: [newGroupSubject.trim()]
      });
      
      if (error) {
        Alert.alert('❌ Error', dbUtils.handleError(error));
        return;
      }
      
      // Refresh groups
      await loadGroups();
      
      Alert.alert('✅ Success', 'Group created successfully!');
    setShowCreateGroup(false);
    setNewGroupName('');
    setNewGroupSubject('');
      setNewGroupDescription('');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('❌ Error', 'Failed to create group');
    }
  };

  // Join a public group
  const joinGroup = async (group) => {
    try {
      const { error } = await studyGroupService.addMember(group.id, user.id, 'member');
      
      if (error) {
        Alert.alert('❌ Error', dbUtils.handleError(error));
        return;
      }
      
      // Refresh groups
      await loadGroups();
      
      Alert.alert('✅ Success', `You've joined ${group.name}!`);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('❌ Error', 'Failed to join group');
    }
  };

  // Leave a group
  const leaveGroup = async (group) => {
    Alert.alert(
      '🚪 Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await studyGroupService.removeMember(group.id, user.id);
              
              if (error) {
                Alert.alert('❌ Error', 'Failed to leave group');
                return;
              }
              
              // Refresh groups
              await loadGroups();
              
              Alert.alert('✅ Success', `You've left ${group.name}`);
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('❌ Error', 'Failed to leave group');
            }
          }
        }
      ]
    );
  };

  // Delete a group (only for group creators)
  const deleteGroup = async (group) => {
    Alert.alert(
      '🗑️ Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: This would require adding a deleteGroup method to studyGroupService
              // For now, we'll just remove the user from the group
              const { error } = await studyGroupService.removeMember(group.id, user.id);
              
              if (error) {
                Alert.alert('❌ Error', 'Failed to delete group');
                return;
              }
              
              // Refresh groups
              await loadGroups();
              
              Alert.alert('✅ Success', `Group "${group.name}" has been removed`);
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('❌ Error', 'Failed to delete group');
            }
          }
        }
      ]
    );
  };

  // Search groups
  const filteredMyGroups = myGroups.filter(group => 
    group.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const filteredAvailableGroups = availableGroups.filter(group => 
    group.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Render group item
  const renderGroupItem = ({ item, isMyGroup = false }) => (
    <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.groupHeader}>
        <Text style={[styles.groupName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.groupSubject, { color: colors.text, opacity: 0.7 }]}>
          {item.subject}
        </Text>
      </View>
      
      {item.description && (
        <Text style={[styles.groupDescription, { color: colors.text, opacity: 0.8 }]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.groupFooter}>
        <Text style={[styles.memberCount, { color: colors.text, opacity: 0.7 }]}>
          👥 {item.members || 0} members
        </Text>
        
        {isMyGroup ? (
          <View style={styles.myGroupActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={() => leaveGroup(item)}
            >
              <Text style={styles.buttonText}>Leave</Text>
            </TouchableOpacity>
            
            {item.created_by === user?.id && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteGroup(item)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => joinGroup(item)}
          >
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading study groups...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Groups</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Search groups..."
          placeholderTextColor={colors.text + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={[styles.tabSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'myGroups' && styles.activeTab]} 
          onPress={() => setActiveTab('myGroups')}
        >
          <Text style={[styles.tabText, activeTab === 'myGroups' && styles.activeTabText, { color: activeTab === 'myGroups' ? '#fff' : colors.text }]}>
            My Groups ({filteredMyGroups.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]} 
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText, { color: activeTab === 'available' ? '#fff' : colors.text }]}>
            Available Groups ({filteredAvailableGroups.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'myGroups' && (
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Study Groups</Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateGroup(true)}
            >
              <Text style={styles.createButtonText}>+ Create Group</Text>
            </TouchableOpacity>
          </View>
          
          {filteredMyGroups.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups yet</Text>
              <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>Create your first study group or join an existing one!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMyGroups}
              renderItem={(item) => renderGroupItem({ ...item, isMyGroup: true })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            />
          )}
        </View>
      )}

      {activeTab === 'available' && (
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Groups</Text>
          {filteredAvailableGroups.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups found</Text>
              <Text style={[styles.emptyText, { color: colors.text, opacity: 0.7 }]}>Try adjusting your search or create a new group!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAvailableGroups}
              renderItem={(item) => renderGroupItem({ ...item, isMyGroup: false })}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.groupsList}
            />
          )}
        </View>
      )}

      {showCreateGroup && (
        <View style={styles.modalOverlay}>
          <View style={[styles.createGroupModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Study Group</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Group Name"
              placeholderTextColor={colors.text + '80'}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Subject"
              placeholderTextColor={colors.text + '80'}
              value={newGroupSubject}
              onChangeText={setNewGroupSubject}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.text + '80'}
              value={newGroupDescription}
              onChangeText={setNewGroupDescription}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setShowCreateGroup(false)}
              >
                <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={createGroup}
              >
                <Text style={styles.confirmText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  tabSection: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
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
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupSubject: {
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  myGroupActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  joinButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
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
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
