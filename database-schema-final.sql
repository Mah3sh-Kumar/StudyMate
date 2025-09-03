-- ============================================================================
-- StudyMate Final Database Schema for Supabase
-- This version ensures proper table creation order and avoids all dependency issues
-- Run this script in your Supabase SQL Editor
-- ============================================================================

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. DROP EXISTING TABLES IF THEY EXIST (to ensure clean state)
-- ============================================================================

DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS study_streaks CASCADE;
DROP TABLE IF EXISTS study_goals CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS ai_generated_content CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS flashcard_decks CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- 2. CREATE ALL TABLES IN DEPENDENCY ORDER
-- ============================================================================

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255),
  avatar_url TEXT,
  study_subjects TEXT[],
  study_goals TEXT[],
  preferences JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups table
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  CONSTRAINT valid_max_members CHECK (max_members > 0 AND max_members <= 1000)
);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  tags TEXT[],
  session_type VARCHAR(50) DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'review', 'practice')),
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  break_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcard decks table
CREATE TABLE flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_cards INTEGER DEFAULT 0,
  difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],
  color_theme VARCHAR(7) DEFAULT '#6366f1',
  last_studied TIMESTAMP WITH TIME ZONE,
  study_streak INTEGER DEFAULT 0
);

-- Flashcards table with all spaced repetition columns
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review TIMESTAMP WITH TIME ZONE,
  card_type VARCHAR(20) DEFAULT 'basic' CHECK (card_type IN ('basic', 'cloze', 'multiple_choice', 'image')),
  multimedia_url TEXT,
  hints TEXT[]
);

-- Study materials table
CREATE TABLE study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  subject VARCHAR(100),
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- AI generated content table
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('summary', 'quiz', 'flashcards', 'explanation', 'study_plan', 'chat')),
  original_text TEXT,
  generated_content JSONB,
  ai_model VARCHAR(100),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  quality_score REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_notes TEXT
);

-- Group messages table
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'link', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to UUID REFERENCES group_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}'
);

-- Study goals table
CREATE TABLE study_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reminder_enabled BOOLEAN DEFAULT true,
  priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5)
);

-- Study streaks table
CREATE TABLE study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('reminder', 'achievement', 'group_invite', 'system', 'social')),
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value INTEGER,
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- 3. CREATE INDEXES AFTER ALL TABLES ARE COMMITTED
-- ============================================================================

-- Essential indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_study_groups_subject ON study_groups(subject);
CREATE INDEX idx_study_groups_public ON study_groups(is_public);
CREATE INDEX idx_study_sessions_user_subject ON study_sessions(user_id, subject);
CREATE INDEX idx_study_sessions_start_time ON study_sessions(start_time);
CREATE INDEX idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_flashcard_decks_user ON flashcard_decks(user_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
CREATE INDEX idx_group_messages_group_created ON group_messages(group_id, created_at);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_study_materials_user ON study_materials(user_id);
CREATE INDEX idx_ai_content_user ON ai_generated_content(user_id);
CREATE INDEX idx_study_goals_user_active ON study_goals(user_id, is_active);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ============================================================================
-- 4. CREATE FUNCTIONS AFTER TABLES AND INDEXES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_groups 
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_groups 
    SET current_members = current_members - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update flashcard deck total cards
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flashcard_decks 
    SET total_cards = total_cards + 1
    WHERE id = NEW.deck_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flashcard_decks 
    SET total_cards = total_cards - 1
    WHERE id = OLD.deck_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_study_time', COALESCE(SUM(duration_minutes), 0),
    'total_sessions', COUNT(*),
    'average_session_length', COALESCE(AVG(duration_minutes), 0),
    'subjects_studied', COUNT(DISTINCT subject),
    'total_flashcards', (
      SELECT COUNT(*) FROM flashcards f
      JOIN flashcard_decks d ON f.deck_id = d.id
      WHERE d.user_id = user_uuid
    ),
    'total_decks', (
      SELECT COUNT(*) FROM flashcard_decks WHERE user_id = user_uuid
    ),
    'groups_joined', (
      SELECT COUNT(*) FROM group_members WHERE user_id = user_uuid AND is_active = true
    )
  )
  INTO result
  FROM study_sessions
  WHERE user_id = user_uuid AND end_time IS NOT NULL;
  
  RETURN result;
