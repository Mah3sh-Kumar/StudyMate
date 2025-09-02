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
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' })
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
    const { data, error } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: userId,
        name: deckData.name,
        description: deckData.description,
        subject: deckData.subject,
        is_public: deckData.isPublic || false
      })
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
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        deck_id: deckId,
        front: cardData.front,
        back: cardData.back,
        difficulty_level: cardData.difficulty || 1
      })
      .select()
      .single();
    
    if (!error) {
      // Update deck total cards count
      await supabase
        .from('flashcard_decks')
        .update({ total_cards: supabase.rpc('increment') })
        .eq('id', deckId);
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
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        subject: sessionData.subject,
        start_time: new Date().toISOString(),
        tags: sessionData.tags || []
      })
      .select()
      .single();
    
    return { data, error };
  },

  // End study session
  async endSession(sessionId, notes = '') {
    const endTime = new Date();
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: Math.round((endTime - new Date(data.start_time)) / 60000),
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
    const { data, error } = await supabase
      .from('study_groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        subject: groupData.subject,
        created_by: userId,
        is_public: groupData.isPublic || true,
        tags: groupData.tags || []
      })
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
        profiles!created_by(full_name, username),
        group_members(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
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
    const { data, error } = await supabase
      .from('study_materials')
      .insert({
        user_id: userId,
        title: materialData.title,
        content: materialData.content,
        file_url: materialData.fileUrl,
        file_type: materialData.fileType,
        subject: materialData.subject,
        tags: materialData.tags || []
      })
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
  // Check if user is authenticated
  isAuthenticated() {
    return !!supabase.auth.getUser();
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
