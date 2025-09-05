// Security utilities for StudyMate authentication

/**
 * Format and normalize authentication error messages
 * @param {string} error - Raw error message from Supabase
 * @returns {string} - User-friendly error message
 */
export const formatAuthError = (error) => {
  if (!error) return null;
  
  const errorMessage = error.toLowerCase();
  
  // Email confirmation errors
  if (errorMessage.includes('email not confirmed') || errorMessage.includes('confirm')) {
    return 'Please verify your email address before signing in. Check your inbox for a verification link.';
  }
  
  // Invalid credentials
  if (errorMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  // User already exists
  if (errorMessage.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  // Weak password
  if (errorMessage.includes('password is too weak')) {
    return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
  }
  
  // Signup disabled
  if (errorMessage.includes('signup is disabled')) {
    return 'New account registration is currently disabled. Please contact support.';
  }
  
  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  
  // Network errors - Enhanced detection
  if (errorMessage.includes('network') || errorMessage.includes('connection') ||
      errorMessage.includes('fetch') || errorMessage.includes('internet_disconnected') ||
      errorMessage.includes('err_internet_disconnected') || errorMessage.includes('timeout') ||
      errorMessage.includes('offline') || errorMessage.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Default fallback
  return error; // Return original error if no specific handling
};

/**
 * Rate limiting utility for preventing spam
 * @param {string} key - Unique key for the rate limit (e.g., 'login_attempt_user@email.com')
 * @param {number} maxAttempts - Maximum number of attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} - Rate limit result with allowed boolean and remaining attempts
 */
const rateLimitStore = new Map();

export const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now - record.resetTime > windowMs) {
    // Reset or create new record
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    };
  }
  
  if (record.attempts >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime + windowMs
    };
  }
  
  // Increment attempts
  record.attempts += 1;
  rateLimitStore.set(key, record);
  
  return {
    allowed: true,
    remaining: maxAttempts - record.attempts,
    resetTime: record.resetTime + windowMs
  };
};

/**
 * Clear rate limit for a specific key (e.g., after successful login)
 * @param {string} key - Rate limit key to clear
 */
export const clearRateLimit = (key) => {
  rateLimitStore.delete(key);
};

/**
 * Check if email domain is from a disposable email provider
 * @param {string} email - Email address to check
 * @returns {boolean} - True if email is from a disposable provider
 */
export const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) {
    return false;
  }
  
  // Common disposable email domains (add more as needed)
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'throwaway.email',
    'temp-mail.org',
    'maildrop.cc',
    'mailinator.com'
  ];
  
  return disposableDomains.includes(domain);
};

/**
 * Sanitize user input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeUserInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>"']/g, '') // Remove potential script injection characters
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .substring(0, 500); // Limit length
};

/**
 * Check password against common weak passwords
 * @param {string} password - Password to check
 * @returns {boolean} - True if password is in the weak list
 */
export const isWeakPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return true;
  }
  
  const weakPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', 'admin', 'letmein', 'welcome',
    'monkey', '1234567890', 'dragon', 'password!', 'Password1'
  ];
  
  return weakPasswords.includes(password.toLowerCase());
};

/**
 * Secure logout utility that clears sensitive data
 * @param {Function} supabaseSignOut - Supabase sign out function
 * @returns {Promise<object>} - Sign out result
 */
export const secureLogout = async (supabaseSignOut) => {
  try {
    // Clear any stored tokens or sensitive data
    if (typeof window !== 'undefined') {
      // Clear localStorage (web only)
      try {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-auth-token');
      } catch (e) {
        // Ignore errors for localStorage
      }
    }
    
    // Call Supabase sign out
    const result = await supabaseSignOut();
    
    return result;
  } catch (error) {
    console.error('Secure logout error:', error);
    return { error: 'Failed to sign out securely' };
  }
};

// Export all security functions
export default {
  formatAuthError,
  checkRateLimit,
  clearRateLimit,
  isDisposableEmail,
  sanitizeUserInput,
  isWeakPassword,
  secureLogout
};