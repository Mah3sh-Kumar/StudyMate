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
    API_KEY: getEnvVar('EXPO_PUBLIC_OPENAI_API_KEY'),
    BASE_URL: getEnvVar('EXPO_PUBLIC_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    MODELS: {
      CHAT: { model: 'gpt-4o', max_tokens: 2000, temperature: 0.7 },
      ANALYSIS: { model: 'gpt-4o-mini', max_tokens: 1500, temperature: 0.3 },
      GENERATION: { model: 'gpt-3.5-turbo-1106', max_tokens: 1000, temperature: 0.2 },
      IMAGE: { model: 'dall-e-3', size: '1024x1024', quality: 'standard' },
      AUDIO: { model: 'whisper-1' }
    }
  },

  // Groq Configuration (Fast & Free Tier)
  GROQ: {
    API_KEY: getEnvVar('EXPO_PUBLIC_GROQ_API_KEY'),
    BASE_URL: 'https://api.groq.com/openai/v1',
    MODELS: {
      CHAT: { model: 'llama-3.3-70b-versatile', max_tokens: 4000, temperature: 0.7 },
      ANALYSIS: { model: 'llama-3.1-8b-instant', max_tokens: 2000, temperature: 0.3 },
      GENERATION: { model: 'llama-3.3-70b-versatile', max_tokens: 2000, temperature: 0.2 }, // Use 70b for better JSON following
      IMAGE: null, // Groq does not support image generation
      AUDIO: { model: 'whisper-large-v3' }
    }
  },

  // OpenRouter Configuration (Wide variety of models)
  OPENROUTER: {
    API_KEY: getEnvVar('openrouter_api_key'),
    BASE_URL: 'https://openrouter.ai/api/v1',
    MODELS: {
      CHAT: { model: 'google/gemini-2.0-flash-exp:free', max_tokens: 2000, temperature: 0.7 }, // Free and fast
      ANALYSIS: { model: 'google/gemini-2.0-flash-exp:free', max_tokens: 2000, temperature: 0.3 },
      GENERATION: { model: 'google/gemini-2.0-flash-exp:free', max_tokens: 2000, temperature: 0.2 },
      IMAGE: { model: 'stabilityai/stable-diffusion-xl-base-1.0' },
      AUDIO: null // OpenRouter handles text/image mainly
    }
  },

  // Active Provider Settings
  // Options: 'OPENAI', 'GROQ', 'OPENROUTER'
  PROVIDER: {
    TEXT: 'GROQ', // Default to Groq for speed
    IMAGE: 'OPENROUTER', // Default to OpenRouter for images (if OpenAI not avail)
    AUDIO: 'GROQ' // Groq has Whisper
  },

  // Global settings
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.3,

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

    // Study Plan generation
    PLAN: {
      prompt: `Create a one-day study plan based on the following subjects and goals.
      Return ONLY a valid JSON array of objects with this structure:
      [
        { "id": "1", "time": "9:00 AM - 10:00 AM", "subject": "Subject", "task": "Description", "completed": false }
      ]
      Generate at least 3 items.`,
      max_tokens: 1500,
      temperature: 0.2
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
// Runtime configuration overrides
const runtimeOverrides = {};

export const setRuntimeConfig = (key, value) => {
  runtimeOverrides[key] = value;
};

// Helper functions for configuration access
export const getConfig = (path) => {
  // Check runtime overrides first
  if (path in runtimeOverrides) {
    return runtimeOverrides[path];
  }

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

// Get active provider for a task type (TEXT, IMAGE, AUDIO)
export const getActiveProvider = (taskType = 'TEXT') => {
  const taskCategory = taskType === 'IMAGE' ? 'IMAGE' : (taskType === 'AUDIO' ? 'AUDIO' : 'TEXT');
  return getConfig(`PROVIDER.${taskCategory}`) || 'OPENAI';
};

// Get active provider configuration
export const getActiveProviderConfig = (taskType = 'TEXT') => {
  const provider = getActiveProvider(taskType);
  return getConfig(provider);
};

// Get model configuration for specific task
export const getModelConfig = (task) => {
  // task is usually CHAT, ANALYSIS, GENERATION, IMAGE, AUDIO
  // We determine the provider type based on the task
  let taskType = 'TEXT';
  if (task === 'IMAGE') taskType = 'IMAGE';
  if (task === 'AUDIO') taskType = 'AUDIO';

  const providerConfig = getActiveProviderConfig(taskType);
  const models = providerConfig && providerConfig.MODELS ? providerConfig.MODELS : getConfig('OPENAI.MODELS');

  if (!models) return undefined;

  return models[task.toUpperCase()] || models.ANALYSIS;
};

// Get AI prompt configuration for specific feature
export const getAIPromptConfig = (feature) => {
  const ai = getConfig('AI');
  return ai[feature.toUpperCase()] || ai.SUMMARY; // Default to SUMMARY if feature not found
};

export const validateConfig = () => {
  const provider = getActiveProvider('TEXT');
  const requiredKeys = [
    `${provider}.API_KEY`,
    'DATABASE.SUPABASE_URL',
    'DATABASE.SUPABASE_ANON_KEY'
  ];

  for (const key of requiredKeys) {
    const value = getConfig(key);
    if (!value || value.trim() === '') {
      console.warn(`Missing config: ${key}`);
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
