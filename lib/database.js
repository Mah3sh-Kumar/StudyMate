import { supabase } from './supabase';

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

export const userService = {
  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Update user profile
  async updateProfile(userId, updates) {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return { data: null, error: { message: 'Invalid user ID' } };
    }
    
    // Sanitize updates to prevent injection
    const sanitizedUpdates = {};
    if (updates.full_name) {
      sanitizedUpdates.full_name = updates.full_name.substring(0, 255); // Limit length
    }
    if (updates.username) {
      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(updates.username)) {
        return { data: null, error: { message: 'Invalid username format' } };
      }
      sanitizedUpdates.username = updates.username;
    }
    if (updates.email) {
      // Validate email format
      const emailRegex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(updates.email)) {
        return { data: null, error: { message: 'Invalid email format' } };
      }
      sanitizedUpdates.email = updates.email;
    }
    if (updates.study_subjects && Array.isArray(updates.study_subjects)) {
      sanitizedUpdates.study_subjects = updates.study_subjects.slice(0, 20); // Limit array size
    }
    if (updates.study_goals && Array.isArray(updates.study_goals)) {
      sanitizedUpdates.study_goals = updates.study_goals.slice(0, 20); // Limit array size
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...sanitizedUpdates }, { onConflict: 'id' })
      .select()
      .single();
    
    return { data, error };
  },

  // Get user study preferences
  async getStudyPreferences(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('study_subjects, study_goals, preferences')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Update study preferences
  async updateStudyPreferences(userId, subjects, goals) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        study_subjects: subjects, 
        study_goals: goals 
      }, { onConflict: 'id' })
      .select()
      .single();
    
    return { data, error };
  }
};

// ============================================================================
// FLASHCARD MANAGEMENT
// ============================================================================

