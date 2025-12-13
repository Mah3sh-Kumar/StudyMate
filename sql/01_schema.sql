-- ============================================================================
-- StudyMate Database Schema
-- ============================================================================
-- This file creates all the database tables for StudyMate
-- Run this file first in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
-- User profiles linked to Supabase auth.users
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

-- ============================================================================
-- 2. STUDY GROUPS TABLE
-- ============================================================================
-- Study groups for collaborative learning
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

-- ============================================================================
-- 3. GROUP MEMBERS TABLE
-- ============================================================================
-- Members of study groups with roles
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================================================
-- 4. STUDY SESSIONS TABLE
-- ============================================================================
-- Track individual study sessions
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

-- ============================================================================
-- 5. FLASHCARD DECKS TABLE
-- ============================================================================
-- Collections of flashcards
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

-- ============================================================================
-- 6. FLASHCARDS TABLE
-- ============================================================================
-- Individual flashcard items
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

-- ============================================================================
-- 7. STUDY MATERIALS TABLE
-- ============================================================================
-- User-uploaded study materials and notes
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

-- ============================================================================
-- 8. AI GENERATED CONTENT TABLE
-- ============================================================================
-- Store AI-generated content (summaries, quizzes, flashcards, etc.)
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

-- ============================================================================
-- 9. GROUP MESSAGES TABLE
-- ============================================================================
-- Messages within study groups
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
-- Schema creation complete
-- ============================================================================
-- Next: Run 02_indexes.sql to create indexes for better performance
-- ============================================================================

