
// SecurityEventType enum that includes all needed event types
export enum SecurityEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  
  // Token events
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REJECTED = 'token_rejected',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_REFRESH = 'token_refresh',
  
  // Authorization events
  ACCESS_DENIED = 'access_denied',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_DENIED = 'permission_denied',
  
  // Data events
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  ENCRYPT_DATA = 'encrypt_data',
  DECRYPT_DATA = 'decrypt_data',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  
  // System events
  SYSTEM_SETTING_CHANGE = 'system_setting_change',
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown',
  
  // Suspicious activity
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  
  // Additional types needed for audit-logger.ts
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  ADMIN_ACTION = 'admin_action'
}

// Define SecurityEventOutcome enum
export enum SecurityEventOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  INFO = 'info'
}

export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityEventStatus = 'ATTEMPT' | 'SUCCESS' | 'FAILURE' | 'BLOCKED';

export interface SecurityEventData {
  eventType: SecurityEventType;
  status: SecurityEventStatus;
  timestamp: Date;
  details?: Record<string, any>;
  severity?: SecurityEventSeverity;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}
