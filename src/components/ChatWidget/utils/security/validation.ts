
/**
 * Input validation utilities
 */
import { securityLogger } from '@/lib/security/securityLogger';
import { SecurityEventType } from '@/lib/security/securityTypes';
import xss from 'xss';

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return xss(input);
}

/**
 * Validates if input contains potentially malicious content
 */
export function detectXSS(input: string): boolean {
  if (!input) return false;
  
  const sanitized = xss(input);
  const potentialXss = input !== sanitized;
  
  if (potentialXss) {
    securityLogger.logSecurityEvent(
      SecurityEventType.POSSIBLE_XSS_ATTEMPT,
      'ATTEMPT',
      {
        originalInput: input.length > 100 ? `${input.substring(0, 100)}...` : input,
        sanitizedOutput: sanitized.length > 100 ? `${sanitized.substring(0, 100)}...` : sanitized,
      },
      'MEDIUM'
    );
  }
  
  return potentialXss;
}

/**
 * Validates user input based on specific rules
 */
export function validateInput(input: string, type?: string): boolean {
  if (input === undefined || input === null) return false;
  
  switch(type) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(input);
    case 'url':
      return validateURL(input);
    default:
      return input.trim().length > 0;
  }
}

/**
 * Validate a URL for security concerns
 */
export function validateURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol;
    
    // Only allow http and https protocols
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  sanitizeInput,
  validateInput,
  detectXSS,
  validateURL
};
