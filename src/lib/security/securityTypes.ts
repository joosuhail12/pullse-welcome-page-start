
/**
 * Security event types for the chat widget
 */
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  INPUT_VALIDATION = 'input_validation',
  RATE_LIMITING = 'rate_limiting',
  CSRF_PROTECTION = 'csrf_protection',
  XSS_PROTECTION = 'xss_protection',
  INJECTION_PROTECTION = 'injection_protection',
  SESSION_MANAGEMENT = 'session_management',
  CONFIGURATION = 'configuration',
  ACCESS_CONTROL = 'access_control',
  SECURITY_SETTING_CHANGE = 'security_setting_change',
  CRYPTO_OPERATION_FAILED = 'crypto_operation_failed',
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REFRESHED = 'token_refreshed',
  TOKEN_REVOKED = 'token_revoked',
  TOKEN_REJECTED = 'token_rejected',
  TOKEN_VALIDATED = 'token_validated',
  LOGOUT = 'logout',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  POSSIBLE_XSS_ATTEMPT = 'possible_xss_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

/**
 * Security event outcome types
 */
export type SecurityOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';

/**
 * Security event severity levels
 */
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Security event interface
 */
export interface SecurityEvent {
  type: SecurityEventType;
  outcome: SecurityOutcome;
  timestamp: Date;
  details?: any;
  severity: SecuritySeverity;
}

// Export the type for the security logger
export interface SecurityLogger {
  logSecurityEvent: (
    eventType: SecurityEventType, 
    outcome: SecurityOutcome, 
    details?: any, 
    severity?: SecuritySeverity
  ) => void;
}
