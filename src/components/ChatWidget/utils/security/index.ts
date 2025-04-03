
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
  isRateLimited,
  trackAPICall
} from './rateLimit';

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

// Export types - fix the path to use the correct file
export * from '@/lib/security/securityTypes';

