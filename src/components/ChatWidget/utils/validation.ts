
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
 * Validate file upload
 */
export function validateFile(file: File): boolean {
  if (!file) {
    return false;
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return false;
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  return allowedTypes.includes(file.type);
}

/**
 * Sanitize filename to prevent directory traversal and other security issues
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'untitled';
  }
  
  // Remove path separators and potentially dangerous characters
  let sanitized = fileName
    .replace(/[\/\\:*?"<>|]/g, '_') // Replace dangerous characters with underscore
    .replace(/\.\./g, '_') // Replace .. with underscore to prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
  
  // Ensure the filename isn't empty after sanitization
  if (!sanitized) {
    sanitized = 'untitled';
  }
  
  // Limit filename length
  if (sanitized.length > 255) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 255 - extension.length) + extension;
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

/**
 * Validate form data
 */
export function validateFormData(data: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if data is provided
  if (!data || typeof data !== 'object') {
    errors.push('Invalid form data');
    return { isValid: false, errors };
  }
  
  // Add specific validation rules as needed
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.trim().length === 0) {
      errors.push(`${key} cannot be empty`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
