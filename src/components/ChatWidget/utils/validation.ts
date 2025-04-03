
/**
 * Validation utilities for the chat widget
 */

/**
 * Validate input to prevent injection attacks
 * @param input Input string to validate
 * @param type Type of validation to perform
 * @returns True if input is valid, false otherwise
 */
export function validateInput(
  input: string,
  type: 'text' | 'email' | 'url' | 'id' | 'html' = 'text'
): boolean {
  if (!input) return false;
  
  const patterns = {
    text: /^[^<>{}()`';]*$/,  // Basic text sanitization
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    id: /^[a-zA-Z0-9_-]{1,64}$/,
    html: /^[^<>]*$/ // Very strict, blocks all HTML tags
  };
  
  return patterns[type].test(input);
}

/**
 * Sanitize HTML content to prevent XSS
 * @param html Input string with HTML
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Very basic sanitization - in production, use a library like DOMPurify
  return html.replace(/<(script|iframe|object|embed|form)/gi, '&lt;$1')
    .replace(/(on\w+)=/gi, 'data-$1=')
    .replace(/javascript:/gi, 'blocked:');
}

/**
 * Escape a string for safe inclusion in HTML
 * @param text Text to escape
 * @returns HTML escaped string
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize input for safe display
 * @param input Text to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return escapeHtml(input.trim());
}

/**
 * Validate a message before sending
 * @param message The message text to validate
 * @returns The sanitized message or empty string if invalid
 */
export function validateMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';
  
  // Remove excessive whitespace
  const trimmed = message.trim().replace(/\s+/g, ' ');
  if (trimmed.length === 0) return '';
  
  // Check for potentially malicious content
  if (isMaliciousContent(trimmed)) {
    console.warn('Potentially malicious message content blocked');
    return '';
  }
  
  return sanitizeInput(trimmed);
}

/**
 * Validate a file before upload
 * @param file The file to validate
 * @returns True if file is valid, false otherwise
 */
export function validateFile(file: File): boolean {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return false;
  }
  
  // Check file type (allow images, PDFs, and common document formats)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint
    'text/plain', 'text/csv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize a filename to prevent path traversal and other attacks
 * @param fileName Original filename
 * @returns Sanitized filename
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'file';
  
  // Replace potentially dangerous characters
  const sanitized = fileName
    .replace(/[/\\?%*:|"<>]/g, '_') // Replace filesystem special chars with underscore
    .replace(/\.\./g, '_'); // Prevent directory traversal
  
  // Limit length
  return sanitized.length > 255 ? sanitized.substring(0, 255) : sanitized;
}

/**
 * Check if a string might contain malicious content
 * @param input Input string to check
 * @returns True if input is potentially dangerous
 */
export function isMaliciousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /<svg.*?onload/i
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate form data submission
 * @param formData The form data to validate
 * @param requiredFields Fields that must be present and non-empty
 * @returns Object with isValid and errors properties
 */
export function validateFormData(
  formData: Record<string, string>,
  requiredFields: string[] = []
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate required fields
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') {
      errors[field] = 'This field is required';
    }
  }
  
  // Additional validations for specific fields if they exist
  if (formData.email && !validateInput(formData.email, 'email')) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !/^\+?[0-9\s\-()]{6,20}$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
