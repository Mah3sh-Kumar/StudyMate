import { API_CONFIG, getConfig, validateConfig, getModelConfig, getAIPromptConfig, getActiveProviderConfig, getActiveProvider } from '../config/api-config.js';
import { handleAPIError } from '../utils/errorHandler';

// Validate configuration on import
if (!validateConfig()) {
  console.warn('StudyMate API: Configuration validation failed. Some features may not work.');
}

// Rate limiting and retry configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  rateLimitDelay: 60000, // 1 minute for rate limits
};

/**
 * Implements exponential backoff retry logic
 */
const retryWithBackoff = async (fn, retries = RATE_LIMIT_CONFIG.maxRetries) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    // Check if it's a rate limit error
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.warn(`Rate limit hit, waiting ${RATE_LIMIT_CONFIG.rateLimitDelay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_CONFIG.rateLimitDelay));
    } else {
      // Exponential backoff for other errors
      const delay = Math.min(
        RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, RATE_LIMIT_CONFIG.maxRetries - retries),
        RATE_LIMIT_CONFIG.maxDelay
      );
      console.warn(`API error, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return retryWithBackoff(fn, retries - 1);
  }
};

/**
 * Enhanced error handling for AI API responses
 */
const handleAIResponseError = (response, errorData) => {
  const status = response.status;
  let errorMessage = '';

  // Try to get specific error message from response
  if (errorData && errorData.error && errorData.error.message) {
    errorMessage = errorData.error.message;
  } else if (errorData && errorData.message) {
    errorMessage = errorData.message;
  } else {
    errorMessage = `API request failed with status ${status}`;
  }

  switch (status) {
    case 400:
      console.error('Bad Request Error Details:', errorData);
      throw new Error(`Bad request: ${errorMessage}`);
    case 401:
      console.error('Authentication Error Details:', errorData);
      throw new Error('Authentication failed. Please check your API configuration: ' + errorMessage);
    case 403:
      console.error('Forbidden Error Details:', errorData);
      throw new Error('Access denied. Please check your API permissions: ' + errorMessage);
    case 404:
      console.error('Not Found Error Details:', errorData);
      throw new Error('Model not found. Please check your model configuration: ' + errorMessage);
    case 429:
      console.error('Rate Limit Error Details:', errorData);
      throw new Error('Rate limit exceeded. Please wait a moment and try again: ' + errorMessage);
    case 500:
      console.error('Server Error Details:', errorData);
      throw new Error('Service temporarily unavailable. Please try again later: ' + errorMessage);
    case 502:
    case 503:
    case 504:
      console.error('Service Unavailable Error Details:', errorData);
      throw new Error('Service temporarily unavailable. Please try again later: ' + errorMessage);
    default:
      console.error('Unexpected Error Details:', errorData);
      throw new Error(errorMessage);
  }
};

/**
 * Helper to parse JSON from AI response, handling markdown blocks.
 */
const parseAIJSON = (content) => {
  if (!content) return null;
  let jsonString = content;

  // Strip markdown code blocks if present
  if (content.includes('```json')) {
    jsonString = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    jsonString = content.split('```')[1].split('```')[0].trim();
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI JSON:", e);
    // Try to find the first '{' and last '}' as a fallback
    try {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(content.substring(firstBrace, lastBrace + 1));
      }
    } catch (e2) {
      console.error("Fallback JSON parsing failed:", e2);
    }
    throw new Error("AI returned invalid JSON format");
  }
};

/**
 * Gets a response from the AI model (Groq/OpenAI/OpenRouter).
 * @param {Array} messages - The conversation history.
 * @returns {Promise<string>} The AI's response text.
 */
export const getAIChatResponse = async (messages) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  const providerConfig = getActiveProviderConfig('TEXT');
  if (!providerConfig || !providerConfig.API_KEY) {
    throw new Error('AI API key is not configured.');
  }

  // Validate inputs
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  // Limit message length to prevent injection
  for (const message of messages) {
    if (typeof message.content !== 'string' || message.content.length > 5000) {
      throw new Error('Message content is too long');
    }
  }

  const chatConfig = getModelConfig('CHAT');
  const promptConfig = getAIPromptConfig('CHAT');

  const makeRequest = async () => {
    try {
      const response = await fetch(`${providerConfig.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.API_KEY}`,
          'HTTP-Referer': 'https://studymate.app', // Required for OpenRouter
          'X-Title': 'StudyMate App', // Required for OpenRouter
        },
        body: JSON.stringify({
          model: chatConfig.model,
          messages: [
            { role: 'system', content: promptConfig.system_prompt },
            ...messages
          ],
          max_tokens: chatConfig.max_tokens,
          temperature: chatConfig.temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData = {};
        
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If response is not JSON, include the raw text
          errorData = { message: errorText, error: errorText };
        }
        
        handleAIResponseError(response, {
          url: `${providerConfig.BASE_URL}/chat/completions`,
          method: 'POST',
          status: response.status,
          statusText: response.statusText,
          ...errorData
        });
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error getting AI chat response:", error);

      // Use centralized error handling
      const normalizedError = handleAPIError(error, {
        url: `${providerConfig.BASE_URL}/chat/completions`,
        method: 'POST',
        purpose: 'AI Chat Response'
      });

      // Don't expose raw error messages to users
      if (normalizedError.technicalMessage.includes('rate limit')) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (normalizedError.technicalMessage.includes('authentication') || normalizedError.technicalMessage.includes('401')) {
        throw new Error("Authentication failed. Please check your API configuration.");
      } else {
        throw new Error("Sorry, I couldn't connect to the AI assistant right now. Please try again later.");
      }
    }
  };

  return retryWithBackoff(makeRequest);
};

