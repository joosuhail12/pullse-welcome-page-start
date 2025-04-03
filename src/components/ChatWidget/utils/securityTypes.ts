
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  ACCESS_TOKEN_ISSUED = 'access_token_issued',
  ACCESS_TOKEN_VALIDATED = 'access_token_validated',
  ACCESS_TOKEN_REFRESHED = 'access_token_refreshed',
  ACCESS_TOKEN_EXPIRED = 'access_token_expired',
  ACCESS_TOKEN_REVOKED = 'access_token_revoked',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_ACCESS_ATTEMPT = 'data_access_attempt',
  CONFIGURATION_CHANGE = 'configuration_change',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  API_ABUSE_DETECTED = 'api_abuse_detected',
  WIDGET_INTEGRITY_CHECK = 'widget_integrity_check',
  CHAT_SESSION_STARTED = 'chat_session_started',
  CHAT_SESSION_ENDED = 'chat_session_ended',
  SENSITIVE_DATA_IN_MESSAGE = 'sensitive_data_in_message',
  TOKEN_VALIDATION_FAILED = 'token_validation_failed'
}

export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN' | 'WARNING';
export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
