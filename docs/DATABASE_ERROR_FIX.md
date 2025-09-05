# Database Error Fix Guide

## Issue: Database error saving new user

### Problem Description
The issue occurs when creating new user accounts. The authentication works but profile creation fails due to conflicts between the database trigger and manual profile insertion.

### Root Cause
1. **Database Trigger Conflict**: The `handle_new_user()` trigger automatically creates a profile when a user signs up, but it only includes basic fields (id, email, full_name from metadata).
2. **Missing Username**: The trigger doesn't handle the `username` field properly.
3. **RLS Policy Issues**: Row Level Security policies might prevent profile creation in some scenarios.

### Solution Steps

#### Step 1: Apply Database Hotfix
Run the SQL commands in `database-hotfix.sql` in your Supabase SQL Editor:

```sql
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

-- Add policy to allow system to insert profiles during signup
CREATE POLICY "System can create profiles during signup" ON profiles 
FOR INSERT WITH CHECK (true);

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### Step 2: Test the Fix
1. Try creating a new user account
2. Check the browser console for any error messages
3. Verify that the profile is created in the `profiles` table

#### Step 3: Use Database Diagnostic Tool (Optional)
For advanced debugging, you can use the database diagnostic tool:

```javascript
import DatabaseDiagnostic from './lib/databaseDiagnostic';

// Run diagnostic
const results = await DatabaseDiagnostic.runDiagnostic();
console.log('Diagnostic Results:', results);
```

### Files Modified
- ✅ `contexts/AuthContext.js` - Updated signup process to use UPSERT and handle errors
- ✅ `database-hotfix.sql` - Database fix for trigger function
- ✅ `lib/databaseDiagnostic.js` - Diagnostic and repair utilities
- ✅ `DATABASE_ERROR_FIX.md` - This documentation

### Verification
After applying the fix:
1. ✅ User signup should work without errors
2. ✅ Profile should be created with all fields (full_name, username, email)
3. ✅ No duplicate profile insertion errors
4. ✅ Proper error handling and recovery

### Alternative Solutions
If the trigger approach doesn't work:
1. **Disable the trigger** and rely on manual profile creation
2. **Use Supabase Edge Functions** for profile creation
3. **Implement client-side retry logic** with exponential backoff

### Prevention
To prevent similar issues in the future:
1. Always test database triggers with complete metadata
2. Use UPSERT instead of INSERT for profile operations
3. Implement proper error handling and fallback mechanisms
4. Add diagnostic tools for easier troubleshooting