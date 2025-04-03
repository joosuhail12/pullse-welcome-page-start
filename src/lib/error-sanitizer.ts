
import { sanitizeInput } from '@/components/ChatWidget/utils/validation';

/**
 * Types of sensitive information that should be redacted from error messages
 */
export enum SensitiveInfoType {
  API_KEYS = 'API_KEYS',
  AUTH_TOKENS = 'AUTH_TOKENS',
  PASSWORDS = 'PASSWORDS',
  EMAIL_ADDRESSES = 'EMAIL_ADDRESSES',
  PHONE_NUMBERS = 'PHONE_NUMBERS',
  PERSONAL_IDS = 'PERSONAL_IDS',
  IP_ADDRESSES = 'IP_ADDRESSES',
  CREDIT_CARDS = 'CREDIT_CARDS',
}

/**
 * Patterns for detecting sensitive information
 */
const SENSITIVE_PATTERNS: Record<SensitiveInfoType, RegExp> = {
  [SensitiveInfoType.API_KEYS]: /(api[_-]?key|apikey|access[_-]?key)[=:]["']?\w{8,}["']?/gi,
  [SensitiveInfoType.AUTH_TOKENS]: /(auth[_-]?token|jwt|bearer)[=:]["']?\w+\.[\w.-]+["']?/gi,
  [SensitiveInfoType.PASSWORDS]: /(password|passwd|secret)[=:]["']?[^"'&\s]{3,}["']?/gi,
  [SensitiveInfoType.EMAIL_ADDRESSES]: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  [SensitiveInfoType.PHONE_NUMBERS]: /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/gi,
  [SensitiveInfoType.PERSONAL_IDS]: /(ssn|social security|tax id)[=:]["']?\d{3}[-]?\d{2}[-]?\d{4}["']?/gi,
  [SensitiveInfoType.IP_ADDRESSES]: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/gi,
  [SensitiveInfoType.CREDIT_CARDS]: /\b(?:\d{4}[ -]?){3}\d{4}\b/gi,
};

/**
 * Redacts sensitive information from error messages
 * @param message The error message to sanitize
 * @returns Sanitized error message with sensitive data redacted
 */
export function redactSensitiveInfo(message: string): string {
  if (!message) return '';
  
  let sanitized = message;
  
  // Replace sensitive patterns with redacted indicators
  Object.entries(SENSITIVE_PATTERNS).forEach(([type, pattern]) => {
    sanitized = sanitized.replace(pattern, `[REDACTED ${type}]`);
  });
  
  return sanitized;
}

/**
 * Error message length limits
 */
const ERROR_LENGTH_LIMITS = {
  BRIEF: 100,
  STANDARD: 500,
  FULL: 5000
};

/**
 * Fully sanitizes an error message
 * @param errorOrMessage Error object or message string
 * @param maxLength Maximum allowed length for the sanitized message
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(
  errorOrMessage: unknown,
  maxLength: number = ERROR_LENGTH_LIMITS.STANDARD
): string {
  try {
    // Get the error message from whatever was passed
    let rawMessage = '';
    
    if (typeof errorOrMessage === 'string') {
      rawMessage = errorOrMessage;
    } else if (errorOrMessage instanceof Error) {
      rawMessage = errorOrMessage.message;
    } else if (errorOrMessage && typeof errorOrMessage === 'object') {
      try {
        rawMessage = JSON.stringify(errorOrMessage);
      } catch {
        rawMessage = String(errorOrMessage);
      }
    } else {
      rawMessage = String(errorOrMessage || 'Unknown error');
    }
    
    // Apply sanitization
    let sanitized = sanitizeInput(rawMessage);
    
    // Redact sensitive information
    sanitized = redactSensitiveInfo(sanitized);
    
    // Trim to max length if needed
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + '...';
    }
    
    return sanitized;
  } catch (e) {
    // Failsafe - if something goes wrong during sanitization, return a generic error
    return 'An error occurred';
  }
}

/**
 * Extracts safe error details for logging
 * @param error Error object to extract details from
 * @returns Object with sanitized error details
 */
export function getSafeErrorDetails(error: unknown): Record<string, unknown> {
  try {
    if (!(error instanceof Error)) {
      return { safeMessage: sanitizeErrorMessage(error) };
    }
    
    const safeDetails: Record<string, unknown> = {
      name: error.name,
      safeMessage: sanitizeErrorMessage(error.message)
    };
    
    // Add safe stack trace if available (in development only)
    if (import.meta.env.DEV && error.stack) {
      safeDetails.stack = sanitizeErrorMessage(error.stack, ERROR_LENGTH_LIMITS.FULL);
    }
    
    // Add custom properties if they exist (for custom error classes)
    if ('code' in error) safeDetails.code = error.code;
    if ('status' in error) safeDetails.status = error.status;
    
    return safeDetails;
  } catch {
    return { safeMessage: 'Error details extraction failed' };
  }
}