export const flashcardService = {
  // Create new flashcard deck
  async createDeck(userId, deckData) {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return { data: null, error: { message: 'Invalid user ID' } };
    }
    
    if (!deckData || typeof deckData !== 'object') {
      return { data: null, error: { message: 'Invalid deck data' } };
    }
    
    // Sanitize and validate deck data
    const sanitizedDeckData = {
      user_id: userId,
      name: typeof deckData.name === 'string' ? deckData.name.substring(0, 255) : '',
      description: typeof deckData.description === 'string' ? deckData.description.substring(0, 1000) : '',
      subject: typeof deckData.subject === 'string' ? deckData.subject.substring(0, 100) : '',
      is_public: typeof deckData.isPublic === 'boolean' ? deckData.isPublic : false
    };
    
    // Validate required fields
    if (!sanitizedDeckData.name.trim()) {
      return { data: null, error: { message: 'Deck name is required' } };
    }
    
    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert(sanitizedDeckData)
      .select()
      .single();
    
    return { data, error };
  },

  // Get user's flashcard decks
  async getUserDecks(userId) {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get public flashcard decks
  async getPublicDecks() {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*, profiles(full_name, username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Add flashcard to deck
  async addFlashcard(deckId, cardData) {
    // Validate inputs
    if (!deckId || typeof deckId !== 'string') {
      return { data: null, error: { message: 'Invalid deck ID' } };
    }
    
    if (!cardData || typeof cardData !== 'object') {
      return { data: null, error: { message: 'Invalid card data' } };
    }
    
    // Sanitize card data
    const sanitizedCardData = {
      deck_id: deckId,
      front: typeof cardData.front === 'string' ? cardData.front.substring(0, 1000) : '',
      back: typeof cardData.back === 'string' ? cardData.back.substring(0, 2000) : '',
      difficulty_level: typeof cardData.difficulty === 'number' ? Math.min(Math.max(cardData.difficulty, 1), 5) : 1
    };
    
    // Validate required fields
    if (!sanitizedCardData.front.trim() || !sanitizedCardData.back.trim()) {
      return { data: null, error: { message: 'Both front and back of card are required' } };
    }
    
    const { data, error } = await supabase
      .from('flashcards')
      .insert(sanitizedCardData)
      .select()
      .single();
    
    if (!error) {
      // Update deck total cards count
      const { data: deckData } = await supabase
        .from('flashcard_decks')
        .select('total_cards')
        .eq('id', deckId)
        .single();
      
      if (deckData) {
        await supabase
          .from('flashcard_decks')
          .update({ total_cards: (deckData.total_cards || 0) + 1 })
          .eq('id', deckId);
      }
    }
    
    return { data, error };
  },

  // Get flashcards from deck
  async getDeckCards(deckId) {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  // Update flashcard
  async updateFlashcard(cardId, updates) {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete flashcard
  async deleteFlashcard(cardId) {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId);
    
    return { error };
  },

  // Delete deck and all its cards
  async deleteDeck(deckId) {
    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('id', deckId);
    
    return { error };
  }
};

// ============================================================================
// STUDY SESSIONS
// ============================================================================

export const studySessionService = {
  // Start new study session
  async startSession(userId, sessionData) {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return { data: null, error: { message: 'Invalid user ID' } };
    }
    
    if (!sessionData || typeof sessionData !== 'object') {
      return { data: null, error: { message: 'Invalid session data' } };
    }
    
    // Sanitize session data
    const sanitizedSessionData = {
      user_id: userId,
      subject: typeof sessionData.subject === 'string' ? sessionData.subject.substring(0, 100) : '',
      start_time: new Date().toISOString(),
      tags: Array.isArray(sessionData.tags) ? sessionData.tags.slice(0, 20).map(tag => String(tag).substring(0, 50)) : []
    };
    
    // Validate required fields
    if (!sanitizedSessionData.subject.trim()) {
      return { data: null, error: { message: 'Subject is required for study session' } };
    }
    
    const { data, error } = await supabase
      .from('study_sessions')
      .insert(sanitizedSessionData)
      .select()
      .single();
    
    return { data, error };
  },

  // End study session
  async endSession(sessionId, notes = '') {
    // First, fetch the session to get the start_time
    const { data: sessionData, error: fetchError } = await supabase
      .from('study_sessions')
      .select('start_time')
      .eq('id', sessionId)
      .single();
    
    if (fetchError || !sessionData) {
      return { data: null, error: fetchError || new Error('Session not found') };
    }
    
    const endTime = new Date();
    const startTime = new Date(sessionData.start_time);
    const durationMinutes = Math.round((endTime - startTime) / 60000);
    
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    return { data, error };
  },

  // Get user's study sessions
  async getUserSessions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },

  // Get study statistics
  async getStudyStats(userId) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('subject, duration_minutes, created_at')
      .eq('user_id', userId)
      .not('end_time', 'is', null);
    
    if (error) return { data: null, error };
    
    // Calculate statistics
    const stats = {
      totalSessions: data.length,
      totalMinutes: data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0),
      subjects: {},
      averageSessionLength: 0
    };
    
    data.forEach(session => {
      if (session.subject) {
        if (!stats.subjects[session.subject]) {
          stats.subjects[session.subject] = { count: 0, totalMinutes: 0 };
        }
        stats.subjects[session.subject].count++;
        stats.subjects[session.subject].totalMinutes += session.duration_minutes || 0;
      }
    });
    
    if (stats.totalSessions > 0) {
      stats.averageSessionLength = Math.round(stats.totalMinutes / stats.totalSessions);
    }
    
    return { data: stats, error: null };
  }
};

// ============================================================================
// STUDY GROUPS
// ============================================================================

