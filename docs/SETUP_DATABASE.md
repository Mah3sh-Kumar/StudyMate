# 🗄️ **StudyMate Database Setup Guide**

## 🚨 **IMPORTANT: You need to create database tables first!**

Your backend services are ready, but the database tables don't exist yet. Follow these steps:

## 📋 **Step 1: Go to Your Supabase Dashboard**

1. Open [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your StudyMate project
4. Go to **SQL Editor** in the left sidebar

## 📝 **Step 2: Run This SQL Script**

Copy and paste this entire script into the SQL Editor, then click **Run**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create profiles table
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

-- 2. Create study_groups table
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

-- 3. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. Create study_sessions table
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

-- 5. Create flashcard_decks table
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

-- 6. Create flashcards table
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

-- 7. Create study_materials table
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

-- 8. Create ai_generated_content table
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

-- 9. Create group_messages table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject ON study_sessions(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_user ON study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_user ON ai_generated_content(user_id);
```

## 🔒 **Step 3: Enable Row Level Security (RLS)**

After creating the tables, run this script to enable security:

```sql
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
```

## 🛡️ **Step 4: Create Security Policies**

Finally, run this script to create the security policies:

```sql
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

-- Group members policies
CREATE POLICY "Members can view group members" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Users can join public groups" ON group_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM study_groups WHERE id = group_members.group_id AND is_public = true)
);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Flashcard policies
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
CREATE POLICY "Users can create own materials" ON study_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON study_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON study_materials FOR DELETE USING (auth.uid() = user_id);

-- AI content policies
CREATE POLICY "Users can view own AI content" ON ai_generated_content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own AI content" ON ai_generated_content FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Members can send group messages" ON group_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
```

## ✅ **Step 5: Test Your Setup**

After running all the scripts:

1. **Go back to your StudyMate app**
2. **Try to create a flashcard** - it should now save to the database
3. **Try to create a study group** - it should now save to the database
4. **Try to start a study session** - it should now save to the database

## 🚨 **Common Issues & Solutions**

### **"relation does not exist" error**
- Make sure you ran the table creation scripts first
- Check that you're in the correct Supabase project

### **"permission denied" error**
- Make sure you ran the RLS policies scripts
- Check that you're signed in to your app

### **"auth.uid() is null" error**
- Make sure you're authenticated in your app
- Check that the user is logged in before trying database operations

## 🎯 **What This Will Fix**

✅ **Flashcards**: Will now save to database and persist between app sessions  
✅ **Study Groups**: Will now create real groups and manage memberships  
✅ **Study Sessions**: Will now track real study time and save progress  
✅ **User Profiles**: Will now save user preferences and study goals  
✅ **AI Content**: Will now save AI-generated content for later reference  

## 🚀 **After Setup**

Once the database is working:
1. **All your data will be saved permanently**
2. **You can access your data from any device**
3. **Real-time updates will work for study groups**
4. **Your study progress will be tracked accurately**

---

**Run these scripts in order, and your StudyMate backend will be fully functional! 🎉**
