
import DOMPurify from 'dompurify';

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

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input The user input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Use DOMPurify to sanitize HTML and prevent XSS
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // Don't allow any HTML tags
    ALLOWED_ATTR: [] // Don't allow any HTML attributes
  });
}

/**
 * Validates and sanitizes a text message
 * @param text The message text to validate
 * @returns Valid and sanitized text or empty string
 */
export function validateMessage(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const sanitized = sanitizeInput(text);
  
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
    sanitizedData[sanitizedKey] = sanitizeInput(value);
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
    .replace(/;|&|`|\||>|<|$/g, '_'); // Replace shell special chars
    
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
  
  return null;
}