export const studyGroupService = {
  // Create new study group
  async createGroup(userId, groupData) {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return { data: null, error: { message: 'Invalid user ID' } };
    }
    
    if (!groupData || typeof groupData !== 'object') {
      return { data: null, error: { message: 'Invalid group data' } };
    }
    
    // Sanitize group data
    const sanitizedGroupData = {
      name: typeof groupData.name === 'string' ? groupData.name.substring(0, 255) : '',
      description: typeof groupData.description === 'string' ? groupData.description.substring(0, 1000) : '',
      subject: typeof groupData.subject === 'string' ? groupData.subject.substring(0, 100) : '',
      created_by: userId,
      is_public: typeof groupData.isPublic === 'boolean' ? groupData.isPublic : true,
      tags: Array.isArray(groupData.tags) ? groupData.tags.slice(0, 20).map(tag => String(tag).substring(0, 50)) : []
    };
    
    // Validate required fields
    if (!sanitizedGroupData.name.trim()) {
      return { data: null, error: { message: 'Group name is required' } };
    }
    
    const { data, error } = await supabase
      .from('study_groups')
      .insert(sanitizedGroupData)
      .select()
      .single();
    
    if (!error && data) {
      // Add creator as admin member
      await this.addMember(data.id, userId, 'admin');
    }
    
    return { data, error };
  },

  // Get public study groups
  async getPublicGroups() {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        profiles!created_by(full_name, username)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    // Get member counts separately if needed
    if (!error && data) {
      for (const group of data) {
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
        group.member_count = (countError ? 0 : (count || 0));
      }
    }
    
    return { data, error };
  },

  // Get user's groups
  async getUserGroups(userId) {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        study_groups!inner(*, profiles!created_by(full_name, username))
      `)
      .eq('user_id', userId);
    
    if (!error && data) {
      return { data: data.map(item => item.study_groups), error: null };
    }
    
    return { data: [], error };
  },

  // Add member to group
  async addMember(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Remove member from group
  async removeMember(groupId, userId) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    return { error };
  },

  // Get group members
  async getGroupMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles(full_name, username, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });
    
    return { data, error };
  }
};

// ============================================================================
// AI CONTENT STORAGE
// ============================================================================

export const aiContentService = {
  // Save AI generated content
  async saveContent(userId, contentData) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .insert({
        user_id: userId,
        content_type: contentData.type,
        original_text: contentData.originalText,
        generated_content: contentData.generatedContent,
        ai_model: contentData.model || 'gpt-4o',
        tokens_used: contentData.tokensUsed || 0
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get user's AI content history
  async getUserContent(userId, contentType = null) {
    let query = supabase
      .from('ai_generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    
    const { data, error } = await query;
    return { data, error };
  }
};

// ============================================================================
// STUDY MATERIALS
// ============================================================================

export const studyMaterialService = {
  // Save study material
  async saveMaterial(userId, materialData) {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return { data: null, error: { message: 'Invalid user ID' } };
    }
    
    if (!materialData || typeof materialData !== 'object') {
      return { data: null, error: { message: 'Invalid material data' } };
    }
    
    // Sanitize material data
    const sanitizedMaterialData = {
      user_id: userId,
      title: typeof materialData.title === 'string' ? materialData.title.substring(0, 255) : '',
      content: typeof materialData.content === 'string' ? materialData.content.substring(0, 50000) : '',
      file_url: typeof materialData.fileUrl === 'string' ? materialData.fileUrl.substring(0, 500) : null,
      file_type: typeof materialData.fileType === 'string' ? materialData.fileType.substring(0, 50) : null,
      subject: typeof materialData.subject === 'string' ? materialData.subject.substring(0, 100) : '',
      tags: Array.isArray(materialData.tags) ? materialData.tags.slice(0, 20).map(tag => String(tag).substring(0, 50)) : []
    };
    
    // Validate required fields
    if (!sanitizedMaterialData.title.trim()) {
      return { data: null, error: { message: 'Material title is required' } };
    }
    
    const { data, error } = await supabase
      .from('study_materials')
      .insert(sanitizedMaterialData)
      .select()
      .single();
    
    return { data, error };
  },

  // Get user's study materials
  async getUserMaterials(userId, subject = null) {
    let query = supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (subject) {
      query = query.eq('subject', subject);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  // Update study material
  async updateMaterial(materialId, updates) {
    const { data, error } = await supabase
      .from('study_materials')
      .update(updates)
      .eq('id', materialId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete study material
  async deleteMaterial(materialId) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', materialId);
    
    return { error };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const dbUtils = {
  // Check if user is authenticated (async)
  async isAuthenticated() {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  // Get current user ID
  async getCurrentUserId() {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  },

  // Handle database errors
  handleError(error) {
    console.error('Database error:', error);
    if (error.code === 'PGRST116') {
      return 'No data found';
    }
    if (error.code === '23505') {
      return 'Duplicate entry';
    }
    if (error.code === '23503') {
      return 'Referenced data not found';
    }
    return error.message || 'Database operation failed';
  }
};

// Export all services
export default {
  userService,
  flashcardService,
  studySessionService,
  studyGroupService,
  aiContentService,
  studyMaterialService,
  dbUtils
};
