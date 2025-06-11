
/**
 * Input Validation and Sanitization
 * 
 * Provides comprehensive validation and sanitization functions
 * to protect against XSS, injection, and other input-based attacks.
 * 
 * SECURITY NOTICE: Input validation and sanitization is the first line
 * of defense against many common security vulnerabilities.
 */

import * as DOMPurify from 'dompurify';

// Constants for validation
const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Configure DOMPurify for maximum security
const DOM_PURIFY_CONFIG = {
  ALLOWED_TAGS: [], // Don't allow any HTML tags for maximum XSS protection
  ALLOWED_ATTR: [], // Don't allow any HTML attributes
  FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'object'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'src', 'href'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false
};

/**
 * Sanitizes user input to prevent XSS attacks using DOMPurify with strict settings
 * @param input The user input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, trim: boolean = true): string {
  if (!input) return '';

  // Use DOMPurify with strict configuration to sanitize HTML and prevent XSS
  return DOMPurify.sanitize(input, DOM_PURIFY_CONFIG);
}

/**
 * Additional layer of sanitization for specific contexts
 * @param input Input string to sanitize
 * @param context Context where string will be used
 * @returns String sanitized specifically for the context
 */
export function contextSpecificSanitize(input: string, context: 'html' | 'url' | 'attribute' = 'html'): string {
  // First apply the basic sanitization
  const sanitized = sanitizeInput(input);

  switch (context) {
    case 'url':
      // Additional URL-specific sanitization
      // Only allow http/https URLs
      if (sanitized.match(/^https?:\/\//)) {
        return encodeURI(sanitized);
      }
      return '';

    case 'attribute':
      // Additional attribute-specific sanitization
      return sanitized.replace(/[^\w\s.,;:!?()-]/g, '');

    case 'html':
    default:
      return sanitized;
  }
}

/**
 * Validates and sanitizes a text message
 * @param text The message text to validate
 * @returns Valid and sanitized text or empty string
 */
export function validateMessage(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const sanitized = sanitizeInput(text, false);

  // Check message length constraints
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    return sanitized.substring(0, MAX_MESSAGE_LENGTH); // Truncate overly long messages
  }

  return sanitized;
}

/**
 * Validates form data by sanitizing all values
 * @param formData Form data object
 * @returns Sanitized form data object
 */
export function validateFormData(formData: Record<string, string>): Record<string, string> {
  const sanitizedData: Record<string, string> = {};

  for (const [key, value] of Object.entries(formData)) {
    // Sanitize the key as well to be extra safe
    const sanitizedKey = sanitizeInput(key);

    // For extra security, apply context-specific sanitization based on field name
    let sanitizedValue = '';

    if (key.toLowerCase().includes('email')) {
      // Email-specific validation
      sanitizedValue = sanitizeInput(value);
      if (!isValidEmail(sanitizedValue)) sanitizedValue = '';
    } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('tel')) {
      // Phone-specific validation
      sanitizedValue = sanitizeInput(value);
      if (!isValidPhoneNumber(sanitizedValue)) sanitizedValue = '';
    } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
      // URL-specific validation
      sanitizedValue = contextSpecificSanitize(value, 'url');
    } else {
      // General text validation
      sanitizedValue = sanitizeInput(value);
    }

    sanitizedData[sanitizedKey] = sanitizedValue;
  }

  return sanitizedData;
}

/**
 * Checks if a file size is within allowed limits
 * @param fileSize The size of the file in bytes
 * @returns Boolean indicating if file size is valid
 */
export function isValidFileSize(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE_BYTES;
}

/**
 * Checks if a file type is in the allowed types list
 * @param fileType The MIME type of the file
 * @returns Boolean indicating if file type is allowed
 */
export function isAllowedFileType(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType);
}

/**
 * Validates file before upload
 * @param file The file object to validate
 * @returns Boolean indicating if file is valid
 */
export function validateFile(file: File): boolean {
  // Check file size
  if (!isValidFileSize(file.size)) {
    return false;
  }

  // Check file type
  return isAllowedFileType(file.type);
}

/**
 * Sanitizes file name to prevent path traversal and command injection
 * @param fileName The original file name
 * @returns Sanitized file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'unnamed_file';

  // Remove path traversal characters and normalize
  const sanitized = fileName
    .replace(/\.\.\//g, '') // Remove path traversal sequences
    .replace(/[/\\]/g, '_') // Replace slashes with underscores
    .replace(/;|&|`|\||>|<|$/g, '_') // Replace shell special chars
    .replace(/\s+/g, '_');  // Replace spaces with underscores

  return sanitized;
}

/**
 * Validates email format using regex
 * @param email The email to validate
 * @returns Boolean indicating if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format using regex
 * @param phone The phone number to validate
 * @returns Boolean indicating if phone format is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates a form field based on field name and rules
 * @param name Field name for context-aware validation
 * @param value Field value to validate
 * @param isRequired Whether the field is required
 * @returns Error message or null if valid
 */
export function validateField(name: string, value: string, isRequired: boolean): string | null {
  const sanitized = value.trim();

  // Required field validation
  if (isRequired && !sanitized) {
    return "This field is required";
  }

  // Email validation
  if (name.toLowerCase().includes('email') && sanitized) {
    if (!isValidEmail(sanitized)) {
      return "Please enter a valid email address";
    }
  }

  // Phone validation
  if ((name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) && sanitized) {
    if (!isValidPhoneNumber(sanitized)) {
      return "Please enter a valid phone number";
    }
  }

  // URL validation
  if ((name.toLowerCase().includes('url') || name.toLowerCase().includes('website')) && sanitized) {
    try {
      new URL(sanitized);
    } catch (e) {
      return "Please enter a valid URL";
    }
  }

  return null;
}

/**
 * Sanitizes HTML content if it absolutely must be rendered
 * @param html HTML content to sanitize
 * @returns Sanitized HTML that's safe to render
 */
export function sanitizeHtml(html: string): string {
  // Use a less restrictive DOMPurify config that allows some safe HTML
  const htmlConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ADD_ATTR: ['target'], // Force target attribute on links
    FORCE_BODY: true,
    USE_PROFILES: { html: true }
  };
  
  return DOMPurify.sanitize(html, htmlConfig);
}
