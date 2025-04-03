import { logger } from '../logger';
import { SecurityEventType as SecurityEventTypeEnum } from './securityTypes';

/**
 * Re-export SecurityEventType to avoid conflicts
 */
export const SecurityEventType = SecurityEventTypeEnum;

/**
 * Security logger for tracking security-related events
 */
export const securityLogger = {
  /**
   * Log a security event
   * @param eventType Type of security event
   * @param outcome Result of the security check
   * @param details Additional details about the event
   * @param severity How severe the event is
   */
  logSecurityEvent: (
    eventType: SecurityEventTypeEnum,
    outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN',
    details?: any,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ) => {
    logger.info(
      `Security event: ${eventType} (${outcome})`,
      'SecurityLogger',
      {
        eventType,
        outcome,
        details,
        severity,
        timestamp: new Date()
      }
    );

    // For high severity failures, also log as error
    if (outcome === 'FAILURE' && (severity === 'HIGH' || severity === 'CRITICAL')) {
      logger.error(
        `Security violation: ${eventType}`,
        'SecurityLogger',
        {
          eventType,
          outcome,
          details,
          severity,
          timestamp: new Date()
        }
      );
    }
  },

  /**
   * Log a user authentication event
   */
  logAuthEvent: (userId: string, success: boolean, details?: any) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.AUTHENTICATION,
      success ? 'SUCCESS' : 'FAILURE',
      { userId, ...details },
      success ? 'LOW' : 'HIGH'
    );
  },

  /**
   * Log an authorization check
   */
  logAuthzEvent: (userId: string, resource: string, action: string, success: boolean) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.AUTHORIZATION,
      success ? 'SUCCESS' : 'FAILURE',
      { userId, resource, action },
      success ? 'LOW' : 'MEDIUM'
    );
  },

  /**
   * Log an input validation event
   */
  logValidationEvent: (input: string, valid: boolean, source: string) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.INPUT_VALIDATION,
      valid ? 'SUCCESS' : 'FAILURE',
      { source, inputLength: input.length },
      valid ? 'LOW' : 'MEDIUM'
    );
  },

  /**
   * Log a CSRF protection event
   */
  logCsrfEvent: (valid: boolean, source: string) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.CSRF_PROTECTION,
      valid ? 'SUCCESS' : 'FAILURE',
      { source },
      valid ? 'LOW' : 'HIGH'
    );
  },

  /**
   * Log a rate limiting event
   */
  logRateLimitEvent: (userId: string, endpoint: string, limited: boolean) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.RATE_LIMITING,
      limited ? 'FAILURE' : 'SUCCESS',
      { userId, endpoint },
      limited ? 'MEDIUM' : 'LOW'
    );
  },

  /**
   * Log a session management event
   */
  logSessionEvent: (userId: string, action: string, success: boolean) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.SESSION_MANAGEMENT,
      success ? 'SUCCESS' : 'FAILURE',
      { userId, action },
      success ? 'LOW' : 'MEDIUM'
    );
  },

  /**
   * Log admin action for audit trail
   */
  logAdminAction: (userId: string, action: string, details?: any) => {
    securityLogger.logSecurityEvent(
      SecurityEventTypeEnum.ACCESS_CONTROL,
      'SUCCESS',
      { userId, action, details },
      'MEDIUM'
    );
  }
};

// Export the SecurityEventType for use elsewhere
export { SecurityEventTypeEnum };
