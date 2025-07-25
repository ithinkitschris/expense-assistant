/**
 * Text Formatting Utility Functions
 * 
 * Centralized text manipulation utilities to eliminate duplicate code
 * across components and improve maintainability.
 */

/**
 * Convert text to sentence case (first letter of each word capitalized)
 * @param {string} text - Input text to convert
 * @returns {string} Text in sentence case
 */
export function toSentenceCase(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Convert text to title case (first letter of each word capitalized)
 * @param {string} text - Input text to convert
 * @returns {string} Text in title case
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Convert text to lowercase
 * @param {string} text - Input text to convert
 * @returns {string} Text in lowercase
 */
export function toLowerCase(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase();
}

/**
 * Convert text to uppercase
 * @param {string} text - Input text to convert
 * @returns {string} Text in uppercase
 */
export function toUpperCase(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toUpperCase();
}

/**
 * Capitalize first letter of text
 * @param {string} text - Input text to convert
 * @returns {string} Text with first letter capitalized
 */
export function capitalize(text) {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Input text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove extra whitespace and normalize spacing
 * @param {string} text - Input text to clean
 * @returns {string} Cleaned text
 */
export function cleanWhitespace(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Format currency amount with proper decimal places
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = '$', decimals = 2) {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency}0`;
  
  // Remove trailing zeros for whole numbers
  const formatted = num.toFixed(decimals);
  const cleanFormatted = formatted.replace(/\.00$/, '');
  
  return `${currency}${cleanFormatted}`;
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to format
 * @returns {string} Number with ordinal suffix
 */
export function formatOrdinal(num) {
  if (num === 0) return '0th';
  
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string ('short', 'long', 'month-day')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'month-day':
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      });
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Validate and sanitize text input
 * @param {string} text - Text to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result with isValid and cleanedText
 */
export function validateText(text, options = {}) {
  const {
    minLength = 0,
    maxLength = Infinity,
    allowEmpty = true,
    trim = true
  } = options;
  
  let cleanedText = text || '';
  if (trim) cleanedText = cleanedText.trim();
  
  const isValid = (
    (allowEmpty || cleanedText.length > 0) &&
    cleanedText.length >= minLength &&
    cleanedText.length <= maxLength
  );
  
  return {
    isValid,
    cleanedText,
    error: isValid ? null : `Text must be between ${minLength} and ${maxLength} characters`
  };
} 