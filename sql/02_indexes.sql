-- ============================================================================
-- StudyMate Database Indexes
-- ============================================================================
-- This file creates indexes for better query performance
-- Run this after 01_schema.sql
-- ============================================================================

-- ============================================================================
-- PROFILES INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================================================
-- STUDY GROUPS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_public ON study_groups(is_public);

-- ============================================================================
-- GROUP MEMBERS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_user ON group_members(group_id, user_id);

-- ============================================================================
-- STUDY SESSIONS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject ON study_sessions(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time);

-- ============================================================================
-- FLASHCARD DECKS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_subject ON flashcard_decks(subject);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_public ON flashcard_decks(is_public);

-- ============================================================================
-- FLASHCARDS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty ON flashcards(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_flashcards_last_reviewed ON flashcards(last_reviewed);

-- ============================================================================
-- STUDY MATERIALS INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_study_materials_user ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON study_materials(subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_created_at ON study_materials(created_at);

-- ============================================================================
-- AI CONTENT INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_content_user ON ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_created_at ON ai_generated_content(created_at);

-- ============================================================================
-- GROUP MESSAGES INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_created ON group_messages(group_id, created_at);

-- ============================================================================
-- Indexes creation complete
-- ============================================================================
-- Next: Run 03_rls.sql to enable Row Level Security and create policies
-- ============================================================================

