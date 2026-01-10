// API Configuration for StudyMate
// Copy this file to config/api-config.js and update with your actual values
import Constants from 'expo-constants';

// Helper function to get environment variables
const getEnvVar = (key, fallback = '') => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || fallback;
};

export const API_CONFIG = {
  // OpenAI Configuration
  OPENAI: {
    API_KEY: getEnvVar('EXPO_PUBLIC_OPENAI_API_KEY'), // Get from environment variables
    BASE_URL: getEnvVar('EXPO_PUBLIC_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    
    // Model-specific configurations for different tasks
    MODELS: {
      // Text-based conversations and general AI assistance
      CHAT: {
        model: 'gpt-4o', // Best for real-time conversation and complex reasoning
        max_tokens: 2000,
        temperature: 0.3,
        description: 'Real-time conversation, complex reasoning, and general assistance'
      },
      
      // Text analysis and summarization
      ANALYSIS: {
        model: 'gpt-4o-mini', // Good balance of quality and cost for analysis
        max_tokens: 1500,
        temperature: 0.2,
        description: 'Text analysis, summarization, and content processing'
      },
      
      // Quiz and flashcard generation
      GENERATION: {
        model: 'gpt-3.5-turbo-1106', // Excellent for structured JSON output
        max_tokens: 1000,
        temperature: 0.1,
        description: 'Structured content generation (quizzes, flashcards, etc.)'
      },
      
      // Image generation
      IMAGE: {
        model: 'dall-e-3', // High-quality image generation
        size: '1024x1024',
        quality: 'standard', // 'standard' or 'hd'
        style: 'natural', // 'natural' or 'vivid'
        description: 'Art & design generation from text descriptions'
      },
      
      // Audio transcription
      AUDIO: {
        model: 'whisper-1', // Audio to text transcription
        response_format: 'text',
        language: 'en', // Default language
        description: 'Transcription from speech and audio files'
      }
    },
    
    // Global settings
    DEFAULT_MAX_TOKENS: 1000,
    DEFAULT_TEMPERATURE: 0.3
  },

  // Database Configuration
  DATABASE: {
    SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://koozfphoybhwzqolmgzn.supabase.co'), // Get from Supabase dashboard
    SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
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
    ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'mp3', 'wav', 'm4a'],
    STORAGE_BUCKET: 'study-materials'
  },

  // AI Generation Prompts with model-specific configurations
  AI: {
    // Chat and conversation prompts
    CHAT: {
      system_prompt: 'You are StudyMate, an intelligent study assistant. Help students with their studies, answer questions, and provide guidance in a friendly and educational manner.',
      max_tokens: 2000,
      temperature: 0.3
    },
    
    // Summary generation
    SUMMARY: {
      prompt: 'Please summarize the following text into 5-7 key bullet points. Focus on the main concepts and important details:',
      max_tokens: 1500,
      temperature: 0.2
    },
    
    // Quiz generation
    QUIZ: {
      prompt: `Create a 3-question multiple-choice quiz based on the following text. 
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
      max_tokens: 1000,
      temperature: 0.1
    },
    
    // Flashcard generation
    FLASHCARD: {
      prompt: `Create 5 flashcards from the following study material. 
      Return ONLY a valid JSON object with this exact structure:
      {
        "flashcards": [
          {
            "front": "Question or term",
            "back": "Answer or definition"
          }
        ]
      }`,
      max_tokens: 800,
      temperature: 0.1
    },
    
    // Image generation
    IMAGE: {
      default_prompt: 'Create an educational illustration that helps explain the concept: ',
      style_guide: 'Educational, clear, professional, suitable for students'
    },
    
    // Audio transcription
    AUDIO: {
      supported_formats: ['mp3', 'wav', 'm4a', 'flac'],
      max_file_size_mb: 25,
      language_detection: true
    }
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

// Get model configuration for specific task
export const getModelConfig = (task) => {
  const models = getConfig('OPENAI.MODELS');
  return models[task.toUpperCase()] || models.ANALYSIS; // Default to ANALYSIS if task not found
};

// Get AI prompt configuration for specific feature
export const getAIPromptConfig = (feature) => {
  const ai = getConfig('AI');
  return ai[feature.toUpperCase()] || ai.SUMMARY; // Default to SUMMARY if feature not found
};

export const validateConfig = () => {
  const requiredKeys = [
    'OPENAI.API_KEY',
    'DATABASE.SUPABASE_URL',
    'DATABASE.SUPABASE_ANON_KEY'
  ];
  
  for (const key of requiredKeys) {
    const value = getConfig(key);
    if (!value || value.trim() === '') {
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
