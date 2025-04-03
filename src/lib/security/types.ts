
/**
 * Security types used throughout the application
 */

export enum SecurityEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_SIGNUP = 'USER_SIGNUP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  AUTH_FAILURE = 'AUTH_FAILURE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_DELETED = 'API_KEY_DELETED',
  SECURITY_SETTING_CHANGE = 'SECURITY_SETTING_CHANGE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  IP_BLOCKED = 'IP_BLOCKED',
  POSSIBLE_XSS_ATTEMPT = 'POSSIBLE_XSS_ATTEMPT',
  CSRF_FAILURE = 'CSRF_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export type SecurityOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  eventType: SecurityEventType;
  outcome: SecurityOutcome;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: SecuritySeverity;
}

export interface AuditLoggerInterface {
  logSecurityEvent: (
    eventType: SecurityEventType,
    outcome: SecurityOutcome,
    details?: any,
    severity?: SecuritySeverity
  ) => void;
  
  logUserAction: (userId: string, action: string, details?: any) => void;
  
  logAdminAction: (userId: string, action: string, details?: any) => void;
}
