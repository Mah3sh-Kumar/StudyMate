import Constants from 'expo-constants';

// Environment configuration utility
const getEnvVar = (name, defaultValue = null) => {
  // Try to get from expo constants
  const value = Constants.expoConfig?.extra?.[name] || 
                process.env[name] || 
                Constants.manifest?.extra?.[name];
  
  if (!value && defaultValue === null) {
    console.warn(`Environment variable ${name} is not set`);
  }
  
  return value || defaultValue;
};

// Environment configuration
export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: getEnvVar('SUPABASE_URL', 'https://oyvmxabdpcnutnrzmpgc.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dm14YWJkcGNudXRucnptcGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTU1NDEsImV4cCI6MjA3MjAzMTU0MX0.cCwzpiuuufGODI3RzWeTfWqBZ45IAV-qcVqFUfaHWt8'),
  
  // OpenAI Configuration (from existing .env)
  OPENAI_API_KEY: getEnvVar('AI_api_key', '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'),
  OPENAI_BASE_URL: getEnvVar('AI_BASE_URL', 'https://api.openai.com/v1'),
  
  // Development flags
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__
};

// Validation function
export const validateEnvironment = () => {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = [];
  
  required.forEach(key => {
    if (!ENV_CONFIG[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};

// Helper to get Supabase config
export const getSupabaseConfig = () => ({
  url: ENV_CONFIG.SUPABASE_URL,
  anonKey: ENV_CONFIG.SUPABASE_ANON_KEY
});

// Helper to get OpenAI config
export const getOpenAIConfig = () => ({
  apiKey: ENV_CONFIG.OPENAI_API_KEY,
  baseURL: ENV_CONFIG.OPENAI_BASE_URL
});

export default ENV_CONFIG;