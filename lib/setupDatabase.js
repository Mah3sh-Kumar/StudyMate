import { supabase } from './supabase';
import { initDatabase, checkDatabaseStatus } from './initDatabase';
import { testBackend } from './testBackend';

/**
 * Complete database setup and integration helper
 * This file provides easy-to-use functions for setting up and testing the database
 */

export const DatabaseSetup = {
  /**
   * Check if database is ready to use
   */
  async checkStatus() {
    try {
      const status = await checkDatabaseStatus();
      return status;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },

  /**
   * Initialize the database with all required tables
   */
  async initialize() {
    try {
      console.log('🚀 Starting database setup...');
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { 
          success: false, 
          error: 'User must be authenticated before initializing database' 
        };
      }

      // Initialize database schema
      const result = await initDatabase();
      
      if (result.success) {
        console.log('✅ Database initialization completed');
        return result;
      } else {
        console.error('❌ Database initialization failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Database setup error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test all database functions
   */
  async test() {
    try {
      console.log('🧪 Testing database functionality...');
      const result = await testBackend();
      return result;
    } catch (error) {
      console.error('❌ Database test error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Complete setup and test process
   */
  async setupAndTest() {
    try {
      // Step 1: Check current status
      console.log('1️⃣ Checking database status...');
      const status = await this.checkStatus();
      
      if (status.status === 'error') {
        // Step 2: Initialize if needed
        console.log('2️⃣ Initializing database...');
        const initResult = await this.initialize();
        
        if (!initResult.success) {
          return { 
            success: false, 
            error: `Database initialization failed: ${initResult.error}` 
          };
        }
      } else {
        console.log('✅ Database already initialized');
      }

      // Step 3: Test functionality
      console.log('3️⃣ Testing database functions...');
      const testResult = await this.test();
      
      if (testResult.success) {
        console.log('🎉 Database setup completed successfully!');
        return { 
          success: true, 
          message: 'Database is ready for use' 
        };
      } else {
        return { 
          success: false, 
          error: `Database test failed: ${testResult.error}` 
        };
      }
    } catch (error) {
      console.error('❌ Complete setup error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create sample data for testing (optional)
   */
  async createSampleData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      console.log('📝 Creating sample data...');

      // Sample flashcard deck
      const { data: deck } = await supabase
        .from('flashcard_decks')
        .insert({
          user_id: user.id,
          name: 'Sample Vocabulary',
          description: 'Basic vocabulary flashcards',
          subject: 'Language',
          is_public: false
        })
        .select()
        .single();

      if (deck) {
        // Sample flashcards
        await supabase
          .from('flashcards')
          .insert([
            {
              deck_id: deck.id,
              front: 'Hello',
              back: 'A greeting or expression of goodwill'
            },
            {
              deck_id: deck.id,
              front: 'Knowledge',
              back: 'Information and understanding acquired through experience'
            }
          ]);
      }

      // Sample study group
      const { data: group } = await supabase
        .from('study_groups')
        .insert({
          name: 'General Study Group',
          description: 'A place for collaborative learning',
          subject: 'General',
          created_by: user.id,
          is_public: true
        })
        .select()
        .single();

      if (group) {
        // Add user as member
        await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
          });
      }

      console.log('✅ Sample data created successfully');
      return { success: true, message: 'Sample data created' };
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get database statistics and usage info
   */
  async getStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const stats = {};

      // Count flashcard decks
      const { count: deckCount } = await supabase
        .from('flashcard_decks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Count flashcards
      const { count: cardCount } = await supabase
        .from('flashcards')
        .select('deck_id!inner(user_id)', { count: 'exact' })
        .eq('deck_id.user_id', user.id);

      // Count study sessions
      const { count: sessionCount } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Count group memberships
      const { count: groupCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      stats.decks = deckCount || 0;
      stats.flashcards = cardCount || 0;
      stats.sessions = sessionCount || 0;
      stats.groups = groupCount || 0;

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default DatabaseSetup;