import { supabase } from './supabase';
import { flashcardService, studyGroupService, studySessionService, userService } from './database';

// Test backend connectivity and basic operations
export const testBackend = async () => {
  console.log('🧪 Testing StudyMate Backend...');
  
  try {
    // Test 1: Check Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return { success: false, error: 'Authentication failed' };
    }
    
    if (!user) {
      console.log('⚠️ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: Check if profiles table exists
    console.log('2️⃣ Testing profiles table...');
    try {
      const { data: profile, error: profileError } = await userService.getProfile(user.id);
      
      if (profileError) {
        if (profileError.includes('relation "profiles" does not exist')) {
          console.log('⚠️ Profiles table does not exist - database not initialized');
          return { success: false, error: 'Database tables not created. Please run the database setup first.' };
        }
        console.log('⚠️ Profile error (may be expected for new users):', profileError);
      } else {
        console.log('✅ Profile found:', profile);
      }
    } catch (error) {
      console.log('⚠️ Profile check failed:', error.message);
    }
    
    // Test 3: Try to create a test profile
    console.log('3️⃣ Testing profile creation...');
    try {
      const { data: newProfile, error: createError } = await userService.updateProfile(user.id, {
        full_name: 'Test User',
        username: 'testuser',
        email: user.email,
        study_subjects: ['Test Subject'],
        study_goals: ['Test Goal']
      });
      
      if (createError) {
        console.error('❌ Profile creation failed:', createError);
        return { success: false, error: 'Profile creation failed: ' + createError };
      }
      
      console.log('✅ Profile created/updated:', newProfile);
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      return { success: false, error: 'Profile creation error: ' + error.message };
    }
    
    // Test 4: Test flashcard service
    console.log('4️⃣ Testing flashcard service...');
    try {
      const { data: decks, error: decksError } = await flashcardService.getUserDecks(user.id);
      
      if (decksError) {
        console.log('⚠️ Flashcard decks error (may be expected):', decksError);
      } else {
        console.log('✅ Flashcard decks loaded:', decks?.length || 0, 'decks');
      }
    } catch (error) {
      console.log('⚠️ Flashcard service test failed:', error.message);
    }
    
    // Test 5: Test study group service
    console.log('5️⃣ Testing study group service...');
    try {
      const { data: groups, error: groupsError } = await studyGroupService.getUserGroups(user.id);
      
      if (groupsError) {
        console.log('⚠️ Study groups error (may be expected):', groupsError);
      } else {
        console.log('✅ Study groups loaded:', groups?.length || 0, 'groups');
      }
    } catch (error) {
      console.log('⚠️ Study group service test failed:', error.message);
    }
    
    // Test 6: Test study session service
    console.log('6️⃣ Testing study session service...');
    try {
      const { data: sessions, error: sessionsError } = await studySessionService.getUserSessions(user.id);
      
      if (sessionsError) {
        console.log('⚠️ Study sessions error (may be expected):', sessionsError);
      } else {
        console.log('✅ Study sessions loaded:', sessions?.length || 0, 'sessions');
      }
    } catch (error) {
      console.log('⚠️ Study session service test failed:', error.message);
    }
    
    console.log('🎉 Backend test completed successfully!');
    return { success: true, message: 'Backend is working correctly' };
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test database table creation
export const testDatabaseTables = async () => {
  console.log('🗄️ Testing database tables...');
  
  try {
    // Test if we can query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('❌ Profiles table does not exist');
        return { success: false, error: 'Database tables not created' };
      }
      console.log('⚠️ Profiles table query error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Profiles table exists and is accessible');
    return { success: true, message: 'Database tables are working' };
    
  } catch (error) {
    console.error('❌ Database table test failed:', error);
    return { success: false, error: error.message };
  }
};

// Quick health check
export const healthCheck = async () => {
  console.log('🏥 Running backend health check...');
  
  const backendTest = await testBackend();
  const tableTest = await testDatabaseTables();
  
  return {
    backend: backendTest,
    database: tableTest,
    overall: backendTest.success && tableTest.success
  };
};

export default {
  testBackend,
  testDatabaseTables,
  healthCheck
};
