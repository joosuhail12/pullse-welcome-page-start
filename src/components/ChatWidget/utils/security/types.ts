
/**
 * Types for security-related functionality in the chat widget
 */

export type SecurityEventType =
  | 'authentication'
  | 'authorization'
  | 'rateLimit'
  | 'validation'
  | 'session'
  | 'csrf'
  | 'xss'
  | 'dataAccess'
  | 'apiAccess'
  | 'embedding'
  | 'userAction';

export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';

export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  type: SecurityEventType;
  outcome: SecurityEventOutcome;
  timestamp: Date;
  details?: any;
  severity?: SecurityEventSeverity;
}

export interface SecurityLogger {
  logSecurityEvent: (
    eventType: SecurityEventType,
    outcome: SecurityEventOutcome,
    details?: any,
    severity?: SecurityEventSeverity
  ) => void;
}
