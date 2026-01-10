-- ============================================================================
-- StudyMate Complete Database Setup
-- ============================================================================
-- This file contains the complete database setup in one script
-- Run this file in Supabase SQL Editor to set up everything at once
-- ============================================================================
-- 
-- IMPORTANT: This script will:
-- 1. Create all database tables
-- 2. Create all indexes
-- 3. Enable Row Level Security
-- 4. Create all security policies
--
-- Run time: ~30 seconds
-- ============================================================================

-- ============================================================================
-- PART 1: SCHEMA CREATION
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
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

-- 2. STUDY GROUPS TABLE
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

-- 3. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. STUDY SESSIONS TABLE
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

-- 5. FLASHCARD DECKS TABLE
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

-- 6. FLASHCARDS TABLE
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

-- 7. STUDY MATERIALS TABLE
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

-- 8. AI GENERATED CONTENT TABLE
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

-- 9. GROUP MESSAGES TABLE
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

-- ============================================================================
-- PART 2: INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Study groups indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_public ON study_groups(is_public);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- Study sessions indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject ON study_sessions(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time);

-- Flashcard decks indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_subject ON flashcard_decks(subject);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_public ON flashcard_decks(is_public);

-- Flashcards indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty ON flashcards(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_flashcards_last_reviewed ON flashcards(last_reviewed);

-- Study materials indexes
CREATE INDEX IF NOT EXISTS idx_study_materials_user ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON study_materials(created_at);

-- AI content indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_user ON ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_created_at ON ai_generated_content(created_at);

-- Group messages indexes
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages(group_id, created_at);

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: SECURITY POLICIES
-- ============================================================================
-- Note: Policies are dropped first to avoid conflicts if re-running the script

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles of group members" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public profile info" ON profiles;

DROP POLICY IF EXISTS "Anyone can view public groups" ON study_groups;
DROP POLICY IF EXISTS "Users can view groups they're members of" ON study_groups;
DROP POLICY IF EXISTS "Users can create groups" ON study_groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON study_groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON study_groups;

DROP POLICY IF EXISTS "Members can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

DROP POLICY IF EXISTS "Users can view own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON study_sessions;

DROP POLICY IF EXISTS "Users can view own decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Users can view public decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Users can create own decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Users can update own decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Users can delete own decks" ON flashcard_decks;

DROP POLICY IF EXISTS "Users can view cards in their decks" ON flashcards;
DROP POLICY IF EXISTS "Users can view cards in public decks" ON flashcards;
DROP POLICY IF EXISTS "Users can create cards in their decks" ON flashcards;
DROP POLICY IF EXISTS "Users can update cards in their decks" ON flashcards;
DROP POLICY IF EXISTS "Users can delete cards in their decks" ON flashcards;

DROP POLICY IF EXISTS "Users can view own materials" ON study_materials;
DROP POLICY IF EXISTS "Users can create own materials" ON study_materials;
DROP POLICY IF EXISTS "Users can update own materials" ON study_materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON study_materials;

DROP POLICY IF EXISTS "Users can view own AI content" ON ai_generated_content;
DROP POLICY IF EXISTS "Users can create own AI content" ON ai_generated_content;
DROP POLICY IF EXISTS "Users can delete own AI content" ON ai_generated_content;

DROP POLICY IF EXISTS "Members can view group messages" ON group_messages;
DROP POLICY IF EXISTS "Members can send group messages" ON group_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON group_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON group_messages;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Study groups policies
CREATE POLICY "Anyone can view public groups" 
  ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view groups they're members of" 
  ON study_groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create groups" 
  ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" 
  ON study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Group creators can delete their groups" 
  ON study_groups FOR DELETE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Members can view group members" 
  ON group_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
  );
CREATE POLICY "Users can join public groups" 
  ON group_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_groups WHERE id = group_members.group_id AND is_public = true)
  );
CREATE POLICY "Users can leave groups" 
  ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" 
  ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" 
  ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" 
  ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" 
  ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Flashcard decks policies
CREATE POLICY "Users can view own decks" 
  ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public decks" 
  ON flashcard_decks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own decks" 
  ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" 
  ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" 
  ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view cards in their decks" 
  ON flashcards FOR SELECT USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can view cards in public decks" 
  ON flashcards FOR SELECT USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND is_public = true)
  );
CREATE POLICY "Users can create cards in their decks" 
  ON flashcards FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update cards in their decks" 
  ON flashcards FOR UPDATE USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete cards in their decks" 
  ON flashcards FOR DELETE USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );

-- Study materials policies
CREATE POLICY "Users can view own materials" 
  ON study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own materials" 
  ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" 
  ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" 
  ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- AI content policies
CREATE POLICY "Users can view own AI content" 
  ON ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own AI content" 
  ON ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI content" 
  ON ai_generated_content FOR DELETE USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages" 
  ON group_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );
CREATE POLICY "Members can send group messages" 
  ON group_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update own messages" 
  ON group_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" 
  ON group_messages FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- PART 5: TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Drop existing triggers first (safe to re-run)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_study_groups_updated_at ON study_groups;
DROP TRIGGER IF EXISTS update_flashcard_decks_updated_at ON flashcard_decks;
DROP TRIGGER IF EXISTS update_flashcards_updated_at ON flashcards;
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON study_materials;
DROP TRIGGER IF EXISTS update_group_messages_updated_at ON group_messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at 
  BEFORE UPDATE ON study_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_decks_updated_at 
  BEFORE UPDATE ON flashcard_decks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at 
  BEFORE UPDATE ON flashcards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at 
  BEFORE UPDATE ON study_materials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at 
  BEFORE UPDATE ON group_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- PART 6: CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- Drop existing constraints first (safe to re-run)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE study_groups DROP CONSTRAINT IF EXISTS max_members_positive;
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS difficulty_range;
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS valid_duration;

