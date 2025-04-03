
/**
 * Enum for security event types
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  MFA_ATTEMPT = 'mfa_attempt',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',
  
  // Authorization events
  PERMISSION_CHANGE = 'permission_change',
  ROLE_CHANGE = 'role_change',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  
  // Data events
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_DELETE = 'data_delete',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  
  // API and Integration events
  API_KEY_GENERATED = 'api_key_generated',
  API_KEY_REVOKED = 'api_key_revoked',
  WEBHOOK_CREATED = 'webhook_created',
  WEBHOOK_DELETED = 'webhook_deleted',
  INTEGRATION_CONNECTED = 'integration_connected',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',
  
  // Account events
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_DELETED = 'account_deleted',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  EMAIL_CHANGED = 'email_changed',
  
  // System events
  CONFIG_CHANGE = 'config_change',
  SYSTEM_SETTING_CHANGE = 'system_setting_change',
  
  // Security threat events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  
  // Widget-specific events
  WIDGET_SCRIPT_LOADED = 'widget_script_loaded',
  WIDGET_INSTALLED = 'widget_installed',
  WIDGET_CONFIG_CHANGED = 'widget_config_changed',
  WIDGET_ORIGIN_VERIFIED = 'widget_origin_verified',
  WIDGET_ORIGIN_REJECTED = 'widget_origin_rejected'
}

/**
 * Outcome types for security events
 */
export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';

/**
 * Severity levels for security events
 */
export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
