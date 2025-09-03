import { Alert } from 'react-native';
import { DatabaseSetup } from '../lib/setupDatabase';
import { userService, studySessionService, flashcardService, studyGroupService } from '../lib/database';

/**
 * Helper functions to easily test and demonstrate Supabase integration
 * These functions can be called from any component to test database functionality
 */

export const SupabaseDemo = {
  /**
   * Quick setup - initialize database and create sample data
   */
  async quickSetup() {
    try {
      console.log('🚀 Starting quick setup...');
      
      // Step 1: Setup database
      const setupResult = await DatabaseSetup.setupAndTest();
      if (!setupResult.success) {
        Alert.alert('❌ Setup Failed', setupResult.error);
        return { success: false, error: setupResult.error };
      }
      
      // Step 2: Create sample data
      const sampleResult = await DatabaseSetup.createSampleData();
      if (!sampleResult.success) {
        console.warn('Sample data creation failed:', sampleResult.error);
      }
      
      Alert.alert('✅ Setup Complete', 'Database is ready to use!');
      return { success: true, message: 'Quick setup completed' };
    } catch (error) {
      Alert.alert('❌ Error', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test flashcard operations
   */
  async testFlashcards(userId) {
    try {
      console.log('🧪 Testing flashcard operations...');
      
      // Create a test deck
      const { data: deck, error: deckError } = await flashcardService.createDeck(userId, {
        name: 'Test Deck',
        description: 'Demo deck for testing',
        subject: 'Testing',
        isPublic: false
      });
      
      if (deckError) throw new Error(deckError.message);
      
      // Add some cards
      const cards = [
        { front: 'What is React Native?', back: 'A framework for building mobile apps' },
        { front: 'What is Supabase?', back: 'An open source Firebase alternative' }
      ];
      
      for (const card of cards) {
        await flashcardService.addFlashcard(deck.id, card);
      }
      
      // Load the cards back
      const { data: loadedCards } = await flashcardService.getDeckCards(deck.id);
      
      Alert.alert('✅ Flashcards Test', `Created deck with ${loadedCards?.length || 0} cards`);
      return { success: true, data: { deck, cards: loadedCards } };
    } catch (error) {
      Alert.alert('❌ Flashcards Test Failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test study session operations
   */
  async testStudySessions(userId) {
    try {
      console.log('🧪 Testing study session operations...');
      
      // Start a session
      const { data: session, error: startError } = await studySessionService.startSession(userId, {
        subject: 'Test Subject',
        tags: ['demo', 'testing']
      });
      
      if (startError) throw new Error(startError.message);
      
      // Wait a moment then end it
      setTimeout(async () => {
        await studySessionService.endSession(session.id, 'Demo session completed');
      }, 2000);
      
      // Get user's sessions
      const { data: sessions } = await studySessionService.getUserSessions(userId, 10);
      
      Alert.alert('✅ Study Sessions Test', `Found ${sessions?.length || 0} sessions`);
      return { success: true, data: { session, sessions } };
    } catch (error) {
      Alert.alert('❌ Study Sessions Test Failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test study group operations
   */
  async testStudyGroups(userId) {
    try {
      console.log('🧪 Testing study group operations...');
      
      // Create a group
      const { data: group, error: groupError } = await studyGroupService.createGroup(userId, {
        name: 'Test Study Group',
        description: 'Demo group for testing',
        subject: 'Testing',
        isPublic: true,
        tags: ['demo']
      });
      
      if (groupError) throw new Error(groupError.message);
      
      // Get public groups
      const { data: publicGroups } = await studyGroupService.getPublicGroups();
      
      // Get user's groups
      const { data: userGroups } = await studyGroupService.getUserGroups(userId);
      
      Alert.alert('✅ Study Groups Test', `Created group. Found ${publicGroups?.length || 0} public groups`);
      return { success: true, data: { group, publicGroups, userGroups } };
    } catch (error) {
      Alert.alert('❌ Study Groups Test Failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test user profile operations
   */
  async testUserProfile(userId) {
    try {
      console.log('🧪 Testing user profile operations...');
      
      // Update profile
      const { data: updatedProfile, error: updateError } = await userService.updateProfile(userId, {
        full_name: 'Test User',
        username: 'testuser_' + Date.now(),
        study_subjects: ['Math', 'Science'],
        study_goals: ['Improve grades', 'Learn new concepts']
      });
      
      if (updateError) throw new Error(updateError.message);
      
      // Get profile back
      const { data: profile } = await userService.getProfile(userId);
      
      Alert.alert('✅ Profile Test', `Profile updated: ${profile?.full_name}`);
      return { success: true, data: { profile } };
    } catch (error) {
      Alert.alert('❌ Profile Test Failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests
   */
  async runAllTests(userId) {
    if (!userId) {
      Alert.alert('❌ Error', 'User must be authenticated to run tests');
      return { success: false, error: 'No user ID provided' };
    }

    try {
      console.log('🧪 Running comprehensive database tests...');
      
      const results = {};
      
      // Test profile
      results.profile = await this.testUserProfile(userId);
      
      // Test flashcards
      results.flashcards = await this.testFlashcards(userId);
      
      // Test study sessions
      results.sessions = await this.testStudySessions(userId);
      
      // Test study groups
      results.groups = await this.testStudyGroups(userId);
      
      const successCount = Object.values(results).filter(r => r.success).length;
      const totalTests = Object.keys(results).length;
      
      Alert.alert(
        '🎉 All Tests Complete', 
        `${successCount}/${totalTests} tests passed successfully!`
      );
      
      return { success: true, data: results };
    } catch (error) {
      Alert.alert('❌ Test Suite Failed', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get comprehensive database statistics
   */
  async getDetailedStats(userId) {
    try {
      const stats = await DatabaseSetup.getStats();
      if (!stats.success) {
        throw new Error(stats.error);
      }

      // Get additional statistics
      const { data: studyStats } = await studySessionService.getStudyStats(userId);
      
      const detailedStats = {
        ...stats.data,
        studyTime: studyStats?.totalMinutes || 0,
        avgSessionLength: studyStats?.averageSessionLength || 0,
        subjects: studyStats?.subjects || {}
      };

      return { success: true, data: detailedStats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default SupabaseDemo;