import supabaseClient from './supabaseClient';

// Helper function for consistent logging
const logOperation = (operation, table, result, params = null) => {
  const timestamp = new Date().toISOString();
  const success = !result.error;
  
  console.log(`[${timestamp}] ${operation} ${table}:`);
  console.log('  Success:', success ? '✅' : '❌');
  console.log('  Data:', result.data ? (Array.isArray(result.data) ? `${result.data.length} records` : 'single record') : 'none');
  
  if (result.error) {
    console.log('  Error:', result.error.message);
  }
  
  if (params && __DEV__) {
    console.log('  Params:', JSON.stringify(params, null, 2));
  }
  
  return result;
};

// Helper function for input validation
const validateUserData = (userData, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate && !userData.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!isUpdate && !userData.email?.trim()) {
    errors.push('Email is required');
  }
  
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Invalid email format');
  }
  
  if (userData.age && (userData.age < 0 || userData.age > 150)) {
    errors.push('Age must be between 0 and 150');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Fetch all users from the database
 * 
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of users to fetch (default: 50)
 * @param {string} options.orderBy - Column to order by (default: 'created_at')
 * @param {boolean} options.ascending - Sort order (default: false)
 * @returns {Promise<Object>} Result with data or error
 */
export const fetchUsers = async (options = {}) => {
  const {
    limit = 50,
    orderBy = 'created_at',
    ascending = false
  } = options;
  
  try {
    console.log('🔍 Fetching users...', { limit, orderBy, ascending });
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order(orderBy, { ascending })
      .limit(limit);
    
    const result = { data, error };
    logOperation('SELECT', 'users', result, options);
    
    if (error) {
      return {
        success: false,
        data: null,
        error: `Failed to fetch users: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data || [],
      error: null,
      count: data?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in fetchUsers:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Add a new user to the database
 * 
 * @param {Object} userData - User data to insert
 * @param {string} userData.name - User's full name (required)
 * @param {string} userData.email - User's email address (required)
 * @param {number} userData.age - User's age (optional)
 * @param {string} userData.avatar_url - Profile picture URL (optional)
 * @param {string} userData.bio - User biography (optional)
 * @returns {Promise<Object>} Result with created user data or error
 */
export const addUser = async (userData) => {
  try {
    console.log('➕ Adding new user...', { email: userData?.email });
    
    // Validate input data
    const validation = validateUserData(userData, false);
    if (!validation.isValid) {
      return {
        success: false,
        data: null,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        details: { validationErrors: validation.errors }
      };
    }
    
    // Prepare data for insertion
    const insertData = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      age: userData.age || null,
      avatar_url: userData.avatar_url?.trim() || null,
      bio: userData.bio?.trim() || null,
      is_active: userData.is_active !== undefined ? userData.is_active : true
    };
    
    const { data, error } = await supabaseClient
      .from('users')
      .insert([insertData])
      .select()
      .single();
    
    const result = { data, error };
    logOperation('INSERT', 'users', result, insertData);
    
    if (error) {
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: false,
          data: null,
          error: 'A user with this email already exists',
          details: error
        };
      }
      
      return {
        success: false,
        data: null,
        error: `Failed to add user: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data,
      error: null,
      message: 'User created successfully'
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in addUser:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Update an existing user in the database
 * 
 * @param {string} userId - UUID of the user to update
 * @param {Object} updates - Data to update
 * @returns {Promise<Object>} Result with updated user data or error
 */
export const updateUser = async (userId, updates) => {
  try {
    console.log('📝 Updating user...', { userId, updates: Object.keys(updates) });
    
    if (!userId) {
      return {
        success: false,
        data: null,
        error: 'User ID is required for update',
        details: null
      };
    }
    
    // Validate update data
    const validation = validateUserData(updates, true);
    if (!validation.isValid) {
      return {
        success: false,
        data: null,
        error: `Validation failed: ${validation.errors.join(', ')}`,
        details: { validationErrors: validation.errors }
      };
    }
    
    // Prepare update data (remove undefined values)
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.email !== undefined) updateData.email = updates.email.trim().toLowerCase();
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url?.trim() || null;
    if (updates.bio !== undefined) updateData.bio = updates.bio?.trim() || null;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    
    // Add automatic updated_at (will be handled by trigger, but good practice)
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseClient
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    const result = { data, error };
    logOperation('UPDATE', 'users', result, { userId, ...updateData });
    
    if (error) {
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: false,
          data: null,
          error: 'Email already exists for another user',
          details: error
        };
      }
      
      if (error.code === 'PGRST116') { // No rows found
        return {
          success: false,
          data: null,
          error: 'User not found',
          details: error
        };
      }
      
      return {
        success: false,
        data: null,
        error: `Failed to update user: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data,
      error: null,
      message: 'User updated successfully'
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in updateUser:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Delete a user from the database
 * 
 * @param {string} userId - UUID of the user to delete
 * @returns {Promise<Object>} Result with success status or error
 */
export const deleteUser = async (userId) => {
  try {
    console.log('🗑️ Deleting user...', { userId });
    
    if (!userId) {
      return {
        success: false,
        data: null,
        error: 'User ID is required for deletion',
        details: null
      };
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single();
    
    const result = { data, error };
    logOperation('DELETE', 'users', result, { userId });
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return {
          success: false,
          data: null,
          error: 'User not found or already deleted',
          details: error
        };
      }
      
      return {
        success: false,
        data: null,
        error: `Failed to delete user: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data,
      error: null,
      message: 'User deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in deleteUser:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Get a single user by ID
 * 
 * @param {string} userId - UUID of the user to fetch
 * @returns {Promise<Object>} Result with user data or error
 */
export const getUserById = async (userId) => {
  try {
    console.log('👤 Fetching user by ID...', { userId });
    
    if (!userId) {
      return {
        success: false,
        data: null,
        error: 'User ID is required',
        details: null
      };
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    const result = { data, error };
    logOperation('SELECT BY ID', 'users', result, { userId });
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return {
          success: false,
          data: null,
          error: 'User not found',
          details: error
        };
      }
      
      return {
        success: false,
        data: null,
        error: `Failed to fetch user: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data,
      error: null
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in getUserById:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

/**
 * Search users by name or email
 * 
 * @param {string} searchTerm - Term to search for
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Promise<Object>} Result with matching users or error
 */
export const searchUsers = async (searchTerm, limit = 20) => {
  try {
    console.log('🔎 Searching users...', { searchTerm, limit });
    
    if (!searchTerm?.trim()) {
      return {
        success: false,
        data: null,
        error: 'Search term is required',
        details: null
      };
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(limit)
      .order('name');
    
    const result = { data, error };
    logOperation('SEARCH', 'users', result, { searchTerm, limit });
    
    if (error) {
      return {
        success: false,
        data: null,
        error: `Search failed: ${error.message}`,
        details: error
      };
    }
    
    return {
      success: true,
      data: data || [],
      error: null,
      count: data?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in searchUsers:', error);
    return {
      success: false,
      data: null,
      error: `Unexpected error: ${error.message}`,
      details: error
    };
  }
};

// Export all CRUD functions
export default {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserById,
  searchUsers
};