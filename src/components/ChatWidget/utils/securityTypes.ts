
// Security Event Typings

export type SecurityEventType = 
  | 'AUTH_ATTEMPT' 
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CSRF_VALIDATION_FAILURE'
  | 'XSS_ATTEMPT'
  | 'CONTENT_INJECTION_ATTEMPT'
  | 'SUSPICIOUS_REQUEST'
  | 'SECURITY_SETTING_CHANGE'
  | 'API_ACCESS_DENIED';

export type SecurityEventOutcome = 
  | 'SUCCESS'
  | 'FAILURE'
  | 'ATTEMPT'
  | 'UNKNOWN';

export type SecurityEventSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';
