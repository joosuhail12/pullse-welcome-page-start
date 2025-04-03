
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
  validateInput,
  sanitizeInput,
  detectXSS,
  validateURL
} from './validation';

// Export CSRF protection
export {
  generateCSRFToken,
  validateCSRFToken,
  attachCSRFToken
} from './csrfProtection';

// Export rate limiting
export {
  isRateLimited,
  trackAPICall
} from './rateLimit';

// Export session management
export {
  validateSession,
  createSession,
  destroySession,
  refreshSession
} from './sessionManagement';

// Export types
export * from './types';
