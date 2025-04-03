
/**
 * Security event types for logging and monitoring
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  MFA_CHALLENGE = 'mfa_challenge',
  
  // Authorization events
  ACCESS_DENIED = 'access_denied',
  PERMISSION_CHANGED = 'permission_changed',
  ROLE_CHANGED = 'role_changed',
  
  // Data security events
  DATA_EXPORT = 'data_export',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  
  // Session management events
  SESSION_CREATED = 'session_created',
  SESSION_REFRESHED = 'session_refreshed',
  SESSION_EXPIRED = 'session_expired',
  SESSION_TERMINATED = 'session_terminated',
  
  // API security events
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REFRESHED = 'token_refreshed',
  TOKEN_REVOKED = 'token_revoked',
  
  // Attack detection
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INJECTION_ATTEMPT = 'injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  
  // System security events
  CONFIG_CHANGED = 'config_changed',
  SECURITY_SETTING_CHANGED = 'security_setting_changed',
  
  // Chat widget specific events
  WIDGET_INIT = 'widget_init',
  WIDGET_CONNECT = 'widget_connect',
  CHANNEL_ACCESS = 'channel_access',
  REALTIME_AUTH = 'realtime_auth'
}

// Re-export for backward compatibility
export default SecurityEventType;
