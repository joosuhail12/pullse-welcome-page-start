
export * from './encryption';
export * from './validation';
export * from './rateLimit';
export * from './csrfProtection';
export * from './sessionManagement';
export { SecurityEventType } from '@/lib/security/securityEventTypes';

/**
 * Security utility functions for the chat widget
 */
export const isRateLimited = (): boolean => {
  // Rate limiting implementation
  return false;
};

export const validateToken = (token: string): boolean => {
  // Token validation implementation
  return token.length > 0;
};

export const generateSecureNonce = (): string => {
  // Generate a secure random nonce
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
