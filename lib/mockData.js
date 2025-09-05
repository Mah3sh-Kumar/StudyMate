/**
 * Centralized Mock Data and Services for StudyMate
 * 
 * This file contains all mock data and service functions used throughout the application,
 * providing a single source of truth for testing and development.
 * Replaces both mockData.js and mockServices.js for simplified architecture.
 */

// =============================================================================
// AUTHENTICATION DATA
// =============================================================================

export const mockUsers = [
  {
    id: "user-1",
    email: "john.doe@example.com",
    password: "password123",
    user_metadata: {
      full_name: "John Doe",
      username: "johndoe"
    },
    profile: {
      id: "user-1",
      full_name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=john.doe@example.com",
      study_subjects: ["Mathematics", "Physics", "Computer Science"],
      study_goals: ["Master calculus", "Learn algorithms", "Complete degree"],
      preferences: {
        study_duration: 25,
        break_duration: 5,
        daily_goal_hours: 4
      }
    }
  },
  {
    id: "user-2",
    email: "jane.smith@example.com",
    password: "securepass",
    user_metadata: {
      full_name: "Jane Smith",
      username: "janesmith"
    },
    profile: {
      id: "user-2",
      full_name: "Jane Smith",
      username: "janesmith",
      email: "jane.smith@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=jane.smith@example.com",
      study_subjects: ["Biology", "Chemistry", "Medicine"],
      study_goals: ["Pass MCAT", "Learn organic chemistry", "Study anatomy"],
      preferences: {
        study_duration: 30,
        break_duration: 10,
        daily_goal_hours: 6
      }
    }
  },
  {
    id: "user-3",
    email: "alex.chen@example.com",
    password: "mypassword",
    user_metadata: {
      full_name: "Alex Chen",
      username: "alexchen"
    },
    profile: {
      id: "user-3",
      full_name: "Alex Chen",
      username: "alexchen",
      email: "alex.chen@example.com",
      avatar_url: "https://i.pravatar.cc/150?u=alex.chen@example.com",
      study_subjects: ["History", "Literature", "Philosophy"],
      study_goals: ["Research paper", "Read classics", "Improve writing"],
      preferences: {
        study_duration: 45,
        break_duration: 15,
        daily_goal_hours: 3
      }
    }
  }
];

// =============================================================================
// CHAT DATA
// =============================================================================

export const mockChats = [
  {
    id: "chat-1",
    user_id: "user-1",
    title: "Math Help Session",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Can you help me understand derivatives?",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: "msg-2", 
        role: "assistant",
        content: "Of course! A derivative represents the rate of change of a function. Think of it as the slope of a curve at any given point.",
        timestamp: new Date(Date.now() - 59 * 60 * 1000).toISOString()
      },
      {
        id: "msg-3",
        role: "user", 
        content: "Can you give me an example?",
        timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString()
      },
      {
        id: "msg-4",
        role: "assistant",
        content: "Sure! If f(x) = x², then f'(x) = 2x. This means at x=3, the slope is 6.",
        timestamp: new Date(Date.now() - 57 * 60 * 1000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 57 * 60 * 1000).toISOString()
  },
  {
    id: "chat-2", 
    user_id: "user-2",
    title: "Biology Questions",
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "Explain photosynthesis in simple terms",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: "msg-6",
        role: "assistant", 
        content: "Photosynthesis is how plants make food using sunlight, water, and carbon dioxide. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        timestamp: new Date(Date.now() - 29 * 60 * 1000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 29 * 60 * 1000).toISOString()
  }
];

// =============================================================================
// STUDY GROUPS DATA
// =============================================================================

