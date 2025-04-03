
/**
 * CSRF Protection Utilities
 */
import { getChatSessionId } from '../cookies';
import { securityLogger } from '@/lib/security/securityLogger';
import { SecurityEventType } from '@/lib/security/securityTypes';
import { generateRandomToken, signMessage } from './cryptoUtils';

type CsrfToken = {
  token: string;
  timestamp: number;
};

const CSRF_TOKEN_WINDOW_MS = 3600000; // 1 hour

/**
 * Generate a CSRF token
 * @returns Object with token and timestamp
 */
export function generateCsrfToken(): CsrfToken {
  const timestamp = Date.now();
  const sessionId = getChatSessionId() || 'unknown';
  
  // Create randomized token with session binding
  const tokenBase = `${sessionId}_${timestamp}_${generateRandomToken(16)}`;
  const signature = signMessage(tokenBase);
  const token = `${tokenBase}.${signature}`;
  
  securityLogger.logSecurityEvent(
    SecurityEventType.TOKEN_ISSUED,
    'SUCCESS',
    {
      type: 'csrf',
      expiry: new Date(timestamp + CSRF_TOKEN_WINDOW_MS),
      sessionId
    }
  );
  
  return {
    token,
    timestamp
  };
}

/**
 * Validate a CSRF token
 * @param token The token to validate
 * @param allowWindowMs Optional time window to allow (defaults to 1 hour)
 * @returns Whether the token is valid
 */
export function validateCsrfToken(
  token: string,
  allowWindowMs: number = CSRF_TOKEN_WINDOW_MS
): boolean {
  try {
    const sessionId = getChatSessionId() || 'unknown';
    const [tokenPart, signature] = token.split('.');
    
    if (!tokenPart || !signature) {
      securityLogger.logSecurityEvent(
        SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        {
          type: 'csrf',
          reason: 'Invalid token format',
          sessionId
        },
        'MEDIUM'
      );
      return false;
    }
    
    // Verify signature
    const isValidSignature = signMessage(tokenPart) === signature;
    if (!isValidSignature) {
      securityLogger.logSecurityEvent(
        SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        {
          type: 'csrf',
          reason: 'Invalid signature',
          sessionId
        },
        'HIGH'
      );
      return false;
    }
    
    // Extract parts: sessionId_timestamp_random
    const parts = tokenPart.split('_');
    if (parts.length !== 3) {
      securityLogger.logSecurityEvent(
        SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        {
          type: 'csrf',
          reason: 'Invalid token structure',
          sessionId
        },
        'MEDIUM'
      );
      return false;
    }
    
    // Check if the token belongs to this session
    const tokenSessionId = parts[0];
    if (sessionId !== 'unknown' && tokenSessionId !== sessionId) {
      securityLogger.logSecurityEvent(
        SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        {
          type: 'csrf',
          reason: 'Session mismatch',
          tokenSessionId,
          currentSessionId: sessionId
        },
        'HIGH'
      );
      return false;
    }
    
    // Check if the token is still valid (within time window)
    const timestamp = parseInt(parts[1], 10);
    const now = Date.now();
    const isWithinWindow = (now - timestamp) <= allowWindowMs;
    
    if (!isWithinWindow) {
      securityLogger.logSecurityEvent(
        SecurityEventType.TOKEN_REJECTED,
        'FAILURE',
        {
          type: 'csrf',
          reason: 'Token expired',
          tokenAge: now - timestamp,
          maxAge: allowWindowMs,
          sessionId
        },
        'MEDIUM'
      );
      return false;
    }
    
    securityLogger.logSecurityEvent(
      SecurityEventType.TOKEN_VALIDATED,
      'SUCCESS',
      {
        type: 'csrf',
        age: now - timestamp,
        sessionId
      }
    );
    
    return true;
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.TOKEN_REJECTED,
      'FAILURE',
      {
        type: 'csrf',
        error: (error as Error).message
      },
      'HIGH'
    );
    return false;
  }
}

/**
 * Attach CSRF token to Ajax requests
 * @param headers Headers object to attach token to
 * @returns Updated headers object
 */
export function attachCsrfToken(headers: Record<string, string>): Record<string, string> {
  const { token } = generateCsrfToken();
  return {
    ...headers,
    'X-CSRF-Token': token
  };
}

export default {
  generateCsrfToken,
  validateCsrfToken,
  attachCsrfToken
};
