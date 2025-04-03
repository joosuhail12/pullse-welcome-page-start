
export enum SecurityEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  
  // Authorization events
  AUTHORIZATION_FAILURE = 'authorization_failure',
  PERMISSION_DENIED = 'permission_denied',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  
  // Token events
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REJECTED = 'token_rejected',
  TOKEN_EXPIRED = 'token_expired',
  TOKEN_VALIDATED = 'token_validated',
  
  // Attack detection
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  POSSIBLE_XSS_ATTEMPT = 'possible_xss_attempt',
  POSSIBLE_INJECTION = 'possible_injection',
  CSRF_ATTEMPT = 'csrf_attempt',
  
  // Data protection
  DATA_LEAK_PREVENTED = 'data_leak_prevented',
  ENCRYPTION_ERROR = 'encryption_error',
  
  // General security
  SECURITY_CONFIGURATION_CHANGE = 'security_configuration_change',
  SECURITY_NOTIFICATION = 'security_notification'
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';
  details?: any;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityLoggerInterface {
  logSecurityEvent: (
    eventType: SecurityEventType, 
    outcome: 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN', 
    details?: any, 
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ) => void;
  logLoginAttempt: (userId: string, success: boolean, details?: any) => void;
  logAuthorizationFailure: (userId: string, resource: string, action: string) => void;
  logTokenIssued: (tokenId: string, userId: string) => void;
  logTokenRejected: (tokenId: string | null, reason: string) => void;
  logRateLimitExceeded: (userId: string | null, endpoint: string, limit: number) => void;
  logPossibleAttack: (type: string, details: any) => void;
  logDataLeakPrevented: (dataType: string, destination: string) => void;
  logSecurityConfigChange: (changedBy: string, setting: string, newValue: any) => void;
  logAdminAction: (userId: string, action: string, details?: any) => void;
}