export const mockStudyGroups = [
  {
    id: "group-1",
    name: "Calculus Study Circle",
    description: "Advanced calculus problem-solving group for Math 301",
    subject: "Mathematics",
    created_by: "user-1",
    creator_name: "John Doe",
    is_public: true,
    member_count: 8,
    max_members: 15,
    tags: ["calculus", "math", "derivatives", "integrals"],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    members: [
      { user_id: "user-1", role: "admin", joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { user_id: "user-2", role: "member", joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { user_id: "user-3", role: "member", joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    messages: [
      {
        id: "group-msg-1",
        user_id: "user-1",
        user_name: "John Doe",
        message: "Welcome everyone! Let's start with derivatives today.",
        message_type: "text",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "group-msg-2", 
        user_id: "user-2",
        user_name: "Jane Smith",
        message: "Great! I have some questions about the chain rule.",
        message_type: "text",
        created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "group-2",
    name: "Biology Lab Partners", 
    description: "Group for biology lab experiments and discussions",
    subject: "Biology",
    created_by: "user-2",
    creator_name: "Jane Smith", 
    is_public: true,
    member_count: 5,
    max_members: 10,
    tags: ["biology", "lab", "experiments", "anatomy"],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    members: [
      { user_id: "user-2", role: "admin", joined_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { user_id: "user-1", role: "member", joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    messages: [
      {
        id: "group-msg-3",
        user_id: "user-2", 
        user_name: "Jane Smith",
        message: "Don't forget about tomorrow's lab on cellular respiration!",
        message_type: "text",
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "group-3",
    name: "Computer Science Fundamentals",
    description: "Learning programming and CS concepts together",
    subject: "Computer Science", 
    created_by: "user-3",
    creator_name: "Alex Chen",
    is_public: true,
    member_count: 12,
    max_members: 20,
    tags: ["programming", "algorithms", "data-structures", "coding"],
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    members: [
      { user_id: "user-3", role: "admin", joined_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    messages: []
  }
];

// =============================================================================
// FLASHCARDS DATA
// =============================================================================

export const mockFlashcardDecks = [
  {
    id: "deck-1",
    user_id: "user-1",
    name: "Calculus Fundamentals",
    description: "Essential calculus concepts and formulas", 
    subject: "Mathematics",
    is_public: false,
    total_cards: 15,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["calculus", "derivatives", "integrals", "limits"]
  },
  {
    id: "deck-2", 
    user_id: "user-2",
    name: "Biology Vocabulary",
    description: "Important biology terms and definitions",
    subject: "Biology",
    is_public: true,
    total_cards: 25,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["biology", "vocabulary", "anatomy", "physiology"]
  },
  {
    id: "deck-3",
    user_id: "user-3", 
    name: "World History Timeline",
    description: "Key historical events and dates",
    subject: "History",
    is_public: true,
    total_cards: 30,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["history", "timeline", "events", "dates"]
  }
];

export const mockFlashcards = [
  // Calculus deck cards
  {
    id: "card-1",
    deck_id: "deck-1",
    front: "What is the derivative of x²?",
    back: "2x",
    difficulty_level: 1,
    next_review: null,
    review_count: 0,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "card-2",
    deck_id: "deck-1", 
    front: "What is the integral of 2x?",
    back: "x² + C",
    difficulty_level: 2,
    next_review: null,
    review_count: 3,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "card-3",
    deck_id: "deck-1",
    front: "What is the limit of (sin x)/x as x approaches 0?",
    back: "1",
    difficulty_level: 3,
    next_review: null,
    review_count: 1,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Biology deck cards
  {
    id: "card-4",
    deck_id: "deck-2",
    front: "What is photosynthesis?",
    back: "The process by which plants convert sunlight, water, and CO₂ into glucose and oxygen",
    difficulty_level: 1,
    next_review: null,
    review_count: 2,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "card-5",
    deck_id: "deck-2",
    front: "What is DNA?",
    back: "Deoxyribonucleic acid - the molecule that carries genetic information in living organisms",
    difficulty_level: 1,
    next_review: null,
    review_count: 5,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  // History deck cards
  {
    id: "card-6",
    deck_id: "deck-3",
    front: "When did World War II end?",
    back: "September 2, 1945",
    difficulty_level: 1,
    next_review: null,
    review_count: 4,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// =============================================================================
// STUDY SESSIONS DATA
// =============================================================================

export const mockStudySessions = [
  {
    id: "session-1",
    user_id: "user-1",
    subject: "Mathematics",
    start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    notes: "Studied calculus derivatives and practiced problems from chapter 3",
    tags: ["calculus", "derivatives", "practice"],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "session-2",
    user_id: "user-1", 
    subject: "Physics",
    start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    notes: "Reviewed Newton's laws and worked on mechanics problems",
    tags: ["physics", "mechanics", "newton-laws"],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "session-3",
    user_id: "user-2",
    subject: "Biology",
    start_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 50,
    notes: "Cellular respiration and photosynthesis comparison",
    tags: ["biology", "cellular-respiration", "photosynthesis"],
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "session-4",
    user_id: "user-3",
    subject: "History",
    start_time: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 30,
    notes: "Read about Renaissance art and cultural impact",
    tags: ["renaissance", "art-history", "culture"],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

// =============================================================================
// STUDY STATISTICS DATA  
// =============================================================================

export const mockStudyStats = {
  totalSessions: 15,
  totalMinutes: 720, // 12 hours
  averageSessionLength: 48,
  subjects: {
    'Mathematics': { count: 6, totalMinutes: 300 },
    'Physics': { count: 4, totalMinutes: 180 },
    'Biology': { count: 3, totalMinutes: 150 },
    'History': { count: 2, totalMinutes: 90 }
  },
  weeklyProgress: [
    { day: 'Mon', minutes: 120 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 150 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 180 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 30 }
  ],
  monthlyGoal: 1800, // 30 hours
  currentProgress: 720
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a user by email and password (for login)
 */
export const getUserByCredentials = (email, password) => {
  return mockUsers.find(user => 
    user.email.toLowerCase() === email.toLowerCase() && 
    user.password === password
  );
};

/**
 * Get a user by ID
 */
export const getUserById = (userId) => {
  return mockUsers.find(user => user.id === userId);
};

/**
 * Get user's chats
 */
export const getUserChats = (userId) => {
  return mockChats.filter(chat => chat.user_id === userId);
};

/**
 * Get user's study groups (where user is a member)
 */
export const getUserStudyGroups = (userId) => {
  return mockStudyGroups.filter(group => 
    group.members.some(member => member.user_id === userId)
  );
};

/**
 * Get public study groups (user can join)
 */
export const getPublicStudyGroups = (userId = null) => {
  return mockStudyGroups.filter(group => {
    if (userId) {
      // Exclude groups user is already a member of
      return group.is_public && !group.members.some(member => member.user_id === userId);
    }
    return group.is_public;
  });
};

/**
 * Get user's flashcard decks
 */
export const getUserFlashcardDecks = (userId) => {
  return mockFlashcardDecks.filter(deck => deck.user_id === userId);
};

/**
 * Get flashcards for a specific deck
 */
export const getDeckFlashcards = (deckId) => {
  return mockFlashcards.filter(card => card.deck_id === deckId);
};

/**
 * Get user's study sessions
 */
export const getUserStudySessions = (userId, limit = 50) => {
  return mockStudySessions
    .filter(session => session.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

/**
 * Get study statistics for user
 */
export const getUserStudyStats = (userId) => {
  const userSessions = getUserStudySessions(userId);
  
  if (userSessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      subjects: {},
      weeklyProgress: [],
      monthlyGoal: 0,
      currentProgress: 0
    };
  }
  
  // For mock data, return the predefined stats for the first user
  if (userId === 'user-1') {
    return mockStudyStats;
  }
  
  // Return simulated stats for other users
  return {
    totalSessions: userSessions.length,
    totalMinutes: userSessions.reduce((total, session) => total + session.duration_minutes, 0),
    averageSessionLength: Math.round(
      userSessions.reduce((total, session) => total + session.duration_minutes, 0) / userSessions.length
    ),
    subjects: userSessions.reduce((acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = { count: 0, totalMinutes: 0 };
      }
      acc[session.subject].count++;
      acc[session.subject].totalMinutes += session.duration_minutes;
      return acc;
    }, {}),
    weeklyProgress: mockStudyStats.weeklyProgress, // Use default for simplicity
    monthlyGoal: 1200,
    currentProgress: userSessions.reduce((total, session) => total + session.duration_minutes, 0)
  };
};

// =============================================================================
// MOCK SERVICES
// =============================================================================

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

/**
 * User Service - handles user-related operations
 */
export const userService = {
  /**
   * Get user study preferences
   */
  async getStudyPreferences(userId) {
    try {
      console.log('📚 Fetching study preferences...', { userId });
      
      const user = getUserById(userId);
      const preferences = user?.profile || {
        id: userId,
        study_subjects: ['Mathematics', 'Biology', 'History'],
        study_goals: ['Complete coursework', 'Improve grades'],
        preferences: {
          study_duration: 25,
          break_duration: 5,
          daily_goal_hours: 4
        }
      };
      
      const result = { data: preferences, error: null };
      logOperation('SELECT', 'user_preferences', result, { userId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getStudyPreferences:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'user_preferences', result, { userId });
      return result;
    }
  },

  /**
   * Update user study preferences
   */
  async updateStudyPreferences(userId, subjects, goals) {
    try {
      console.log('📝 Updating study preferences...', { userId, subjects, goals });
      
      // Mock successful update
      const updatedPreferences = {
        id: userId,
        study_subjects: subjects,
        study_goals: goals,
        updated_at: new Date().toISOString()
      };
      
      const result = { data: updatedPreferences, error: null };
      logOperation('UPDATE', 'user_preferences', result, { userId, subjects, goals });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in updateStudyPreferences:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('UPDATE', 'user_preferences', result, { userId, subjects, goals });
      return result;
    }
  }
};

/**
 * Study Session Service - handles study session operations
 */
export const studySessionService = {
  /**
   * Get user's study sessions
   */
  async getUserSessions(userId, limit = 50) {
    try {
      console.log('📊 Fetching user study sessions...', { userId, limit });
      
      const sessions = getUserStudySessions(userId, limit);
      
      const result = { data: sessions, error: null };
      logOperation('SELECT', 'study_sessions', result, { userId, limit });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getUserSessions:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'study_sessions', result, { userId, limit });
      return result;
    }
  },

  /**
   * Start a new study session
   */
  async startSession(userId, sessionData) {
    try {
      console.log('▶️ Starting study session...', { userId, sessionData });
      
      // Mock new session
      const newSession = {
        id: `session-${Date.now()}`,
        user_id: userId,
        subject: sessionData.subject,
        start_time: new Date().toISOString(),
        end_time: null,
        duration_minutes: 0,
        notes: '',
        tags: sessionData.tags || [],
        created_at: new Date().toISOString()
      };
      
      const result = { data: newSession, error: null };
      logOperation('INSERT', 'study_sessions', result, { userId, ...sessionData });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in startSession:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'study_sessions', result, { userId, ...sessionData });
      return result;
    }
  },

  /**
   * End a study session
   */
  async endSession(sessionId, notes = '') {
    try {
      console.log('⏹️ Ending study session...', { sessionId, notes });
      
      // Mock session end
      const endedSession = {
        id: sessionId,
        end_time: new Date().toISOString(),
        notes: notes,
        updated_at: new Date().toISOString()
      };
      
      const result = { data: endedSession, error: null };
      logOperation('UPDATE', 'study_sessions', result, { sessionId, notes });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in endSession:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('UPDATE', 'study_sessions', result, { sessionId, notes });
      return result;
    }
  },

  /**
   * Get study statistics
   */
  async getStudyStats(userId) {
    try {
      console.log('📈 Fetching study statistics...', { userId });
      
      const stats = getUserStudyStats(userId);
      
      const result = { data: stats, error: null };
      logOperation('SELECT', 'study_stats', result, { userId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getStudyStats:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'study_stats', result, { userId });
      return result;
    }
  }
};

/**
 * Study Group Service - handles study group operations
 */
export const studyGroupService = {
  /**
   * Get user's study groups
   */
  async getUserGroups(userId) {
    try {
      console.log('👥 Fetching user groups...', { userId });
      
      const userGroups = getUserStudyGroups(userId);
      
      // Format for compatibility with existing components
      const formattedGroups = userGroups.map(group => ({
        ...group,
        profiles: {
          full_name: group.creator_name || 'Unknown',
          username: group.creator_name?.toLowerCase().replace(' ', '.') || 'unknown'
        }
      }));
      
      const result = { data: formattedGroups, error: null };
      logOperation('SELECT', 'user_groups', result, { userId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getUserGroups:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'user_groups', result, { userId });
      return result;
    }
  },

  /**
   * Get public study groups
   */
  async getPublicGroups(userId = null) {
    try {
      console.log('🌐 Fetching public groups...');
      
      const publicGroups = getPublicStudyGroups(userId);
      
      // Format for compatibility with existing components
      const formattedGroups = publicGroups.map(group => ({
        ...group,
        profiles: {
          full_name: group.creator_name || 'Unknown',
          username: group.creator_name?.toLowerCase().replace(' ', '.') || 'unknown'
        },
        group_members: [{ count: group.member_count }]
      }));
      
      const result = { data: formattedGroups, error: null };
      logOperation('SELECT', 'public_groups', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getPublicGroups:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'public_groups', result);
      return result;
    }
  },

  /**
   * Create a new study group
   */
  async createGroup(userId, groupData) {
    try {
      console.log('➕ Creating study group...', { userId, groupData });
      
      // Mock new group
      const newGroup = {
        id: `group-${Date.now()}`,
        name: groupData.name,
        description: groupData.description,
        subject: groupData.subject,
        created_by: userId,
        creator_name: getUserById(userId)?.profile?.full_name || 'Unknown User',
        is_public: groupData.isPublic,
        member_count: 1,
        max_members: groupData.maxMembers || 20,
        tags: groupData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        members: [
          { user_id: userId, role: 'admin', joined_at: new Date().toISOString() }
        ],
        messages: []
      };
      
      // Add to mock data
      mockStudyGroups.push(newGroup);
      
      const result = { data: newGroup, error: null };
      logOperation('INSERT', 'study_groups', result, { userId, ...groupData });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in createGroup:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'study_groups', result, { userId, ...groupData });
      return result;
    }
  },

  /**
   * Add member to group
   */
  async addMember(groupId, userId, role = 'member') {
    try {
      console.log('👤 Adding member to group...', { groupId, userId, role });
      
      // Find group and add member
      const group = mockStudyGroups.find(g => g.id === groupId);
      if (group) {
        group.members.push({
          user_id: userId,
          role: role,
          joined_at: new Date().toISOString()
        });
        group.member_count = group.members.length;
        group.updated_at = new Date().toISOString();
      }
      
      const result = { data: { groupId, userId, role }, error: null };
      logOperation('INSERT', 'group_members', result, { groupId, userId, role });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in addMember:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'group_members', result, { groupId, userId, role });
      return result;
    }
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId, userId) {
    try {
      console.log('🚪 Removing member from group...', { groupId, userId });
      
      // Find group and remove member
      const group = mockStudyGroups.find(g => g.id === groupId);
      if (group) {
        group.members = group.members.filter(m => m.user_id !== userId);
        group.member_count = group.members.length;
        group.updated_at = new Date().toISOString();
      }
      
      const result = { data: { groupId, userId }, error: null };
      logOperation('DELETE', 'group_members', result, { groupId, userId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in removeMember:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('DELETE', 'group_members', result, { groupId, userId });
      return result;
    }
  }
};

/**
 * Flashcard Service - handles flashcard operations
 */
export const flashcardService = {
  /**
   * Get user's flashcard decks
   */
  async getUserDecks(userId) {
    try {
      console.log('🃏 Fetching user flashcard decks...', { userId });
      
      const decks = getUserFlashcardDecks(userId);
      
      const result = { data: decks, error: null };
      logOperation('SELECT', 'flashcard_decks', result, { userId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getUserDecks:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'flashcard_decks', result, { userId });
      return result;
    }
  },

  /**
   * Get flashcards for a deck
   */
  async getDeckCards(deckId) {
    try {
      console.log('📚 Fetching deck flashcards...', { deckId });
      
      const cards = getDeckFlashcards(deckId);
      
      const result = { data: cards, error: null };
      logOperation('SELECT', 'flashcards', result, { deckId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getDeckCards:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'flashcards', result, { deckId });
      return result;
    }
  },

  /**
   * Create a new flashcard deck
   */
  async createDeck(userId, deckData) {
    try {
      console.log('➕ Creating flashcard deck...', { userId, deckData });
      
      const newDeck = {
        id: `deck-${Date.now()}`,
        user_id: userId,
        name: deckData.name,
        description: deckData.description,
        subject: deckData.subject,
        is_public: deckData.isPublic || false,
        total_cards: 0,
        tags: deckData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock data
      mockFlashcardDecks.push(newDeck);
      
      const result = { data: newDeck, error: null };
      logOperation('INSERT', 'flashcard_decks', result, { userId, ...deckData });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in createDeck:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'flashcard_decks', result, { userId, ...deckData });
      return result;
    }
  },

  /**
   * Add a flashcard to a deck
   */
  async addCard(deckId, cardData) {
    try {
      console.log('📝 Adding flashcard...', { deckId, cardData });
      
      const newCard = {
        id: `card-${Date.now()}`,
        deck_id: deckId,
        front: cardData.front,
        back: cardData.back,
        difficulty_level: cardData.difficulty || 1,
        next_review: null,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock data
      mockFlashcards.push(newCard);
      
      // Update deck card count
      const deck = mockFlashcardDecks.find(d => d.id === deckId);
      if (deck) {
        deck.total_cards = mockFlashcards.filter(c => c.deck_id === deckId).length;
        deck.updated_at = new Date().toISOString();
      }
      
      const result = { data: newCard, error: null };
      logOperation('INSERT', 'flashcards', result, { deckId, ...cardData });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in addCard:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'flashcards', result, { deckId, ...cardData });
      return result;
    }
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(cardId) {
    try {
      console.log('🗑️ Deleting flashcard...', { cardId });
      
      // Find and remove card from mock data
      const cardIndex = mockFlashcards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        const result = { data: null, error: { message: 'Flashcard not found' } };
        logOperation('DELETE', 'flashcards', result, { cardId });
        return result;
      }
      
      const deletedCard = mockFlashcards.splice(cardIndex, 1)[0];
      
      // Update deck card count
      const deck = mockFlashcardDecks.find(d => d.id === deletedCard.deck_id);
      if (deck) {
        deck.total_cards = mockFlashcards.filter(c => c.deck_id === deletedCard.deck_id).length;
        deck.updated_at = new Date().toISOString();
      }
      
      const result = { data: deletedCard, error: null };
      logOperation('DELETE', 'flashcards', result, { cardId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in deleteFlashcard:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('DELETE', 'flashcards', result, { cardId });
      return result;
    }
  },

  /**
   * Delete a flashcard deck
   */
  async deleteDeck(deckId) {
    try {
      console.log('🗑️ Deleting flashcard deck...', { deckId });
      
      // Find and remove deck from mock data
      const deckIndex = mockFlashcardDecks.findIndex(d => d.id === deckId);
      if (deckIndex === -1) {
        const result = { data: null, error: { message: 'Deck not found' } };
        logOperation('DELETE', 'flashcard_decks', result, { deckId });
        return result;
      }
      
      const deletedDeck = mockFlashcardDecks.splice(deckIndex, 1)[0];
      
      // Remove all cards from this deck
      const deletedCards = [];
      for (let i = mockFlashcards.length - 1; i >= 0; i--) {
        if (mockFlashcards[i].deck_id === deckId) {
          deletedCards.push(mockFlashcards.splice(i, 1)[0]);
        }
      }
      
      const result = { 
        data: { 
          deck: deletedDeck, 
          deletedCards: deletedCards.length 
        }, 
        error: null 
      };
      logOperation('DELETE', 'flashcard_decks', result, { deckId });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in deleteDeck:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('DELETE', 'flashcard_decks', result, { deckId });
      return result;
    }
  }
};

/**
 * Authentication Service - handles user authentication
 */
export const authService = {
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      console.log('🔐 Attempting login...', { email });
      
      const user = getUserByCredentials(email, password);
      
      if (!user) {
        const result = { data: null, error: { message: 'Invalid email or password' } };
        logOperation('SELECT', 'auth_login', result, { email });
        return result;
      }
      
      const authUser = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        },
        session: {
          access_token: `mock-token-${user.id}`,
          refresh_token: `mock-refresh-${user.id}`,
          expires_in: 3600,
          token_type: 'bearer'
        }
      };
      
      const result = { data: authUser, error: null };
      logOperation('SELECT', 'auth_login', result, { email });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in login:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'auth_login', result, { email });
      return result;
    }
  },

  /**
   * Register new user
   */
  async signup(email, password, metadata = {}) {
    try {
      console.log('📝 Attempting signup...', { email, metadata });
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        const result = { data: null, error: { message: 'User already exists' } };
        logOperation('INSERT', 'auth_signup', result, { email, metadata });
        return result;
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: email,
        password: password,
        user_metadata: {
          full_name: metadata.full_name || email.split('@')[0],
          username: metadata.username || email.split('@')[0]
        },
        profile: {
          id: `user-${Date.now()}`,
          full_name: metadata.full_name || email.split('@')[0],
          username: metadata.username || email.split('@')[0],
          email: email,
          avatar_url: `https://i.pravatar.cc/150?u=${email}`,
          study_subjects: [],
          study_goals: [],
          preferences: {
            study_duration: 25,
            break_duration: 5,
            daily_goal_hours: 4
          }
        }
      };
      
      // Add to mock data
      mockUsers.push(newUser);
      
      const authUser = {
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: newUser.user_metadata
        },
        session: {
          access_token: `mock-token-${newUser.id}`,
          refresh_token: `mock-refresh-${newUser.id}`,
          expires_in: 3600,
          token_type: 'bearer'
        }
      };
      
      const result = { data: authUser, error: null };
      logOperation('INSERT', 'auth_signup', result, { email, metadata });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in signup:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('INSERT', 'auth_signup', result, { email, metadata });
      return result;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      console.log('🚪 Logging out user...');
      
      const result = { data: null, error: null };
      logOperation('DELETE', 'auth_logout', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in logout:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('DELETE', 'auth_logout', result);
      return result;
    }
  },

  /**
   * Get current user session
   */
  async getSession() {
    try {
      console.log('👤 Getting current session...');
      
      // Mock session - in real app this would check stored tokens
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'john.doe@example.com',
          user_metadata: {
            full_name: 'John Doe',
            username: 'johndoe'
          }
        },
        session: {
          access_token: 'mock-token-user-1',
          refresh_token: 'mock-refresh-user-1',
          expires_in: 3600,
          token_type: 'bearer'
        }
      };
      
      const result = { data: mockSession, error: null };
      logOperation('SELECT', 'auth_session', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in getSession:', error);
      const result = { data: null, error: { message: error.message } };
      logOperation('SELECT', 'auth_session', result);
      return result;
    }
  }
};

/**
 * Database Utilities - helper functions for database operations
 */
export const dbUtils = {
  /**
   * Handle and format database errors
   */
  handleError(error) {
    if (!error) return null;
    
    console.error('Database error:', error);
    
    // Handle different error types
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Network error. Please check your internet connection.';
      }
      
      // Mock specific errors
      if (error.code === 'PGRST116') {
        return 'No data found';
      }
      if (error.code === '23505') {
        return 'Duplicate entry - this item already exists';
      }
      if (error.code === '23503') {
        return 'Referenced data not found - missing required relationship';
      }
      if (error.code === '42501') {
        return 'Permission denied - check Row Level Security policies';
      }
      
      return error.message;
    }
    
    return 'An unexpected database error occurred';
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    // Mock authentication check
    return true;
  },

  /**
   * Get current user ID
   */
  async getCurrentUserId() {
    // Mock user ID - in real app this would check stored session
    return 'user-1';
  },

  /**
   * Test database connectivity
   */
  async testConnection() {
    try {
      // Mock successful connection
      return {
        success: true,
        connected: true,
        error: null
      };
    } catch (err) {
      return {
        success: false,
        connected: false,
        error: err.message
      };
    }
  },

  /**
   * Log database operations for debugging
   */
  logOperation(operation, table, result) {
    return logOperation(operation, table, result);
  }
};

export default {
  // Data exports
  mockUsers,
  mockChats,
  mockStudyGroups,
  mockFlashcardDecks,
  mockFlashcards,
  mockStudySessions,
  mockStudyStats,
  
  // Helper function exports
  getUserByCredentials,
  getUserById,
  getUserChats,
  getUserStudyGroups,
  getPublicStudyGroups,
  getUserFlashcardDecks,
  getDeckFlashcards,
  getUserStudySessions,
  getUserStudyStats,
  
  // Service exports
  userService,
  studySessionService,
  studyGroupService,
  flashcardService,
  authService,
  dbUtils
};