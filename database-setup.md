# 🗄️ StudyMate Database Setup Guide

## 🎯 **Recommended Free Database: Supabase**

### **Why Supabase?**
- **100% Free Tier**: 500MB database, 50MB file storage, 2GB bandwidth/month
- **Real-time Features**: Perfect for study groups and live collaboration
- **Built-in Auth**: User authentication and authorization
- **Auto-generated APIs**: REST and GraphQL APIs automatically created
- **PostgreSQL**: Enterprise-grade database with full SQL support
- **Easy Setup**: Simple dashboard and excellent documentation

## 🚀 **Quick Setup (5 minutes)**

### 1. **Create Supabase Account**
- Go to [supabase.com](https://supabase.com)
- Click "Start your project"
- Sign up with GitHub or email
- Create a new organization

### 2. **Create New Project**
- Click "New Project"
- Choose organization
- Enter project name: `studymate-db`
- Enter database password (save this!)
- Choose region closest to you
- Click "Create new project"

### 3. **Get Your Credentials**
- Go to Settings → API
- Copy your `Project URL` and `anon public` key
- Save these for later

## 📊 **Complete Database Schema**

### **Run This SQL in Supabase SQL Editor**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
-- User profiles linked to Supabase auth.users
CREATE TABLE profiles (
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

-- 2. Study Groups Table
CREATE TABLE study_groups (
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

-- 3. Group Members Table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 4. Study Sessions Table
CREATE TABLE study_sessions (
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

-- 5. Flashcard Decks Table
CREATE TABLE flashcard_decks (
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

-- 6. Flashcards Table
CREATE TABLE flashcards (
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

-- 7. Study Materials Table
CREATE TABLE study_materials (
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

-- 8. AI Generated Content Table
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  original_text TEXT,
  generated_content JSONB,
  ai_model VARCHAR(100),
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Group Messages Table
CREATE TABLE group_messages (
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
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_study_groups_subject ON study_groups(subject);
CREATE INDEX idx_study_sessions_user_subject ON study_sessions(user_id, subject);
CREATE INDEX idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX idx_group_messages_group ON group_messages(group_id);
```

## 🔐 **Row Level Security (RLS) Setup**

### **Enable RLS on all tables**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
```

### **Create RLS Policies**

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Study groups policies
CREATE POLICY "Anyone can view public groups" ON study_groups
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view groups they're members of" ON study_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = study_groups.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (
    group_members.group_id IN (
      SELECT gm_check.group_id 
      FROM group_members gm_check 
      WHERE gm_check.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_groups 
      WHERE id = group_members.group_id 
      AND is_public = true
    )
  );

-- Study sessions policies
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Flashcard policies
CREATE POLICY "Users can view own decks" ON flashcard_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public decks" ON flashcard_decks
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own decks" ON flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view cards in their decks" ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view cards in public decks" ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND is_public = true
    )
  );

-- Study materials policies
CREATE POLICY "Users can view own materials" ON study_materials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own materials" ON study_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI content policies
CREATE POLICY "Users can view own AI content" ON ai_generated_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI content" ON ai_generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages" ON group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send group messages" ON group_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );
```

## ⚙️ **React Native Client Setup**

### **Install Dependencies**

```bash
pnpm add @supabase/supabase-js
pnpm add react-native-url-polyfill
```

### **Create Database Client**

Create `lib/supabase.js`:

```javascript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export const auth = supabase.auth;
export const db = supabase.from;
```

### **Update Configuration**

Add to `config/api-config.js`:

```javascript
export const API_CONFIG = {
  // ... existing OpenAI config
  
  // Database Configuration
  DATABASE: {
    SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    ENABLE_REALTIME: true,
    ENABLE_AUTH: true
  },
  
  // ... rest of config
};
```

## 🔐 **Authentication Setup**

### **Enable Auth Providers in Supabase**

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates
4. Set up password requirements

### **Create Auth Functions**

```javascript
// lib/auth.js
import { auth } from './supabase';

export const signUp = async (email, password, userData) => {
  const { data, error } = await auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await auth.signOut();
  return { error };
};

export const resetPassword = async (email) => {
  const { data, error } = await auth.resetPasswordForEmail(email);
  return { data, error };
};
```

## 📱 **Integration with StudyMate**

### **Update API Functions**

Modify `api/api.js` to use database:

```javascript
import { supabase } from '../lib/supabase';

// Example: Save AI-generated content
export const saveAIContent = async (contentType, originalText, generatedContent) => {
  const { data, error } = await supabase
    .from('ai_generated_content')
    .insert({
      content_type: contentType,
      original_text: originalText,
      generated_content: generatedContent,
      ai_model: 'gpt-3.5-turbo'
    });
  
  return { data, error };
};

// Example: Get user's study sessions
export const getUserStudySessions = async (userId) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};
```

## 🚨 **Common Issues & Solutions**

### **"RLS Policy Violation"**
- Check if user is authenticated
- Verify RLS policies are correct
- Ensure user has proper permissions

### **"Connection Failed"**
- Verify Supabase URL and key
- Check internet connection
- Ensure project is not paused

### **"Auth Error"**
- Check email verification settings
- Verify password requirements
- Check auth provider configuration

## 📊 **Database Monitoring**

### **Supabase Dashboard Features**
- **Real-time logs**: Monitor all database operations
- **Performance insights**: Query performance analysis
- **Storage usage**: Track database and file storage
- **API usage**: Monitor API calls and limits

### **Set Up Alerts**
- Go to Settings → Alerts
- Set up notifications for:
  - High storage usage
  - API rate limit warnings
  - Failed authentication attempts

## 🔮 **Advanced Features**

### **Real-time Subscriptions**
```javascript
// Subscribe to group messages
const subscription = supabase
  .channel('group_messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'group_messages' },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

### **Database Functions**
```sql
-- Create function to get study statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_study_time BIGINT,
  favorite_subject TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sessions,
    COALESCE(SUM(duration_minutes), 0)::BIGINT as total_study_time,
    subject as favorite_subject
  FROM study_sessions 
  WHERE user_id = user_uuid
  GROUP BY subject
  ORDER BY COUNT(*) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 **Next Steps**

1. **Set up Supabase project** using this guide
2. **Run the SQL schema** in Supabase SQL editor
3. **Configure RLS policies** for security
4. **Update your app** to use Supabase client
5. **Test authentication** and database operations
6. **Implement real-time features** for study groups

## 💰 **Cost Breakdown**

### **Free Tier (Supabase)**
- **Database**: 500MB (enough for 10,000+ users)
- **File Storage**: 50MB
- **Bandwidth**: 2GB/month
- **Auth**: Unlimited users
- **Real-time**: Unlimited connections

### **Paid Plans (if needed)**
- **Pro**: $25/month - 8GB database, 100GB storage
- **Team**: $599/month - 100GB database, 1TB storage

---

**Your StudyMate database is ready! 🚀**
