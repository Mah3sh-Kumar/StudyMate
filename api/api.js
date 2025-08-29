import { API_CONFIG, getConfig, validateConfig } from '../config/api-config';

// Validate configuration on import
if (!validateConfig()) {
  console.warn('StudyMate API: Configuration validation failed. Some features may not work.');
}

const OPENAI_API_KEY = getConfig('OPENAI.API_KEY') || 'YOUR_OPENAI_API_KEY';
const API_URL = getConfig('OPENAI.BASE_URL') || 'https://api.openai.com/v1';
const MODEL = getConfig('OPENAI.MODEL') || 'gpt-3.5-turbo';
const MAX_TOKENS = getConfig('OPENAI.MAX_TOKENS') || 1000;
const TEMPERATURE = getConfig('OPENAI.TEMPERATURE') || 0.3;

/**
 * Gets a response from the GPT model for the chat assistant.
 * @param {Array} messages - The conversation history.
 * @returns {Promise<string>} The AI's response text.
 */
export const getAIChatResponse = async (messages) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting AI chat response:", error);
    throw new Error("Sorry, I couldn't connect to the AI assistant right now.");
  }
};

/**
 * Summarizes a given block of text using OpenAI.
 * @param {string} textToSummarize - The notes or document text.
 * @returns {Promise<string>} The summarized text.
 */
export const summarizeTextWithOpenAI = async (textToSummarize) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  try {
    const prompt = getConfig('AI.SUMMARY_PROMPT') + `\n\n${textToSummarize}`;
    const messages = [{ role: 'user', content: prompt }];
    return await getAIChatResponse(messages);
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};

/**
 * Generates a multiple-choice quiz from a given text.
 * @param {string} contextText - The text to base the quiz on.
 * @returns {Promise<Object>} A quiz object with questions array.
 */
export const generateQuizWithOpenAI = async (contextText) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  const prompt = getConfig('AI.QUIZ_PROMPT') + `\n\nText to base quiz on: ${contextText}`;
  
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106', // Use a model that's good with JSON
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
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
    throw new Error("Failed to generate quiz. Please try again.");
  }
};

/**
 * Generates an image using DALL-E.
 * @param {string} prompt - The text description for the image.
 * @returns {Promise<string>} The URL of the generated image.
 */
export const generateImageWithOpenAI = async (prompt) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  try {
    const response = await fetch(`${API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: '1024x1024',
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
 * @param {string} studyMaterial - The text to generate flashcards from.
 * @returns {Promise<Array>} Array of flashcard objects.
 */
export const generateFlashcardsWithOpenAI = async (studyMaterial) => {
  if (!getConfig('FEATURES.ENABLE_AI_FEATURES')) {
    throw new Error('AI features are disabled in this environment');
  }

  try {
    const prompt = getConfig('AI.FLASHCARD_PROMPT') + `\n\nStudy material: ${studyMaterial}`;
    
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: TEMPERATURE,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const flashcardData = JSON.parse(data.choices[0].message.content);
    
    if (!flashcardData.flashcards || !Array.isArray(flashcardData.flashcards)) {
      throw new Error('Invalid flashcard format received from AI');
    }
    
    return flashcardData.flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please try again.");
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
    model: MODEL,
    maxTokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    baseUrl: API_URL
  };
};