-- Username validation: must be 3-30 characters, alphanumeric and underscores only
ALTER TABLE profiles 
  ADD CONSTRAINT username_length 
  CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30));

ALTER TABLE profiles 
  ADD CONSTRAINT username_format 
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$');

-- Study group member limit validation
ALTER TABLE study_groups 
  ADD CONSTRAINT max_members_positive 
  CHECK (max_members > 0 AND max_members <= 500);

-- Flashcard difficulty validation
ALTER TABLE flashcards 
  ADD CONSTRAINT difficulty_range 
  CHECK (difficulty_level >= 1 AND difficulty_level <= 5);

-- Study session duration validation
ALTER TABLE study_sessions 
  ADD CONSTRAINT valid_duration 
  CHECK (duration_minutes IS NULL OR duration_minutes >= 0);

-- ============================================================================
-- PART 7: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for group messages and members (for live chat/updates)
-- Note: Wrapped in DO block to handle errors if tables are already in publication
DO $$
BEGIN
  -- Try to add tables to realtime publication
  -- If they're already added, the exception handler will catch it
  ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication, ignore
  WHEN undefined_object THEN
    NULL; -- Publication doesn't exist, ignore
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication, ignore
  WHEN undefined_object THEN
    NULL; -- Publication doesn't exist, ignore
END $$;

-- ============================================================================
-- PART 8: ADDITIONAL SECURITY POLICIES
-- ============================================================================

-- Allow users to view profiles of other group members (for social features)
CREATE POLICY "Users can view profiles of group members" 
  ON profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.id
    )
  );

-- Allow users to view public profiles (for discovery)
CREATE POLICY "Anyone can view public profile info" 
  ON profiles FOR SELECT USING (true);








-- ============================================================================
-- SUMMARY: View All Created Objects
-- ============================================================================

-- Function to display summary of all database objects
CREATE OR REPLACE FUNCTION public.show_database_summary()
RETURNS TABLE (
  object_type TEXT,
  object_name TEXT,
  details TEXT
) AS $$
BEGIN
  RETURN QUERY
  
  -- Tables
  SELECT 
    'TABLE'::TEXT AS object_type,
    pt.tablename::TEXT AS object_name,
    ('Rows: ' || COALESCE(pst.n_live_tup::TEXT, '0'))::TEXT AS details
  FROM pg_tables pt
  LEFT JOIN pg_stat_user_tables pst ON pt.tablename = pst.relname AND pt.schemaname = pst.schemaname
  WHERE pt.schemaname = 'public'
    AND pt.tablename IN (
      'profiles', 'study_groups', 'group_members', 'study_sessions',
      'flashcard_decks', 'flashcards', 'study_materials', 
      'ai_generated_content', 'group_messages'
    )
  
  UNION ALL
  
  -- Indexes
  SELECT 
    'INDEX'::TEXT AS object_type,
    indexname::TEXT AS object_name,
    ('On: ' || tablename)::TEXT AS details
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
  
  UNION ALL
  
  -- Policies
  SELECT 
    'POLICY'::TEXT AS object_type,
    policyname::TEXT AS object_name,
    ('On: ' || tablename)::TEXT AS details
  FROM pg_policies
  WHERE schemaname = 'public'
  
  UNION ALL
  
  -- Triggers
  SELECT 
    'TRIGGER'::TEXT AS object_type,
    trigger_name::TEXT AS object_name,
    ('On: ' || event_object_table)::TEXT AS details
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  
  UNION ALL
  
  -- Functions
  SELECT 
    'FUNCTION'::TEXT AS object_type,
    proname::TEXT AS object_name,
    ('Returns: ' || pg_get_function_result(oid))::TEXT AS details
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('update_updated_at_column', 'handle_new_user', 'show_database_summary')
  
  UNION ALL
  
  -- Constraints
  SELECT 
    'CONSTRAINT'::TEXT AS object_type,
    conname::TEXT AS object_name,
    ('On: ' || conrelid::regclass::TEXT)::TEXT AS details
  FROM pg_constraint
  WHERE connamespace = 'public'::regnamespace
    AND contype = 'c'
    AND conname IN (
      'username_length', 'username_format', 'max_members_positive',
      'difficulty_range', 'valid_duration'
    )
  
  ORDER BY 1, 2;
END;
$$ LANGUAGE plpgsql;

-- Display the summary
SELECT * FROM public.show_database_summary();

-- ============================================================================
-- Quick Stats
-- ============================================================================
SELECT 
  '📊 DATABASE SETUP SUMMARY' AS info,
  '' AS value
UNION ALL
SELECT '─────────────────────────────', '─────────────────'
UNION ALL
SELECT '📁 Tables Created:', COUNT(*)::TEXT
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'study_groups', 'group_members', 'study_sessions',
                    'flashcard_decks', 'flashcards', 'study_materials', 
                    'ai_generated_content', 'group_messages')
UNION ALL
SELECT '🔍 Indexes Created:', COUNT(*)::TEXT
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
UNION ALL
SELECT '🔒 Policies Created:', COUNT(*)::TEXT
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT '⚡ Triggers Created:', COUNT(*)::TEXT
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
UNION ALL
SELECT '🛠️ Functions Created:', COUNT(*)::TEXT
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('update_updated_at_column', 'handle_new_user', 'show_database_summary')
UNION ALL
SELECT '✅ Constraints Created:', COUNT(*)::TEXT
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace AND contype = 'c'
  AND conname IN ('username_length', 'username_format', 'max_members_positive',
                  'difficulty_range', 'valid_duration')
UNION ALL
SELECT '─────────────────────────────', '─────────────────'
UNION ALL
SELECT '🎉 Status:', 'SETUP COMPLETE!';

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

