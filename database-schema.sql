-- Fresh Database Setup for StudyMate
-- Simple Users Table Schema for Testing Supabase Integration

-- =============================================================================
-- USERS TABLE SCHEMA
-- =============================================================================

-- Create a simple users table for testing CRUD operations
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for testing)
CREATE POLICY "Allow all operations on users for testing" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- =============================================================================
-- MOCK DATA INSERTION
-- =============================================================================

-- Insert sample users (only if table is empty)
INSERT INTO users (name, email, age, avatar_url, bio) 
SELECT * FROM (
  VALUES 
    ('Alice Johnson', 'alice@example.com', 28, 'https://i.pravatar.cc/150?img=1', 'Software developer passionate about React Native and mobile apps.'),
    ('Bob Smith', 'bob@example.com', 34, 'https://i.pravatar.cc/150?img=2', 'Full-stack engineer with 8 years of experience in web technologies.'),
    ('Carol Davis', 'carol@example.com', 26, 'https://i.pravatar.cc/150?img=3', 'UI/UX designer who loves creating beautiful and intuitive interfaces.'),
    ('David Wilson', 'david@example.com', 31, 'https://i.pravatar.cc/150?img=4', 'DevOps engineer specializing in cloud infrastructure and automation.'),
    ('Emma Brown', 'emma@example.com', 29, 'https://i.pravatar.cc/150?img=5', 'Product manager with a background in computer science and business.')
) AS v(name, email, age, avatar_url, bio)
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if table was created successfully
-- SELECT COUNT(*) as user_count FROM users;

-- View all users
-- SELECT id, name, email, age, is_active, created_at FROM users ORDER BY created_at;

-- Test update functionality
-- UPDATE users SET age = age + 1 WHERE email = 'alice@example.com';

-- Test delete functionality (uncomment to test)
-- DELETE FROM users WHERE email = 'test@delete.com';

-- =============================================================================
-- NOTES
-- =============================================================================

/*
To set up this schema in your Supabase project:

1. Copy this entire SQL script
2. Go to your Supabase Dashboard > SQL Editor
3. Paste the script and click "Run"

The script will:
- Create a users table with proper indexes
- Enable Row Level Security with permissive policies for testing
- Insert 5 mock users for testing CRUD operations
- Set up automatic updated_at timestamp updates

For production use, you should:
- Replace the permissive RLS policy with proper user-based policies
- Add additional validation constraints
- Consider adding foreign keys to other tables
- Implement proper authentication-based policies
*/