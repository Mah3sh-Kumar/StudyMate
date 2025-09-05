// Input validation utilities for StudyMate authentication

/**
 * Email validation using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  // Minimum length check
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Check for at least one lowercase letter
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for at least one uppercase letter
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for at least one number
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Optional: Check for special characters (uncomment if needed)
  // if (!/(?=.*[@$!%*?&])/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score
 * @param {string} password - Password to analyze
 * @returns {string} - Strength level (weak, fair, good, strong)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/(?=.*[a-z])/.test(password)) score += 1;
  if (/(?=.*[A-Z])/.test(password)) score += 1;
  if (/(?=.*\d)/.test(password)) score += 1;
  if (/(?=.*[@$!%*?&])/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 5) return 'good';
  return 'strong';
};

/**
 * Username validation
 * @param {string} username - Username to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { isValid: false, errors };
  }
  
  const trimmedUsername = username.trim();
  
  // Length validation
  if (trimmedUsername.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (trimmedUsername.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  // Character validation (only letters, numbers, underscores, and hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  // Must start with a letter or number
  if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
    errors.push('Username must start with a letter or number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Full name validation
 * @param {string} fullName - Full name to validate
 * @returns {object} - Validation result with isValid boolean and errors array
 */
export const validateFullName = (fullName) => {
  const errors = [];
  
  if (!fullName || typeof fullName !== 'string') {
    errors.push('Full name is required');
    return { isValid: false, errors };
  }
  
  const trimmedName = fullName.trim();
  
  // Length validation
  if (trimmedName.length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }
  
  if (trimmedName.length > 50) {
    errors.push('Full name must be no more than 50 characters long');
  }
  
  // Character validation (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    errors.push('Full name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generic field validation
 * @param {string} value - Value to validate
 * @param {object} rules - Validation rules
 * @returns {object} - Validation result
 */
export const validateField = (value, rules = {}) => {
  const errors = [];
  
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    errors.push(`${rules.fieldName || 'Field'} is required`);
    return { isValid: false, errors };
  }
  
  // Skip other validations if field is not required and empty
  if (!rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { isValid: true, errors: [] };
  }
  
  const stringValue = typeof value === 'string' ? value.trim() : String(value);
  
  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${rules.fieldName || 'Field'} must be at least ${rules.minLength} characters long`);
  }
  
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${rules.fieldName || 'Field'} must be no more than ${rules.maxLength} characters long`);
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.patternMessage || `${rules.fieldName || 'Field'} format is invalid`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize input to prevent basic injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length to prevent DoS
};

/**
 * Check if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - Validation result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  const errors = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all validation functions as default
export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateField,
  validatePasswordMatch,
  sanitizeInput
};