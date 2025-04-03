
/**
 * Defines security-related types and constants for the chat widget
 */

/**
 * Security event types for logging and auditing
 */
export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REVOKED = 'token_revoked',
  TOKEN_VALIDATED = 'token_validated',
  PERMISSION_DENIED = 'permission_denied',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SECURITY_SETTING_CHANGE = 'security_setting_change',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS_ATTEMPT = 'data_access_attempt',
  API_ACCESS_DENIED = 'api_access_denied',
  CONTENT_INJECTION_ATTEMPT = 'content_injection_attempt'
}

/**
 * Security event outcome types
 */
export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT';

/**
 * Security event severity levels
 */
export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Security event log entry
 */
export interface SecurityEventLog {
  eventType: SecurityEventType;
  outcome: SecurityEventOutcome;
  timestamp: Date;
  metadata?: Record<string, any>;
  severity: SecurityEventSeverity;
}