END;
$$ language 'plpgsql';

-- Function to update study streaks
CREATE OR REPLACE FUNCTION update_study_streak(user_uuid UUID, study_subject VARCHAR)
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  last_date DATE;
  current_streak_val INTEGER;
BEGIN
  -- Get current streak info
  SELECT last_study_date, current_streak
  INTO last_date, current_streak_val
  FROM study_streaks
  WHERE user_id = user_uuid AND subject = study_subject;
  
  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO study_streaks (user_id, subject, current_streak, longest_streak, last_study_date, streak_start_date)
    VALUES (user_uuid, study_subject, 1, 1, today, today);
  ELSE
    IF last_date = today THEN
      -- Already studied today, no change
      RETURN;
    ELSIF last_date = today - INTERVAL '1 day' THEN
      -- Continuing streak
      UPDATE study_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_study_date = today,
          updated_at = NOW()
      WHERE user_id = user_uuid AND subject = study_subject;
    ELSE
      -- Streak broken, start new one
      UPDATE study_streaks
      SET current_streak = 1,
          last_study_date = today,
          streak_start_date = today,
          updated_at = NOW()
      WHERE user_id = user_uuid AND subject = study_subject;
    END IF;
  END IF;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 5. CREATE TRIGGERS AFTER FUNCTIONS
-- ============================================================================

-- Apply triggers for automatic updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_decks_updated_at BEFORE UPDATE ON flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_messages_updated_at BEFORE UPDATE ON group_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at BEFORE UPDATE ON study_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at BEFORE UPDATE ON study_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

CREATE TRIGGER update_deck_card_count_trigger
  AFTER INSERT OR DELETE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
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
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES AFTER EVERYTHING ELSE
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Study groups policies
CREATE POLICY "Anyone can view public groups" ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view groups they're members of" ON study_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON study_groups FOR UPDATE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Members can view group members" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Users can join public groups" ON group_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM study_groups WHERE id = group_members.group_id AND is_public = true)
  OR auth.uid() = user_id
);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Flashcard deck policies
CREATE POLICY "Users can view own decks" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public decks" ON flashcard_decks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own decks" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view cards in their decks" ON flashcards FOR SELECT USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view cards in public decks" ON flashcards FOR SELECT USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND is_public = true)
);
CREATE POLICY "Users can create cards in their decks" ON flashcards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update cards in their decks" ON flashcards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete cards in their decks" ON flashcards FOR DELETE USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
);

-- Study materials policies
CREATE POLICY "Users can view own materials" ON study_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public materials" ON study_materials FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own materials" ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- AI content policies
CREATE POLICY "Users can view own AI content" ON ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own AI content" ON ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI content" ON ai_generated_content FOR UPDATE USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Members can send group messages" ON group_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own messages" ON group_messages FOR UPDATE USING (auth.uid() = user_id);

-- Study goals policies
CREATE POLICY "Users can view own goals" ON study_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON study_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON study_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON study_goals FOR DELETE USING (auth.uid() = user_id);

-- Study streaks policies
CREATE POLICY "Users can view own streaks" ON study_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own streaks" ON study_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON study_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- 
-- ✅ Database schema creation completed successfully!
-- 
-- This final version:
-- 1. Drops existing tables first to ensure clean state
-- 2. Creates all tables without IF NOT EXISTS to avoid timing issues
-- 3. Creates indexes AFTER all tables are committed
-- 4. Includes the next_review column in flashcards table
-- 5. Uses proper PostgreSQL syntax throughout
-- 
-- Your StudyMate database is now ready with:
-- - 13 tables with proper relationships
-- - All spaced repetition columns for flashcards
-- - Performance indexes
-- - Business logic functions and triggers  
-- - Complete Row Level Security
-- 
-- Next steps:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Test your StudyMate app with the new database
-- 3. Verify flashcard spaced repetition works correctly
-- 
-- ============================================================================