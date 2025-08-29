// API Configuration for StudyMate
// Copy this file to config/api-config.js and update with your actual values

export const API_CONFIG = {
  // OpenAI Configuration
  OPENAI: {
    API_KEY: 'YOUR_OPENAI_API_KEY_HERE', // Get from https://platform.openai.com/api-keys
    MODEL: 'gpt-3.5-turbo-1106', // or 'gpt-4' for better quality
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3,
    BASE_URL: 'https://api.openai.com/v1'
  },

  // Database Configuration
  DATABASE: {
    SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL', // Get from Supabase dashboard
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY', // Get from Supabase dashboard
    ENABLE_REALTIME: true,
    ENABLE_AUTH: true
  },

  // App Configuration
  APP: {
    NAME: 'StudyMate',
    VERSION: '1.0.0',
    DESCRIPTION: 'AI-Powered Study Assistant',
    AUTHOR: 'StudyMate Team'
  },

  // Feature Flags
  FEATURES: {
    ENABLE_AI_FEATURES: true,
    ENABLE_VOICE_CONTROL: true,
    ENABLE_STUDY_GROUPS: true,
    ENABLE_REALTIME_COLLABORATION: true,
    ENABLE_OFFLINE_MODE: false
  },

  // Study Session Limits
  STUDY_SESSIONS: {
    MAX_DURATION_MINUTES: 480, // 8 hours
    MIN_DURATION_MINUTES: 5,
    DEFAULT_DURATION_MINUTES: 25,
    BREAK_INTERVAL_MINUTES: 30
  },

  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
    STORAGE_BUCKET: 'study-materials'
  },

  // AI Generation Prompts
  AI: {
    SUMMARY_PROMPT: 'Please summarize the following text into 5-7 key bullet points. Focus on the main concepts and important details:',
    QUIZ_PROMPT: `Create a 3-question multiple-choice quiz based on the following text. 
    Return ONLY a valid JSON object with this exact structure:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0,
          "explanation": "Brief explanation of why this is correct"
        }
      ]
    }`,
    FLASHCARD_PROMPT: `Create 5 flashcards from the following study material. 
    Return ONLY a valid JSON object with this exact structure:
    {
      "flashcards": [
        {
          "front": "Question or term",
          "back": "Answer or definition"
        }
      ]
    }`
  }
};

// Helper functions for configuration access
export const getConfig = (path) => {
  const keys = path.split('.');
  let value = API_CONFIG;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

export const validateConfig = () => {
  const requiredKeys = [
    'OPENAI.API_KEY',
    'DATABASE.SUPABASE_URL',
    'DATABASE.SUPABASE_ANON_KEY'
  ];
  
  for (const key of requiredKeys) {
    const value = getConfig(key);
    if (!value || value.includes('YOUR_') || value.includes('HERE')) {
      return false;
    }
  }
  
  return true;
};

export const getEnvironmentConfig = () => {
  return {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  };
};
