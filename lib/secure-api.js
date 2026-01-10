import { supabase } from './supabase';

/**
 * Secure API service to handle API calls through a backend proxy
 * This helps protect sensitive API keys from client-side exposure
 */

export const secureApiService = {
  /**
   * Make a secure request to the backend API proxy
   */
  async makeSecureRequest(endpoint, data, method = 'POST') {
    try {
      // In a real implementation, this would call your backend proxy
      // For now, we'll simulate the structure
      
      // Validate inputs to prevent injection
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint');
      }
      
      // Sanitize data to prevent injection
      const sanitizedData = this.sanitizeData(data);
      
      // In a real implementation, call your backend proxy
      // const response = await fetch(`${BACKEND_PROXY_URL}/${endpoint}`, {
      //   method,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${authToken}`,
      //   },
      //   body: JSON.stringify(sanitizedData)
      // });
      
      // For now, return a simulated response to maintain compatibility
      // This is a temporary solution until a proper backend proxy is implemented
      console.warn('Secure API proxy not implemented. Using direct API call.');
      return { error: 'Secure API proxy not implemented. Use direct API calls for now.' };
    } catch (error) {
      console.error('Secure API request failed:', error);
      throw new Error('API request failed');
    }
  },

  /**
   * Sanitize data to prevent injection attacks
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const sanitized = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        // Prevent potential injection by sanitizing strings
        if (typeof value === 'string') {
          sanitized[key] = value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  },

  /**
   * Validate user input before sending to API
   */
  validateInput(input, type) {
    switch (type) {
      case 'text':
        if (typeof input !== 'string' || input.length > 10000) {
          throw new Error('Invalid text input');
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          throw new Error('Invalid email format');
        }
        break;
      case 'username':
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        if (!usernameRegex.test(input)) {
          throw new Error('Invalid username format');
        }
        break;
      default:
        break;
    }
    return true;
  }
};

// Wrapper functions for specific API calls
export const aiServices = {
  async getChatResponse(messages) {
    // Validate inputs
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages format');
    }
    
    // In a real implementation, this would call the secure API
    // For now, we'll log that the secure approach should be used
    console.warn('Direct API call detected. Implement secure proxy for production.');
    return { error: 'Use direct API call for now. Implement secure proxy for production.' };
  },

  async summarizeText(text) {
    try {
      secureApiService.validateInput(text, 'text');
      console.warn('Direct API call detected. Implement secure proxy for production.');
      return { error: 'Use direct API call for now. Implement secure proxy for production.' };
    } catch (error) {
      throw error;
    }
  },

  async generateQuiz(contextText) {
    try {
      secureApiService.validateInput(contextText, 'text');
      console.warn('Direct API call detected. Implement secure proxy for production.');
      return { error: 'Use direct API call for now. Implement secure proxy for production.' };
    } catch (error) {
      throw error;
    }
  }
};