/**
 * Summarizes a given block of text using AI.
 * @param {string} textToSummarize - The notes or document text.
 * @returns {Promise<string>} The summarized text.
 */
export const summarizeTextWithOpenAI = async (textToSummarize) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  // Validate input
  if (typeof textToSummarize !== 'string' || textToSummarize.length === 0) {
    throw new Error('Invalid text to summarize');
  }

  if (textToSummarize.length > 20000) { // Increased limit for Llama 3
    throw new Error('Text to summarize is too long');
  }

  const providerConfig = getActiveProviderConfig('TEXT');
  const analysisConfig = getModelConfig('ANALYSIS');
  const promptConfig = getAIPromptConfig('SUMMARY');

  try {
    const prompt = promptConfig.prompt + `\n\n${textToSummarize}`;
    const messages = [{ role: 'user', content: prompt }];

    const response = await fetch(`${providerConfig.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
        'HTTP-Referer': 'https://studymate.app',
        'X-Title': 'StudyMate App',
      },
      body: JSON.stringify({
        model: analysisConfig.model,
        messages: messages,
        max_tokens: promptConfig.max_tokens,
        temperature: promptConfig.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}/chat/completions`,
        method: 'POST',
        purpose: 'Text Summarization',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error summarizing text:", error);
    handleAPIError(error, {
      url: `${providerConfig.BASE_URL}/chat/completions`,
      method: 'POST',
      purpose: 'Text Summarization'
    });
    throw new Error("Failed to summarize text. Please try again.");
  }
};

/**
 * Generates a multiple-choice quiz.
 * @param {string} contextText - The text to base the quiz on.
 * @returns {Promise<Object>} A quiz object with questions array.
 */
export const generateQuizWithOpenAI = async (contextText) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  if (typeof contextText !== 'string' || contextText.length === 0) {
    throw new Error('Invalid context text');
  }

  const providerConfig = getActiveProviderConfig('TEXT');
  const generationConfig = getModelConfig('GENERATION');
  const promptConfig = getAIPromptConfig('QUIZ');
  const prompt = promptConfig.prompt + `\n\nText to base quiz on: ${contextText}`;

  try {
    const response = await fetch(`${providerConfig.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
        'HTTP-Referer': 'https://studymate.app',
        'X-Title': 'StudyMate App',
      },
      body: JSON.stringify({
        model: generationConfig.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }, // Supported by OpenAI and Groq for Llama 3
        max_tokens: promptConfig.max_tokens,
        temperature: promptConfig.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}/chat/completions`,
        method: 'POST',
        purpose: 'Quiz Generation',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    const quizData = parseAIJSON(data.choices[0].message.content);

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format received from AI');
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    handleAPIError(error, {
      url: `${providerConfig.BASE_URL}/chat/completions`,
      method: 'POST',
      purpose: 'Quiz Generation'
    });
    throw new Error("Failed to generate quiz. Please try again.");
  }
};

/**
 * Generates flashcards from study material.
 * @param {string} studyMaterial - The text to generate flashcards from.
 * @returns {Promise<Array>} Array of flashcard objects.
 */
export const generateFlashcardsWithOpenAI = async (studyMaterial) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  if (typeof studyMaterial !== 'string' || studyMaterial.length === 0) {
    throw new Error('Invalid study material');
  }

  const providerConfig = getActiveProviderConfig('TEXT');
  const generationConfig = getModelConfig('GENERATION');
  const promptConfig = getAIPromptConfig('FLASHCARD');
  const prompt = promptConfig.prompt + `\n\nStudy material: ${studyMaterial}`;

  try {
    const response = await fetch(`${providerConfig.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
        'HTTP-Referer': 'https://studymate.app',
        'X-Title': 'StudyMate App',
      },
      body: JSON.stringify({
        model: generationConfig.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: promptConfig.max_tokens,
        temperature: promptConfig.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}/chat/completions`,
        method: 'POST',
        purpose: 'Flashcard Generation',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    const flashcardData = parseAIJSON(data.choices[0].message.content);

    if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards)) {
      throw new Error('Invalid flashcard format received from AI');
    }

    return flashcardData.flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    handleAPIError(error, {
      url: `${providerConfig.BASE_URL}/chat/completions`,
      method: 'POST',
      purpose: 'Flashcard Generation'
    });
    throw new Error("Failed to generate flashcards. Please try again.");
  }
};

