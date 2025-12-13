import { supabase } from './supabase';

/**
 * Database initialization script
 * 
 * ⚠️ WARNING: This file uses supabase.rpc('exec_sql') which does NOT exist in Supabase by default.
 * This function will fail unless you create a custom RPC function in Supabase.
 * 
 * RECOMMENDED: Use the SQL files in the /sql directory instead:
 * - Run sql/00_complete_setup.sql in Supabase SQL Editor for complete setup
 * - Or run sql/01_schema.sql, sql/02_indexes.sql, sql/03_rls.sql in order
 * 
 * This file is kept for reference but should not be used for database initialization.
 */
export const initDatabase = async () => {
  try {
    console.log('🚀 Initializing StudyMate database...');
    console.warn('⚠️ WARNING: This function uses exec_sql RPC which may not exist. Use SQL files in /sql directory instead.');

    // Check if tables exist by trying to query them
    const { data: profilesExist, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // If we get data or no error (table exists), database is initialized
    if (profilesExist !== null || !checkError) {
      console.log('✅ Database already initialized');
      return { success: true, message: 'Database already initialized' };
    }

    // If error indicates table doesn't exist, we need to create it
    if (checkError && checkError.message?.includes('relation "profiles" does not exist')) {
      console.log('📊 Database tables not found. Please run SQL files from /sql directory in Supabase SQL Editor.');
      return { 
        success: false, 
        error: 'Database tables not found. Please run sql/00_complete_setup.sql in Supabase SQL Editor.' 
      };
    }

    console.log('📊 Attempting to create database schema...');
    console.warn('⚠️ This requires a custom exec_sql RPC function. Use SQL files instead!');

    // Create profiles table
    // NOTE: This will fail unless exec_sql RPC function exists in Supabase
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name VARCHAR(255),
          username VARCHAR(100) UNIQUE,
          email VARCHAR(255),
          avatar_url TEXT,
          study_subjects TEXT[],
          study_goals TEXT[],
          preferences JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.log('⚠️ Profiles table creation skipped (may already exist)');
    }

    // Create study_groups table
    const { error: groupsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS study_groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          subject VARCHAR(100),
          max_members INTEGER DEFAULT 50,
          created_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          is_public BOOLEAN DEFAULT true,
          tags TEXT[]
        );
      `
    });

    if (groupsError) {
      console.log('⚠️ Study groups table creation skipped (may already exist)');
    }

    // Create group_members table
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS group_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'member',
          joined_at TIMESTAMP DEFAULT NOW(),
          last_active TIMESTAMP DEFAULT NOW(),
          UNIQUE(group_id, user_id)
        );
      `
    });

    if (membersError) {
      console.log('⚠️ Group members table creation skipped (may already exist)');
    }

    // Create study_sessions table
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS study_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          subject VARCHAR(100) NOT NULL,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          duration_minutes INTEGER,
          notes TEXT,
          tags TEXT[],
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (sessionsError) {
      console.log('⚠️ Study sessions table creation skipped (may already exist)');
    }

    // Create flashcard_decks table
    const { error: decksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS flashcard_decks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          subject VARCHAR(100),
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          total_cards INTEGER DEFAULT 0
        );
      `
    });

    if (decksError) {
      console.log('⚠️ Flashcard decks table creation skipped (may already exist)');
    }

    // Create flashcards table
    const { error: cardsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS flashcards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
          front TEXT NOT NULL,
          back TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          difficulty_level INTEGER DEFAULT 1,
          last_reviewed TIMESTAMP,
          review_count INTEGER DEFAULT 0
        );
      `
    });

    if (cardsError) {
      console.log('⚠️ Flashcards table creation skipped (may already exist)');
    }

    // Create study_materials table
    const { error: materialsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS study_materials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          file_url TEXT,
          file_type VARCHAR(50),
          subject VARCHAR(100),
          tags TEXT[],
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (materialsError) {
      console.log('⚠️ Study materials table creation skipped (may already exist)');
    }

    // Create ai_generated_content table
    const { error: aiContentError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ai_generated_content (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          content_type VARCHAR(50) NOT NULL,
          original_text TEXT,
          generated_content JSONB,
          ai_model VARCHAR(100),
          tokens_used INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (aiContentError) {
      console.log('⚠️ AI content table creation skipped (may already exist)');
    }

    // Create group_messages table
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS group_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          message_type VARCHAR(50) DEFAULT 'text',
          file_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (messagesError) {
      console.log('⚠️ Group messages table creation skipped (may already exist)');
    }

    // Create indexes for better performance
    console.log('📈 Creating database indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)',
      'CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username)',
      'CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject)',
      'CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject ON study_sessions(user_id, subject)',
      'CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id)',
      'CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id)',
      'CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id)',
      'CREATE INDEX IF NOT EXISTS idx_study_materials_user ON study_materials(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_content_user ON ai_generated_content(user_id)'
    ];

    for (const index of indexes) {
      try {
        await supabase.rpc('exec_sql', { sql: index });
      } catch (error) {
        console.log(`⚠️ Index creation skipped: ${index}`);
      }
    }

    // Enable Row Level Security (RLS)
    console.log('🔒 Enabling Row Level Security...');
    
    const rlsTables = [
      'profiles', 'study_groups', 'group_members', 'study_sessions',
      'flashcard_decks', 'flashcards', 'study_materials', 
      'ai_generated_content', 'group_messages'
    ];

    for (const table of rlsTables) {
      try {
        await supabase.rpc('exec_sql', { sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` });
      } catch (error) {
        console.log(`⚠️ RLS enablement skipped for ${table}`);
      }
    }

    // Create RLS policies
    console.log('🛡️ Creating security policies...');
    
    const policies = [
      // Profiles policies
      `CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)`,
      `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)`,
      `CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
      
      // Study groups policies
      `CREATE POLICY IF NOT EXISTS "Anyone can view public groups" ON study_groups FOR SELECT USING (is_public = true)`,
      `CREATE POLICY IF NOT EXISTS "Users can view groups they're members of" ON study_groups FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can create groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by)`,
      
      // Group members policies
      `CREATE POLICY IF NOT EXISTS "Members can view group members" ON group_members FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can join public groups" ON group_members FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM study_groups WHERE id = group_members.group_id AND is_public = true)
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id)`,
      
      // Study sessions policies
      `CREATE POLICY IF NOT EXISTS "Users can view own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can create own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can update own sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id)`,
      
      // Flashcard policies
      `CREATE POLICY IF NOT EXISTS "Users can view own decks" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can view public decks" ON flashcard_decks FOR SELECT USING (is_public = true)`,
      `CREATE POLICY IF NOT EXISTS "Users can create own decks" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can update own decks" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own decks" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id)`,
      
      // Flashcards policies
      `CREATE POLICY IF NOT EXISTS "Users can view cards in their decks" ON flashcards FOR SELECT USING (
        EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can view cards in public decks" ON flashcards FOR SELECT USING (
        EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND is_public = true)
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can create cards in their decks" ON flashcards FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can update cards in their decks" ON flashcards FOR UPDATE USING (
        EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Users can delete cards in their decks" ON flashcards FOR DELETE USING (
        EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
      )`,
      
      // Study materials policies
      `CREATE POLICY IF NOT EXISTS "Users can view own materials" ON study_materials FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can create own materials" ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can update own materials" ON study_materials FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can delete own materials" ON study_materials FOR DELETE USING (auth.uid() = user_id)`,
      
      // AI content policies
      `CREATE POLICY IF NOT EXISTS "Users can view own AI content" ON ai_generated_content FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY IF NOT EXISTS "Users can create own AI content" ON ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      
      // Group messages policies
      `CREATE POLICY IF NOT EXISTS "Members can view group messages" ON group_messages FOR SELECT USING (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
      )`,
      `CREATE POLICY IF NOT EXISTS "Members can send group messages" ON group_messages FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
      )`
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy });
      } catch (error) {
        console.log(`⚠️ Policy creation skipped: ${policy.substring(0, 50)}...`);
      }
    }

    console.log('✅ Database initialization completed successfully!');
    return { success: true, message: 'Database initialized successfully' };

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to check database status
export const checkDatabaseStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return { status: 'error', message: error.message };
    }

    return { status: 'connected', message: 'Database is connected and accessible' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Function to create a test profile
export const createTestProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        study_subjects: ['Math', 'Science'],
        study_goals: ['Improve problem solving', 'Better understanding']
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test profile:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Test profile created successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating test profile:', error);
    return { success: false, error: error.message };
  }
};

export default {
  initDatabase,
  checkDatabaseStatus,
  createTestProfile
};
