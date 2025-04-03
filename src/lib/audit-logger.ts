
/**
 * Secure Audit Logger for Security Events
 * 
 * This module provides specialized logging for security-related events
 * with built-in sanitization and structured data format.
 * 
 * SECURITY NOTICE: In production, audit logs should be:
 * 1. Stored in a tamper-evident system
 * 2. Retained according to compliance requirements
 * 3. Protected from unauthorized access and modification
 * 4. Backed up regularly
 */

import { logger } from './logger';
import { sanitizeErrorMessage, getSafeErrorDetails } from './error-sanitizer';
import { SecurityEventType, SecurityEventOutcome, SecurityEventSeverity } from './securityTypes';

// Re-export types for use by other modules
export type { SecurityEventOutcome, SecurityEventSeverity };

// Standard format for audit log entries
export interface AuditLogEntry {
  eventType: SecurityEventType;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';
  details?: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Creates a standardized audit log entry with common security metadata
 * 
 * @param eventType Type of security event
 * @param outcome Result of the event
 * @param details Additional event-specific details
 * @param severity Importance level of the event
 * @returns Formatted audit log entry
 * 
 * TODO: Add additional context data (e.g., request ID, correlation ID)
 * TODO: Implement IP address tracking securely
 */
const createAuditLogEntry = (
  eventType: SecurityEventType,
  outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN',
  details?: any,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
): AuditLogEntry => {
  // Get session ID from document cookie if available
  let sessionId: string | undefined;
  try {
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('pullse_session='));
    
    if (sessionCookie) {
      sessionId = sessionCookie.split('=')[1];
    }
  } catch (e) {
    // Silent fail - may be in an environment without document
  }

  // Safe-guard against errors when accessing navigator
  let userAgent: string | undefined;
  let ipAddress: string | undefined;
  
  try {
    userAgent = navigator.userAgent;
  } catch (e) {
    // Silent fail
  }
  
  // Create the audit log entry with available data
  return {
    eventType,
    timestamp: new Date().toISOString(),
    sessionId,
    ipAddress,
    userAgent,
    outcome,
    details: details ? getSafeErrorDetails(details) : undefined,
    severity
  };
};

/**
 * Records a security event to the audit log
 * 
 * @param eventType Type of security event
 * @param outcome Result of the event
 * @param details Additional context about the event
 * @param severity Importance level
 * 
 * TODO: Implement server-side storage for audit logs
 * TODO: Add alerting for high-severity security events
 * TODO: Implement SIEM integration for security monitoring
 * TODO: Add compliance reporting capabilities
 */
const logSecurityEvent = (
  eventType: SecurityEventType,
  outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN',
  details?: any,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
): void => {
  const auditEntry = createAuditLogEntry(eventType, outcome, details, severity);
  
  // Choose log level based on severity and outcome
  if (severity === 'CRITICAL' || (severity === 'HIGH' && outcome === 'FAILURE')) {
    logger.error(`SECURITY EVENT [${eventType}]: ${outcome}`, 'AuditLog', auditEntry);
  } else if (severity === 'HIGH' || (severity === 'MEDIUM' && outcome === 'FAILURE')) {
    logger.warn(`SECURITY EVENT [${eventType}]: ${outcome}`, 'AuditLog', auditEntry);
  } else if (outcome === 'SUCCESS' || severity === 'LOW') {
    logger.info(`SECURITY EVENT [${eventType}]: ${outcome}`, 'AuditLog', auditEntry);
  } else {
    logger.debug(`SECURITY EVENT [${eventType}]: ${outcome}`, 'AuditLog', auditEntry);
  }

  // In a production environment, this would also:
  // 1. Send the log to a secure audit log storage system
  // 2. Potentially trigger alerts for high-severity events
  if (import.meta.env.PROD) {
    // Example stub for server-side audit logging
    try {
      // This would be implemented to call a secure audit logging endpoint
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        // This could be an immediate alert in production
        console.warn('HIGH SEVERITY SECURITY EVENT DETECTED:', eventType);
      }
      
      // TODO: Implement secure transmission to audit log storage
      // TODO: Add non-repudiation features for critical audit logs
      // TODO: Implement log integrity verification
    } catch (error) {
      // Always fail safe with audit logging
      logger.error('Failed to send audit log to server', 'AuditLog', 
        { error: sanitizeErrorMessage(error) });
    }
  }
};

// Export the audit logger functions
export const auditLogger = {
  logSecurityEvent,
  
  // Common security event logging functions
  logLoginAttempt: (userId: string, details?: any) => 
    logSecurityEvent(SecurityEventType.LOGIN_ATTEMPT, 'ATTEMPT', { userId, ...details }),
    
  logLoginSuccess: (userId: string, details?: any) =>
    logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, 'SUCCESS', { userId, ...details }),
    
  logLoginFailure: (userId: string, reason: string, details?: any) =>
    logSecurityEvent(SecurityEventType.LOGIN_FAILURE, 'FAILURE', 
      { userId, reason, ...details }, 'HIGH'),
      
  logLogout: (userId: string) =>
    logSecurityEvent(SecurityEventType.LOGOUT, 'SUCCESS', { userId }),
    
  logAccessDenied: (userId: string, resource: string, details?: any) =>
    logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, 'FAILURE', 
      { userId, resource, ...details }, 'HIGH'),
      
  logTokenIssued: (userId: string, tokenType: string, details?: any) =>
    logSecurityEvent(SecurityEventType.TOKEN_ISSUED, 'SUCCESS', 
      { userId, tokenType, ...details }),
      
  logTokenRejected: (tokenType: string, reason: string, details?: any) =>
    logSecurityEvent(SecurityEventType.TOKEN_REJECTED, 'FAILURE', 
      { tokenType, reason, ...details }, 'HIGH'),

  logSuspiciousActivity: (details: any) =>
    logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, 'UNKNOWN', details, 'HIGH'),
    
  logAdminAction: (userId: string, action: string, details?: any) =>
    logSecurityEvent(SecurityEventType.ADMIN_ACTION, 'SUCCESS', 
      { userId, action, ...details }, 'HIGH')
};
