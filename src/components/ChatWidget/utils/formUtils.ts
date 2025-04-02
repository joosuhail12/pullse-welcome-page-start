
import { validateMessage, validateFile, sanitizeFileName } from './validation';

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Basic sanitization - remove script tags and potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

// Validate a specific field based on its type and requirements
export function validateField(name: string, value: string, isRequired: boolean): string | null {
  if (value === undefined || value === null) value = ''; // Handle null/undefined values
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

// Validate all form data at once and sanitize inputs
export function validateFormData(formData: Record<string, string>): Record<string, string> {
  // Create a new object to hold sanitized values
  const sanitizedData: Record<string, string> = {};
  
  // Sanitize each field
  Object.keys(formData).forEach(key => {
    sanitizedData[key] = sanitizeInput(formData[key]);
  });
  
  return sanitizedData;
}

export { validateMessage, validateFile, sanitizeFileName };
