-- ============================================================================
-- StudyMate Database Hotfix for User Registration
-- This fixes the user registration issue by updating the trigger function
-- ============================================================================

-- Update the handle_new_user function to handle username from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Also add a policy to allow the system to insert profiles during signup
-- This ensures the trigger can create profiles even with RLS enabled
CREATE POLICY "System can create profiles during signup" ON profiles 
FOR INSERT WITH CHECK (true);

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();