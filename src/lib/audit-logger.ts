
import { logger } from './logger';
import { SecurityEventType } from './security/securityTypes';

class AuditLogger {
  // Re-export SecurityEventType for use in audit logs
  SecurityEventType = SecurityEventType;
  
  logSecurityEvent(
    eventType: SecurityEventType,
    status: 'SUCCESS' | 'FAILURE' | 'ATTEMPT',
    details?: Record<string, any>,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ): void {
    // In development, just log to console
    if (import.meta.env.DEV) {
      const logMethod = status === 'SUCCESS' ? logger.info : status === 'ATTEMPT' ? logger.warn : logger.error;
      logMethod(
        `Audit Event [${severity}]: ${eventType} (${status})`, 
        'AuditLogger', 
        details
      );
      return;
    }
    
    // In production, implement secure audit logging
    // This is just a placeholder
    logger.info(`Audit: ${eventType} (${status})`, 'AuditLogger', details);
  }
}

export const auditLogger = new AuditLogger();
