// ============================================================================
// DATABASE DEBUG SCRIPT - Run this in your browser console
// ============================================================================

console.log('🔍 Starting comprehensive database diagnosis...');

// Function to test database connectivity and user creation
async function diagnoseDatabaseIssue() {
    try {
        // Import necessary modules (you might need to adjust this based on your setup)
        const { supabase } = await import('./lib/supabase.js');
        
        console.log('📡 Testing Supabase connection...');
        
        // Test 1: Basic connection
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('❌ Session error:', sessionError);
        } else {
            console.log('✅ Session check passed');
        }
        
        // Test 2: Check if profiles table exists
        console.log('🗄️ Testing profiles table access...');
        const { data: profilesTest, error: profilesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
        if (profilesError) {
            console.error('❌ Profiles table error:', profilesError);
            if (profilesError.code === '42P01') {
                console.error('🚨 CRITICAL: profiles table does not exist!');
                console.log('📋 Please run COMPREHENSIVE_DATABASE_FIX.sql in your Supabase SQL Editor');
            }
        } else {
            console.log('✅ Profiles table accessible');
        }
        
        // Test 3: Test user creation with detailed logging
        console.log('👤 Testing user creation process...');
        
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        const testMetadata = {
            full_name: 'Test User',
            username: `testuser${Date.now()}`
        };
        
        console.log('📝 Creating test user with metadata:', testMetadata);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: testMetadata
            }
        });
        
        if (signupError) {
            console.error('❌ Signup error:', signupError);
            console.error('Error details:', {
                message: signupError.message,
                status: signupError.status,
                details: signupError
            });
        } else {
            console.log('✅ User auth creation successful:', signupData);
            
            if (signupData.user) {
                // Wait for trigger to complete
                console.log('⏳ Waiting for profile creation trigger...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if profile was created
                const { data: profileData, error: profileCheckError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', signupData.user.id)
                    .single();
                    
                if (profileCheckError) {
                    console.error('❌ Profile check error:', profileCheckError);
                    console.log('🔧 Attempting manual profile creation...');
                    
                    // Try manual profile creation
                    const { error: manualProfileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: signupData.user.id,
                            email: testEmail,
                            full_name: testMetadata.full_name,
                            username: testMetadata.username,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                        
                    if (manualProfileError) {
                        console.error('❌ Manual profile creation failed:', manualProfileError);
                    } else {
                        console.log('✅ Manual profile creation successful');
                    }
                } else {
                    console.log('✅ Profile created automatically by trigger:', profileData);
                }
                
                // Clean up test user
                console.log('🧹 Cleaning up test user...');
                await supabase.auth.signOut();
            }
        }
        
        // Test 4: Check current environment
        console.log('🔧 Environment check:');
        console.log('Supabase URL:', supabase.supabaseUrl ? '✅ Set' : '❌ Missing');
        console.log('Supabase Key:', supabase.supabaseKey ? '✅ Set' : '❌ Missing');
        
    } catch (error) {
        console.error('🚨 Diagnosis failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
    }
}

// Simple connection test
async function simpleConnectionTest() {
    try {
        const { supabase } = await import('./lib/supabase.js');
        const { error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
            console.error('❌ Simple connection test failed:', error);
            if (error.message.includes('relation "profiles" does not exist')) {
                console.log('🚨 DATABASE ISSUE IDENTIFIED: profiles table missing');
                console.log('📋 SOLUTION: Run COMPREHENSIVE_DATABASE_FIX.sql in Supabase');
            }
        } else {
            console.log('✅ Simple connection test passed');
        }
    } catch (error) {
        console.error('❌ Connection test error:', error);
    }
}

// Export functions for manual testing
window.diagnoseDatabaseIssue = diagnoseDatabaseIssue;
window.simpleConnectionTest = simpleConnectionTest;

console.log('🎯 Database diagnosis functions loaded!');
console.log('Run: simpleConnectionTest() for a quick check');
console.log('Run: diagnoseDatabaseIssue() for a full diagnosis');

// Auto-run simple test
simpleConnectionTest();