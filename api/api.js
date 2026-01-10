import { API_CONFIG, getConfig, validateConfig, getModelConfig, getAIPromptConfig } from '../config/api-config.js';

// Validate configuration on import
if (!validateConfig()) {
  console.warn('StudyMate API: Configuration validation failed. Some features may not work.');
}

const OPENAI_API_KEY = getConfig('OPENAI.API_KEY');
const API_URL = getConfig('OPENAI.BASE_URL') || 'https://api.openai.com/v1';

// Check if API key is configured
if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is not configured. Please check your api-config.js file.');
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
 * Enhanced error handling for OpenAI API responses
 */
const handleOpenAIError = (response, errorData) => {
  const status = response.status;
  
  switch (status) {
    case 400:
      throw new Error('Bad request: Please check your input.');
    case 401:
      throw new Error('Authentication failed. Please check your API configuration.');
    case 403:
      throw new Error('Access denied. Please check your API permissions.');
    case 404:
      throw new Error('Model not found. Please check your model configuration.');
    case 429:
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    case 500:
      throw new Error('Service temporarily unavailable. Please try again later.');
    case 502:
    case 503:
    case 504:
      throw new Error('Service temporarily unavailable. Please try again later.');
    default:
      throw new Error(`API request failed with status ${status}`);
  }
};

/**
 * Gets a response from the GPT model for the chat assistant.
 * Uses GPT-4o for best conversation quality.
 * @param {Array} messages - The conversation history.
 * @returns {Promise<string>} The AI's response text.
 */
export const getAIChatResponse = async (messages) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please check your configuration.');
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
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
        const errorData = await response.json().catch(() => ({}));
        handleOpenAIError(response, errorData);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error getting AI chat response:", error);
      
      // Don't expose raw error messages
      if (error.message.includes('rate limit')) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      } else if (error.message.includes('authentication')) {
        throw new Error("Authentication failed. Please check your API configuration.");
      } else {
        throw new Error("Sorry, I couldn't connect to the AI assistant right now. Please try again later.");
      }
    }
  };

  return retryWithBackoff(makeRequest);
};

/**
 * Summarizes a given block of text using OpenAI.
 * Uses GPT-4o-mini for cost-effective analysis.
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

  if (textToSummarize.length > 10000) {
    throw new Error('Text to summarize is too long');
  }

  const analysisConfig = getModelConfig('ANALYSIS');
  const promptConfig = getAIPromptConfig('SUMMARY');

  try {
    const prompt = promptConfig.prompt + `\n\n${textToSummarize}`;
    const messages = [{ role: 'user', content: prompt }];
    
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: analysisConfig.model,
        messages: messages,
        max_tokens: promptConfig.max_tokens,
        temperature: promptConfig.temperature,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      handleOpenAIError(response, errorData);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error summarizing text:", error);
    // Don't expose raw error messages
    throw new Error("Failed to summarize text. Please try again.");
  }
};

/**
 * Generates a multiple-choice quiz from a given text.
 * Uses GPT-3.5-turbo-1106 for reliable JSON output.
 * @param {string} contextText - The text to base the quiz on.
 * @returns {Promise<Object>} A quiz object with questions array.
 */
export const generateQuizWithOpenAI = async (contextText) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  // Validate input
  if (typeof contextText !== 'string' || contextText.length === 0) {
    throw new Error('Invalid context text for quiz generation');
  }

  if (contextText.length > 10000) {
    throw new Error('Context text is too long for quiz generation');
  }

  const generationConfig = getModelConfig('GENERATION');
  const promptConfig = getAIPromptConfig('QUIZ');
  const prompt = promptConfig.prompt + `\n\nText to base quiz on: ${contextText}`;
  
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      const errorData = await response.json().catch(() => ({}));
      handleOpenAIError(response, errorData);
    }
    
    const data = await response.json();
    const quizData = JSON.parse(data.choices[0].message.content);
    
    // Validate the response structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format received from AI');
    }
    
    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Don't expose raw error messages
    throw new Error("Failed to generate quiz. Please try again.");
  }
};

