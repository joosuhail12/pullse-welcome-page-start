
import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Use DOMPurify to sanitize the input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
}

/**
 * Validate and sanitize a chat message
 */
export function validateMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message: must be a non-empty string');
  }
  
  // Check message length
  if (message.length > 5000) {
    throw new Error('Message too long: maximum 5000 characters allowed');
  }
  
  // Sanitize the message
  const sanitized = sanitizeInput(message.trim());
  
  if (!sanitized) {
    throw new Error('Invalid message: message cannot be empty after sanitization');
  }
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}
