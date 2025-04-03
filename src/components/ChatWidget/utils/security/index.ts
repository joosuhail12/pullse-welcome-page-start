
/**
 * Security module index file - exports all security-related functionality
 */

// Export crypto utilities
export { 
  generateRandomToken,
  signMessage,
  verifySignature,
  encryptString,
  decryptString,
  hashString
} from './cryptoUtils';

// Export validation utilities
export {
  sanitizeInput,
  detectXSS,
  validateInput,
  validateURL
} from './validation';

// Export CSRF protection
export {
  generateCsrfToken,
  validateCsrfToken,
  attachCsrfToken
} from './csrfProtection';

// Export rate limiting
export {
  isRateLimited
} from './rateLimit';

// Create stub for trackAPICall if missing
export function trackAPICall(endpoint: string, ip?: string): boolean {
  // Simple stub implementation
  return true;
}

// Export session management stubs if needed
export function validateSession(sessionId: string): boolean {
  return true;
}

export function createSession(userId: string): string {
  return `session-${userId}-${Date.now()}`;
}

export function destroySession(sessionId: string): boolean {
  return true;
}

export function refreshSession(sessionId: string): string {
  return sessionId;
}

// Export types
export * from '../../../lib/security/securityTypes';
