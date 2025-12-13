-- ============================================================================
-- StudyMate Row Level Security (RLS) Policies
-- ============================================================================
-- This file enables RLS and creates security policies for all tables
-- Run this after 01_schema.sql and 02_indexes.sql
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
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
-- PROFILES POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STUDY GROUPS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Anyone can view public groups" 
  ON study_groups FOR SELECT 
  USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Users can view groups they're members of" 
  ON study_groups FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = study_groups.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create groups" 
  ON study_groups FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- GROUP MEMBERS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Members can view group members" 
  ON group_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can join public groups" 
  ON group_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_groups 
      WHERE id = group_members.group_id 
      AND is_public = true
    )
  );

CREATE POLICY IF NOT EXISTS "Users can leave groups" 
  ON group_members FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- STUDY SESSIONS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view own sessions" 
  ON study_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own sessions" 
  ON study_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own sessions" 
  ON study_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- FLASHCARD DECKS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view own decks" 
  ON flashcard_decks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view public decks" 
  ON flashcard_decks FOR SELECT 
  USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Users can create own decks" 
  ON flashcard_decks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own decks" 
  ON flashcard_decks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own decks" 
  ON flashcard_decks FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- FLASHCARDS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view cards in their decks" 
  ON flashcards FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view cards in public decks" 
  ON flashcards FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND is_public = true
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create cards in their decks" 
  ON flashcards FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update cards in their decks" 
  ON flashcards FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can delete cards in their decks" 
  ON flashcards FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- STUDY MATERIALS POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view own materials" 
  ON study_materials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own materials" 
  ON study_materials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own materials" 
  ON study_materials FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own materials" 
  ON study_materials FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- AI GENERATED CONTENT POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Users can view own AI content" 
  ON ai_generated_content FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own AI content" 
  ON ai_generated_content FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GROUP MESSAGES POLICIES
-- ============================================================================
CREATE POLICY IF NOT EXISTS "Members can view group messages" 
  ON group_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Members can send group messages" 
  ON group_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS policies creation complete
-- ============================================================================
-- Your database is now fully secured with Row Level Security!
-- ============================================================================