/**
 * Generates an image using DALL-E 3.
 * Uses DALL-E 3 for high-quality educational images.
 * @param {string} prompt - The text description for the image.
 * @param {Object} options - Optional parameters for image generation.
 * @returns {Promise<string>} The URL of the generated image.
 */
export const generateImageWithOpenAI = async (prompt, options = {}) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  const imageConfig = getModelConfig('IMAGE');
  const promptConfig = getAIPromptConfig('IMAGE');
  
  // Combine default prompt with user prompt
  const fullPrompt = promptConfig.default_prompt + prompt + '. ' + promptConfig.style_guide;

  try {
    const response = await fetch(`${API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: imageConfig.model,
        prompt: fullPrompt,
        n: 1,
        size: options.size || imageConfig.size,
        quality: options.quality || imageConfig.quality,
        style: options.style || imageConfig.style,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

/**
 * Generates flashcards from study material.
 * Uses GPT-3.5-turbo-1106 for reliable JSON output.
 * @param {string} studyMaterial - The text to generate flashcards from.
 * @returns {Promise<Array>} Array of flashcard objects.
 */
export const generateFlashcardsWithOpenAI = async (studyMaterial) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  // Validate input
  if (typeof studyMaterial !== 'string' || studyMaterial.length === 0) {
    throw new Error('Invalid study material for flashcard generation');
  }

  if (studyMaterial.length > 10000) {
    throw new Error('Study material is too long for flashcard generation');
  }

  const generationConfig = getModelConfig('GENERATION');
  const promptConfig = getAIPromptConfig('FLASHCARD');
  const prompt = promptConfig.prompt + `\n\nStudy material: ${studyMaterial}`;
  
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      const errorData = await response.json().catch(() => ({}));
      handleOpenAIError(response, errorData);
    }
    
    const data = await response.json();
    const flashcardData = JSON.parse(data.choices[0].message.content);
    
    if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards)) {
      throw new Error('Invalid flashcard format received from AI');
    }
    
    return flashcardData.flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    // Don't expose raw error messages
    throw new Error("Failed to generate flashcards. Please try again.");
  }
};

/**
 * Transcribes audio to text using Whisper.
 * Uses Whisper-1 for high-quality audio transcription.
 * @param {File|Blob} audioFile - The audio file to transcribe.
 * @param {Object} options - Optional parameters for transcription.
 * @returns {Promise<string>} The transcribed text.
 */
export const transcribeAudioWithOpenAI = async (audioFile, options = {}) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  const audioConfig = getModelConfig('AUDIO');
  
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', audioConfig.model);
    formData.append('response_format', options.response_format || audioConfig.response_format);
    formData.append('language', options.language || audioConfig.language);
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    const response = await fetch(`${API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio. Please try again.");
  }
};

/**
 * Check if AI features are enabled
 * @returns {boolean} True if AI features are enabled
 */
export const isAIEnabled = () => {
  return getConfig('FEATURES.ENABLE_AI_FEATURES') === true;
};

/**
 * Get current API configuration
 * @returns {Object} Current API configuration
 */
export const getAPIConfig = () => {
  return {
    isAIEnabled: isAIEnabled(),
    models: getConfig('OPENAI.MODELS'),
    baseUrl: API_URL
  };
};

/**
 * Get available AI models and their descriptions
 * @returns {Object} Object containing model information
 */
export const getAvailableModels = () => {
  const models = getConfig('OPENAI.MODELS');
  const modelInfo = {};
  
  Object.keys(models).forEach(key => {
    modelInfo[key] = {
      model: models[key].model,
      description: models[key].description,
      max_tokens: models[key].max_tokens,
      temperature: models[key].temperature
    };
  });
  
  return modelInfo;
};
