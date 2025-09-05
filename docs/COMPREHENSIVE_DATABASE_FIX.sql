-- ============================================================================
-- COMPREHENSIVE DATABASE DIAGNOSIS AND FIX
-- Run this in your Supabase SQL Editor to diagnose and fix all issues
-- ============================================================================

-- Step 1: Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'ERROR: profiles table does not exist! Creating it now...';
        
        -- Create profiles table
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE,
            full_name TEXT,
            username TEXT UNIQUE,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE 'profiles table created successfully';
    ELSE
        RAISE NOTICE 'profiles table exists';
    END IF;
END
$$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "System can create profiles during signup" ON profiles;

-- Step 4: Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- CRITICAL: System policy for automatic profile creation
CREATE POLICY "System can create profiles during signup" ON profiles 
    FOR INSERT WITH CHECK (true);

-- Step 5: Create or replace the trigger function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        INSERT INTO profiles (id, email, full_name, username, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'username', ''),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
            username = COALESCE(EXCLUDED.username, profiles.username),
            updated_at = NOW();
        
        RAISE NOTICE 'Profile created/updated for user: %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Don't fail the entire signup process
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Step 8: Test the setup
DO $$
DECLARE
    test_result TEXT;
BEGIN
    -- Test if we can query the profiles table
    PERFORM COUNT(*) FROM profiles;
    RAISE NOTICE 'SUCCESS: profiles table is accessible';
    
    -- Check RLS status
    SELECT CASE WHEN c.relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END
    INTO test_result
    FROM pg_class c
    WHERE c.relname = 'profiles';
    
    RAISE NOTICE 'RLS Status: %', test_result;
    
    -- Check policies
    PERFORM COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
    GET DIAGNOSTICS test_result = ROW_COUNT;
    RAISE NOTICE 'Number of RLS policies: %', test_result;
    
    RAISE NOTICE 'Database setup verification complete!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR during verification: %', SQLERRM;
END
$$;