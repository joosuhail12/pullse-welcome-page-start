
import DOMPurify from 'dompurify';

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
  if (sanitized.length > 2000) {
    return sanitized.substring(0, 2000); // Truncate overly long messages
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
 * Validates file before upload
 * @param file The file object to validate
 * @returns Boolean indicating if file is valid
 */
export function validateFile(file: File): boolean {
  // Check file size (limit to 5MB)
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return false;
  }
  
  // Check file type (allow only common safe formats)
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

// Add validateField function from the unused formUtils.ts
export function validateField(name: string, value: string, isRequired: boolean): string | null {
  const sanitized = value.trim();
  
  if (isRequired && !sanitized) {
    return "This field is required";
  }
  
  // Email validation
  if (name.toLowerCase().includes('email') && sanitized) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return "Please enter a valid email address";
    }
  }
  
  // Phone validation (basic)
  if ((name.toLowerCase().includes('phone') || name.toLowerCase().includes('tel')) && sanitized) {
    const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
    if (!phoneRegex.test(sanitized)) {
      return "Please enter a valid phone number";
    }
  }
  
  return null;
}

