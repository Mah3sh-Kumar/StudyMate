/**
 * Global Error Handler Utility for StudyMate App
 * 
 * This utility handles errors consistently across the application by:
 * 1. Normalizing errors into a standard structure
 * 2. Logging full technical details to the console
 * 3. Returning user-friendly messages for UI display
 */

/**
 * Standard error structure
 * @typedef {Object} StandardError
 * @property {string} title - Brief error title
 * @property {string} userMessage - User-friendly message
 * @property {string} technicalMessage - Full technical error message
 * @property {string} [stack] - Stack trace for debugging
 * @property {Object} [context] - Additional context (API endpoint, method, etc.)
 */

/**
 * Normalize an error into a standard structure
 * @param {Error|string|Object} error - The error to normalize
 * @param {Object} [options] - Additional options
 * @param {string} [options.title] - Custom title for the error
 * @param {string} [options.userMessage] - Custom user-friendly message
 * @param {Object} [options.context] - Additional context information
 * @returns {StandardError} Normalized error structure
 */
export const normalizeError = (error, options = {}) => {
  // Extract error details based on the type of error object
  let message = '';
  let stack = '';
  let technicalMessage = '';

  if (typeof error === 'string') {
    message = error;
    technicalMessage = error;
  } else if (error instanceof Error) {
    message = error.message || 'An unknown error occurred';
    stack = error.stack || '';
    technicalMessage = error.message || 'An unknown error occurred';
  } else if (error && typeof error === 'object') {
    message = error.message || error.error || error.errorMessage || 'An unknown error occurred';
    stack = error.stack || '';
    technicalMessage = error.message || error.error || error.errorMessage || JSON.stringify(error);
  } else {
    message = 'An unknown error occurred';
    technicalMessage = JSON.stringify(error);
  }

  // Default user-friendly messages based on error type
  const defaultUserMessages = {
    network: 'Connection failed. Please check your internet connection and try again.',
    api: 'The service is temporarily unavailable. Please try again later.',
    auth: 'Authentication failed. Please sign in again.',
    timeout: 'Request timed out. Please try again.',
    validation: 'Invalid input provided. Please check your entries.',
    rateLimit: 'Too many requests. Please wait a moment and try again.',
    default: 'Something went wrong. Please try again later.'
  };

  // Determine user message
  let userMessage = options.userMessage || defaultUserMessages.default;
  
  // Try to detect error type from message content
  if (technicalMessage.toLowerCase().includes('network') || technicalMessage.toLowerCase().includes('fetch') || technicalMessage.toLowerCase().includes('connection')) {
    userMessage = options.userMessage || defaultUserMessages.network;
  } else if (technicalMessage.toLowerCase().includes('auth') || technicalMessage.toLowerCase().includes('unauthorized') || technicalMessage.toLowerCase().includes('401')) {
    userMessage = options.userMessage || defaultUserMessages.auth;
  } else if (technicalMessage.toLowerCase().includes('timeout') || technicalMessage.toLowerCase().includes('timed out')) {
    userMessage = options.userMessage || defaultUserMessages.timeout;
  } else if (technicalMessage.toLowerCase().includes('rate limit') || technicalMessage.toLowerCase().includes('429')) {
    userMessage = options.userMessage || defaultUserMessages.rateLimit;
  } else if (technicalMessage.toLowerCase().includes('validation') || technicalMessage.toLowerCase().includes('invalid')) {
    userMessage = options.userMessage || defaultUserMessages.validation;
  }

  return {
    title: options.title || 'Error',
    userMessage,
    technicalMessage,
    stack,
    context: options.context || {}
  };
};

/**
 * Log full error details to the console for debugging
 * @param {StandardError} normalizedError - The normalized error to log
 */
export const logError = (normalizedError) => {
  console.group('🚨 StudyMate Error Handler');
  console.error('Title:', normalizedError.title);
  console.error('User Message:', normalizedError.userMessage);
  console.error('Technical Message:', normalizedError.technicalMessage);
  
  if (normalizedError.context && Object.keys(normalizedError.context).length > 0) {
    console.error('Context:', normalizedError.context);
  }
  
  if (normalizedError.stack) {
    console.error('Stack Trace:', normalizedError.stack);
  }
  
  console.groupEnd();
};

/**
 * Handle an error by normalizing it, logging it, and returning a user-friendly version
 * @param {Error|string|Object} error - The error to handle
 * @param {Object} [options] - Additional options
 * @param {string} [options.title] - Custom title for the error
 * @param {string} [options.userMessage] - Custom user-friendly message
 * @param {Object} [options.context] - Additional context information
 * @returns {StandardError} Normalized error structure with user-friendly message
 */
export const handleError = (error, options = {}) => {
  const normalizedError = normalizeError(error, options);
  logError(normalizedError);
  return normalizedError;
};

/**
 * Handle API errors specifically
 * @param {Error|string|Object} error - The API error to handle
 * @param {Object} [context] - API context (url, method, etc.)
 * @returns {StandardError} Normalized error structure
 */
export const handleAPIError = (error, context = {}) => {
  const options = {
    title: 'API Error',
    context: {
      type: 'API_ERROR',
      ...context
    }
  };

  // Add more specific context based on error type
  if (error && typeof error === 'object' && error.status) {
    options.context.status = error.status;
    options.context.statusText = error.statusText;
  }

  return handleError(error, options);
};

/**
 * Handle promise rejections globally
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined' && window.addEventListener) {
    // For web
    window.addEventListener('unhandledrejection', (event) => {
      const normalizedError = handleError(event.reason, {
        title: 'Unhandled Promise Rejection',
        context: { type: 'UNHANDLED_PROMISE_REJECTION' }
      });
      event.preventDefault(); // Prevent default browser behavior
    });
  } else {
    // For React Native
    const originalPromiseRejectionHandler = global?.Promise?.prototype?.catch;
    if (originalPromiseRejectionHandler) {
      global.Promise.prototype.catch = function (onRejected) {
        return originalPromiseRejectionHandler.call(this, (reason) => {
          handleError(reason, {
            title: 'Unhandled Promise Rejection',
            context: { type: 'UNHANDLED_PROMISE_REJECTION' }
          });
          return onRejected ? onRejected(reason) : Promise.reject(reason);
        });
      };
    }

    // Handle uncaught exceptions
    if (global.ErrorUtils) {
      const originalErrorHandler = global.ErrorUtils.getGlobalHandler();
      global.ErrorUtils.setGlobalHandler((error, isFatal) => {
        handleError(error, {
          title: isFatal ? 'Fatal Error' : 'Uncaught Exception',
          context: { type: 'UNCAUGHT_EXCEPTION', isFatal }
        });
        
        // Call the original handler if it exists
        if (originalErrorHandler) {
          originalErrorHandler(error, isFatal);
        }
      });
    }
  }
};

// Export a default error handler object
export default {
  normalizeError,
  logError,
  handleError,
  handleAPIError,
  setupGlobalErrorHandlers
};