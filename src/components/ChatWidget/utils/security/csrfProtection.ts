
/**
 * CSRF Protection utilities
 * 
 * Provides functions for generating and validating CSRF tokens
 * to protect against cross-site request forgery attacks.
 */

import { getChatSessionId, refreshSessionExpiry } from '../cookies';
import { generateSecureRandom } from './cryptoUtils';
import { auditLogger } from '@/lib/audit-logger';

/**
 * Generate a CSRF token based on the session ID and a secure nonce
 * @returns CSRF token string and nonce object
 * 
 * TODO: Move token generation to server-side in production
 * TODO: Use HMAC or similar cryptographic algorithm for token generation
 */
export function generateCsrfToken(): { token: string, nonce: string } {
  const sessionId = getChatSessionId();
  if (!sessionId) return { token: '', nonce: '' };
  
  // Refresh session expiry on token generation
  refreshSessionExpiry();
  
  // Generate a cryptographically secure nonce
  const nonce = generateSecureRandom(16);
  
  // Generate timestamp for token freshness
  const timestamp = Date.now().toString(36);
  
  // Create token using session ID, nonce and timestamp
  const tokenData = `${sessionId}:${nonce}:${timestamp}`;
  
  // Encode token - in production this would be signed on the server
  const token = btoa(tokenData);
  
  // Log token creation
  auditLogger.logSecurityEvent(
    auditLogger.SecurityEventType.TOKEN_ISSUED,
    'SUCCESS',
    { 
      tokenType: 'CSRF', 
      sessionId: sessionId,
      maskedNonce: `${nonce.substring(0,4)}...`
    },
    'LOW'
  );
  
  return { token, nonce };
}

/**
 * Verify if the provided CSRF token is valid
 * @param token The token to verify
 * @param expectedNonce The nonce that was used to generate the token
 * @returns True if token is valid, false otherwise
 * 
 * TODO: Implement server-side verification with constant-time comparison
 * TODO: Add additional context binding (e.g., action-specific tokens)
 */
export function verifyCsrfToken(token: string, expectedNonce: string): boolean {
  try {
    // Decode the token
    const decoded = atob(token);
    const [sessionId, nonce, timestampStr] = decoded.split(':');
    
    // Verify session ID
    if (sessionId !== getChatSessionId()) {
      auditLogger.logSecurityEvent(
        auditLogger.SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        { tokenType: 'CSRF', reason: 'session_mismatch' },
        'HIGH'
      );
      return false;
    }
    
    // Verify nonce
    if (nonce !== expectedNonce) {
      auditLogger.logSecurityEvent(
        auditLogger.SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        { tokenType: 'CSRF', reason: 'nonce_mismatch' },
        'HIGH'
      );
      return false;
    }
    
    // Check token freshness (10 minute expiry)
    const timestamp = parseInt(timestampStr, 36);
    const now = Date.now();
    if (now - timestamp > 600000) {
      auditLogger.logSecurityEvent(
        auditLogger.SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        { tokenType: 'CSRF', reason: 'token_expired', ageMs: now - timestamp },
        'MEDIUM'
      );
      return false;
    }
    
    // Log successful validation
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.TOKEN_VALIDATED,
      'SUCCESS',
      { tokenType: 'CSRF', sessionId },
      'LOW'
    );
    
    return true;
  } catch (e) {
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.TOKEN_REJECTED,
      'FAILURE',
      { tokenType: 'CSRF', reason: 'invalid_format' },
      'HIGH'
    );
    
    return false;
  }
}
