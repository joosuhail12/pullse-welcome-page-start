
import { logger } from './logger';
import { SecurityEventType, SecurityOutcome, SecuritySeverity } from './security/types';

/**
 * Audit Logger for security events
 * Handles the logging of security-related events separately from regular logs
 */

// Generic security event logger
const logSecurityEvent = (
  eventType: SecurityEventType,
  outcome: SecurityOutcome,
  details?: any,
  severity: SecuritySeverity = 'MEDIUM'
) => {
  const eventData = {
    eventType,
    outcome,
    timestamp: new Date(),
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    details: sanitizeDetails(details),
    severity
  };
  
  logger.info(`Security Event: ${eventType} - ${outcome}`, 'Security', eventData);

  // In a real implementation, we would also:
  // 1. Store this in a separate security log storage
  // 2. Potentially trigger alerts based on severity and event type
  // 3. Send to a SIEM or monitoring system
};

// User action logger (non-security specific)
const logUserAction = (userId: string, action: string, details?: any) => {
  const actionData = {
    userId,
    action,
    timestamp: new Date(),
    details: sanitizeDetails(details)
  };
  
  logger.info(`User Action: ${action} by ${userId}`, 'UserActivity', actionData);
};

// Admin action logger (for audit trails of administrative actions)
const logAdminAction = (userId: string, action: string, details?: any) => {
  const actionData = {
    userId,
    action,
    timestamp: new Date(),
    ipAddress: getClientIP(),
    details: sanitizeDetails(details)
  };
  
  logger.info(`Admin Action: ${action} by ${userId}`, 'AdminActivity', actionData);
};

// Helper functions
const getClientIP = () => {
  // In a browser environment we don't have direct access to client IP
  // This would usually come from server headers or environment
  return 'client-ip-unknown';
};

const getUserAgent = () => {
  try {
    return navigator.userAgent;
  } catch (e) {
    return 'user-agent-unknown';
  }
};

const sanitizeDetails = (details?: any) => {
  // Remove sensitive information from logs
  if (!details) return {};
  
  const sanitized = { ...details };
  
  // Remove sensitive fields if they exist
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Export the audit logger functions and types
export const auditLogger = {
  logSecurityEvent,
  logUserAction,
  logAdminAction,
  SecurityEventType
};
