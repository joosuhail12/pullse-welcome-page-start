
import { validateInput } from './validation';

// Validate a specific field based on its type and requirements
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

// Re-export specific validation functions from validation.ts
export { 
  validateInput, 
  validateMessage, 
  validateFile, 
  sanitizeFileName, 
  validateFormData 
} from './validation';
