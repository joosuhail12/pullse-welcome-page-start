
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
  ACCESS_CONTROL = 'access_control'
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
