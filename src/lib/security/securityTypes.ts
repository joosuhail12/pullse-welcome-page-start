
/**
 * Security-related type definitions
 */

export enum SecurityEventType {
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',
  ACCESS_DENIED = 'access:denied',
  ACCESS_GRANTED = 'access:granted',
  TOKEN_ISSUED = 'token:issued',
  TOKEN_REJECTED = 'token:rejected',
  TOKEN_VALIDATED = 'token:validated',
  TOKEN_REVOKED = 'token:revoked',
  TOKEN_REFRESHED = 'token:refreshed',
  RATE_LIMIT_EXCEEDED = 'rate:exceeded',
  POSSIBLE_XSS_ATTEMPT = 'security:xss_attempt',
  POSSIBLE_INJECTION = 'security:injection',
  INVALID_INPUT = 'security:invalid_input',
  SUSPICIOUS_ACTIVITY = 'security:suspicious',
  CRYPTO_OPERATION_FAILED = 'crypto:operation_failed',
  CONFIG_CHANGED = 'config:changed',
  WORKSPACE_CREATED = 'workspace:created',
  SENSITIVE_DATA_ACCESS = 'data:sensitive_access',
  AUDIT_LOG_CREATED = 'audit:log_created',
  LOGOUT = 'user:logout'
}

export interface SecurityEvent {
  type: SecurityEventType;
  status: 'SUCCESS' | 'FAILURE' | 'ATTEMPT';
  timestamp: Date;
  details?: Record<string, any>;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
}

export interface SecurityLogger {
  logSecurityEvent(
    eventType: SecurityEventType,
    status: 'SUCCESS' | 'FAILURE' | 'ATTEMPT',
    details?: Record<string, any>,
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): void;
}
