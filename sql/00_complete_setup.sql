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

-- Profiles policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Study groups policies
CREATE POLICY IF NOT EXISTS "Anyone can view public groups" 
  ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY IF NOT EXISTS "Users can view groups they're members of" 
  ON study_groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can create groups" 
  ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Group creators can update their groups" 
  ON study_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Group creators can delete their groups" 
  ON study_groups FOR DELETE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY IF NOT EXISTS "Members can view group members" 
  ON group_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can join public groups" 
  ON group_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM study_groups WHERE id = group_members.group_id AND is_public = true)
  );
CREATE POLICY IF NOT EXISTS "Users can leave groups" 
  ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY IF NOT EXISTS "Users can view own sessions" 
  ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create own sessions" 
  ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own sessions" 
  ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own sessions" 
  ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Flashcard decks policies
CREATE POLICY IF NOT EXISTS "Users can view own decks" 
  ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can view public decks" 
  ON flashcard_decks FOR SELECT USING (is_public = true);
CREATE POLICY IF NOT EXISTS "Users can create own decks" 
  ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own decks" 
  ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own decks" 
  ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY IF NOT EXISTS "Users can view cards in their decks" 
  ON flashcards FOR SELECT USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can view cards in public decks" 
  ON flashcards FOR SELECT USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND is_public = true)
  );
CREATE POLICY IF NOT EXISTS "Users can create cards in their decks" 
  ON flashcards FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can update cards in their decks" 
  ON flashcards FOR UPDATE USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can delete cards in their decks" 
  ON flashcards FOR DELETE USING (
    EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
  );

-- Study materials policies
CREATE POLICY IF NOT EXISTS "Users can view own materials" 
  ON study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create own materials" 
  ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own materials" 
  ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own materials" 
  ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- AI content policies
CREATE POLICY IF NOT EXISTS "Users can view own AI content" 
  ON ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create own AI content" 
  ON ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own AI content" 
  ON ai_generated_content FOR DELETE USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY IF NOT EXISTS "Members can view group messages" 
  ON group_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Members can send group messages" 
  ON group_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Users can update own messages" 
  ON group_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete own messages" 
  ON group_messages FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your StudyMate database is now fully configured with:
-- ✅ All tables created
-- ✅ All indexes created
-- ✅ Row Level Security enabled
-- ✅ All security policies created
--
-- You can now use your StudyMate app with full database functionality!
-- ============================================================================

