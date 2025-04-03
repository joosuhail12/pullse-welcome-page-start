
import { SecurityEventType, SecurityLoggerInterface } from './types';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handler';

// Export the SecurityEventType enum
export { SecurityEventType };

/**
 * Security logger implementation
 */
export const securityLogger: SecurityLoggerInterface = {
  logSecurityEvent: (eventType, outcome, details, severity = 'MEDIUM') => {
    logger.log(
      severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warn',
      `Security Event: ${eventType}`,
      'SecurityLogger',
      { eventType, outcome, details, severity, timestamp: new Date() }
    );
  },
  
  logLoginAttempt: (userId, success, details) => {
    securityLogger.logSecurityEvent(
      success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      success ? 'SUCCESS' : 'FAILURE',
      { userId, ...details },
      success ? 'LOW' : 'MEDIUM'
    );
  },
  
  logAuthorizationFailure: (userId, resource, action) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.AUTHORIZATION_FAILURE,
      'FAILURE',
      { userId, resource, action },
      'MEDIUM'
    );
  },
  
  logTokenIssued: (tokenId, userId) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.TOKEN_ISSUED,
      'SUCCESS',
      { tokenId, userId },
      'LOW'
    );
  },
  
  logTokenRejected: (tokenId, reason) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.TOKEN_REJECTED,
      'FAILURE',
      { tokenId, reason },
      'MEDIUM'
    );
  },
  
  logRateLimitExceeded: (userId, endpoint, limit) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      'FAILURE',
      { userId, endpoint, limit },
      'MEDIUM'
    );
  },
  
  logPossibleAttack: (type, details) => {
    securityLogger.logSecurityEvent(
      type === 'xss' ? SecurityEventType.POSSIBLE_XSS_ATTEMPT : 
      type === 'injection' ? SecurityEventType.POSSIBLE_INJECTION : 
      type === 'csrf' ? SecurityEventType.CSRF_ATTEMPT : 
      SecurityEventType.SECURITY_NOTIFICATION,
      'ATTEMPT',
      details,
      'HIGH'
    );
  },
  
  logDataLeakPrevented: (dataType, destination) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.DATA_LEAK_PREVENTED,
      'SUCCESS',
      { dataType, destination },
      'HIGH'
    );
  },
  
  logSecurityConfigChange: (changedBy, setting, newValue) => {
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_CONFIGURATION_CHANGE,
      'SUCCESS',
      { changedBy, setting, newValue },
      'MEDIUM'
    );
  },
  
  logAdminAction: (userId, action, details) => {
    logger.info(
      `Admin Action: ${action}`,
      'AdminLogger',
      { userId, action, details, timestamp: new Date() }
    );
  }
};

/**
 * Utility to sign a message for security verification
 */
export const signMessage = (message: string, secret: string): string => {
  // This is a simplified implementation - in production, use a proper HMAC function
  // For the purposes of this example, we'll use a basic encoding
  const timestamp = Date.now().toString();
  const combined = `${message}:${timestamp}:${secret}`;
  
  // In production, this should use crypto.subtle.digest or similar
  return `${btoa(combined)}.${timestamp}`;
};

/**
 * Utility to verify a signed message
 */
export const verifySignedMessage = (signedMessage: string, message: string, secret: string): boolean => {
  try {
    const [signature, timestamp] = signedMessage.split('.');
    const combined = `${message}:${timestamp}:${secret}`;
    
    // In production, this should compare HMAC values
    return btoa(combined) === signature;
  } catch (error) {
    errorHandler.handle(error);
    return false;
  }
};

// Export security functions
export default {
  securityLogger,
  signMessage,
  verifySignedMessage
};
