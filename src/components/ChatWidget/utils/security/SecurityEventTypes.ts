export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rateLimit',
  VALIDATION = 'validation',
  SESSION = 'session',
  CSRF = 'csrf',
  XSS = 'xss',
  DATA_ACCESS = 'dataAccess',
  API_ACCESS = 'apiAccess',
  EMBEDDING = 'embedding',
  USER_ACTION = 'userAction'
}

export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';
export type SecurityEventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityLogger {
  logSecurityEvent: (
    eventType: SecurityEventType, 
    outcome: SecurityEventOutcome, 
    details?: any, 
    severity?: SecurityEventSeverity
  ) => void;
  
  // Other security logging methods
  logAuthAttempt: (userId: string, outcome: SecurityEventOutcome, details?: any) => void;
  logAccessAttempt: (resource: string, userId: string, outcome: SecurityEventOutcome, details?: any) => void;
  logRateLimitViolation: (userId: string, endpoint: string, details?: any) => void;
  logValidationFailure: (input: string, validationType: string, details?: any) => void;
  logCSRFAttempt: (userId: string, details?: any) => void;
  logXSSAttempt: (input: string, details?: any) => void;
  logDataAccessViolation: (userId: string, dataType: string, details?: any) => void;
  logAPIAccessViolation: (userId: string, endpoint: string, details?: any) => void;
  logEmbeddingViolation: (domain: string, details?: any) => void;
  logAdminAction: (userId: string, action: string, details?: any) => void;
}

export const getSecurityLogger = (): SecurityLogger => {
  return {
    logSecurityEvent: (eventType, outcome, details, severity = 'MEDIUM') => {
      console.warn(`[Security] ${eventType} - ${outcome} (${severity})`, details);
    },
    logAuthAttempt: (userId, outcome, details) => {
      console.warn(`[Security] Authentication attempt by ${userId} - ${outcome}`, details);
    },
    logAccessAttempt: (resource, userId, outcome, details) => {
      console.warn(`[Security] Access attempt to ${resource} by ${userId} - ${outcome}`, details);
    },
    logRateLimitViolation: (userId, endpoint, details) => {
      console.warn(`[Security] Rate limit violation by ${userId} on ${endpoint}`, details);
    },
    logValidationFailure: (input, validationType, details) => {
      console.warn(`[Security] Validation failure (${validationType})`, details);
    },
    logCSRFAttempt: (userId, details) => {
      console.warn(`[Security] CSRF attempt detected for user ${userId}`, details);
    },
    logXSSAttempt: (input, details) => {
      console.warn(`[Security] Potential XSS detected: ${input.substring(0, 50)}...`, details);
    },
    logDataAccessViolation: (userId, dataType, details) => {
      console.warn(`[Security] Data access violation by ${userId} for ${dataType}`, details);
    },
    logAPIAccessViolation: (userId, endpoint, details) => {
      console.warn(`[Security] API access violation by ${userId} for ${endpoint}`, details);
    },
    logEmbeddingViolation: (domain, details) => {
      console.warn(`[Security] Embedding violation from ${domain}`, details);
    },
    logAdminAction: (userId, action, details) => {
      console.warn(`[Security] Admin action by ${userId}: ${action}`, details);
    }
  };
};

export const securityLogger = getSecurityLogger();