/**
 * Generates a study plan.
 * @param {string} subjects - List of subjects.
 * @param {string} goals - Study goals.
 * @returns {Promise<Array>} Array of plan items.
 */
export const generateStudyPlanWithAI = async (subjects, goals) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled');
  }

  const providerConfig = getActiveProviderConfig('TEXT');
  const generationConfig = getModelConfig('GENERATION');
  const promptConfig = getAIPromptConfig('PLAN');

  const fullPrompt = `${promptConfig.prompt}\n\nSubjects: ${subjects}\nGoals: ${goals}`;

  try {
    const response = await fetch(`${providerConfig.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
        'HTTP-Referer': 'https://studymate.app',
        'X-Title': 'StudyMate App',
      },
      body: JSON.stringify({
        model: generationConfig.model,
        messages: [{ role: 'user', content: fullPrompt }],
        max_tokens: promptConfig.max_tokens,
        temperature: promptConfig.temperature,
        // Not enforcing json_object here as some models struggle with it without schema
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}/chat/completions`,
        method: 'POST',
        purpose: 'Study Plan Generation',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const planData = parseAIJSON(content);
      return Array.isArray(planData) ? planData : [];
    } catch (e) {
      console.error("Failed to parse plan JSON", e);
      throw new Error("AI returned invalid format");
    }

  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
};

/**
 * Generates an image.
 * Uses OpenRouter or OpenAI if configured.
 * @param {string} prompt - The text description.
 * @returns {Promise<string>} The URL of the generated image.
 */
export const generateImageWithOpenAI = async (prompt, options = {}) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  // Get IMAGE provider settings (defaults to OpenRouter if configured so)
  const providerConfig = getActiveProviderConfig('IMAGE');
  const imageConfig = getModelConfig('IMAGE');
  const promptConfig = getAIPromptConfig('IMAGE');

  const fullPrompt = promptConfig.default_prompt + prompt + '. ' + promptConfig.style_guide;

  // IMPORTANT: Groq does not support images. If provider is Groq but IMAGE provider falls back to OpenAI/OpenRouter, we are good.
  // Our config ensures IMAGE provider is OpenRouter or OpenAI.

  try {
    // If using OpenAI or compatible endpoint
    const endpoint = providerConfig.BASE_URL.includes('openai.com') ? '/images/generations' : '/images/generations';
    // OpenRouter uses different endpoints for images usually?
    // Actually OpenRouter standardizes text. For images, we might need specific handling if using Stable Diffusion via OpenRouter.
    // However, OpenRouter's /chat/completions allows some image models? 
    // Standard OpenAI image API is /images/generations. OpenRouter might not support this endpoint fully for all models.
    // Ideally we use a text-to-image API.
    // For now, let's assume OpenRouter supports /images/generations OR we use OpenAI if the key is there.
    // If provider is OpenRouter, check documentation...
    // Let's stick to /images/generations as standard.

    const response = await fetch(`${providerConfig.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
        'HTTP-Referer': 'https://studymate.app',
        'X-Title': 'StudyMate App',
      },
      body: JSON.stringify({
        model: imageConfig.model,
        prompt: fullPrompt,
        n: 1,
        size: options.size || imageConfig.size,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      console.error("Image gen error", errorData);
      
      // Use handleAIResponseError for consistency
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}${endpoint}`,
        method: 'POST',
        purpose: 'Image Generation',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

/**
 * Transcribes audio to text.
 */
export const transcribeAudioWithOpenAI = async (audioFile, options = {}) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled');
  }

  const providerConfig = getActiveProviderConfig('AUDIO');
  const audioConfig = getModelConfig('AUDIO');

  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', audioConfig.model);
    formData.append('language', options.language || 'en');

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    const response = await fetch(`${providerConfig.BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${providerConfig.API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If response is not JSON, include the raw text
        errorData = { message: errorText, error: errorText };
      }
      
      // Use handleAIResponseError for consistency
      handleAIResponseError(response, {
        url: `${providerConfig.BASE_URL}/audio/transcriptions`,
        method: 'POST',
        purpose: 'Audio Transcription',
        status: response.status,
        statusText: response.statusText,
        ...errorData
      });
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio.");
  }
};

export const isAIEnabled = () => {
  return getConfig('FEATURES.ENABLE_AI_FEATURES') === true;
};

export const getAPIConfig = () => {
  const provider = getActiveProvider('TEXT');
  const providerConfig = getActiveProviderConfig('TEXT');
  return {
    isAIEnabled: isAIEnabled(),
    models: providerConfig.MODELS,
    baseUrl: providerConfig.BASE_URL,
    provider: provider
  };
};

export const getAvailableModels = () => {
  const providerConfig = getActiveProviderConfig('TEXT');
  const models = providerConfig.MODELS;
  const modelInfo = {};

  if (models) {
    Object.keys(models).forEach(key => {
      modelInfo[key] = {
        model: models[key] && models[key].model ? models[key].model : (models[key] || 'Unknown'),
        description: 'AI Model'
      };
    });
  }

  return modelInfo;
};
