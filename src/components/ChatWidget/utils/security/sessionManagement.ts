
/**
 * Session Management utilities
 * 
 * Provides functions for session management, validation,
 * and secure logout operations.
 */

import { getChatSessionId, invalidateSession } from '../cookies';
import { auditLogger } from '@/lib/audit-logger';
import { rateLimitStore } from './rateLimit';
import { SecurityEventType } from '@/lib/security/securityTypes';

/**
 * Logout user and invalidate session
 * 
 * TODO: Implement server-side session invalidation
 * TODO: Add token revocation for all authentication tokens
 */
export function logout(): void {
  // Log logout event
  const sessionId = getChatSessionId();
  if (sessionId) {
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.LOGOUT,
      'SUCCESS',
      { sessionId },
      'LOW'
    );
  
    // Clear rate limiting data for the current session
    if (rateLimitStore[sessionId]) {
      delete rateLimitStore[sessionId];
    }
  }
  
  // Invalidate the session
  invalidateSession();
}

/**
 * Check if the session has expired and needs renewal
 * @returns True if session is valid, false otherwise
 * 
 * TODO: Implement token rotation and refresh tokens
 */
export function checkSessionValidity(): boolean {
  const sessionId = getChatSessionId();
  return !!sessionId;
}

/**
 * Enforce HTTPS by redirecting HTTP requests to HTTPS
 * @returns True if already on HTTPS, false if redirection occurred
 * 
 * TODO: Implement strict HSTS headers on server-side
 * TODO: Consider preload list submission for production domains
 */
export function enforceHttps(): boolean {
  if (
    typeof window !== 'undefined' && 
    window.location.protocol === 'http:' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    // Log security event for HTTP access attempt
    auditLogger.logSecurityEvent(
      SecurityEventType.SECURITY_SETTING_CHANGE,
      'ATTEMPT',
      { 
        action: 'enforce_https', 
        from: window.location.protocol,
        to: 'https:',
        host: window.location.hostname
      },
      'MEDIUM'
    );
    
    window.location.href = window.location.href.replace('http:', 'https:');
    return false;
  }
  return true;
}
