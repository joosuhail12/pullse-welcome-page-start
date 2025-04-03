
import { SecurityEvent, SecurityEventType, SecurityOutcome, SecuritySeverity } from './securityTypes';
import { logger } from '../logger';

class SecurityLogger {
  logSecurityEvent(
    eventType: SecurityEventType,
    outcome: SecurityOutcome,
    details?: Record<string, any>,
    severity: SecuritySeverity = 'MEDIUM'
  ): void {
    const securityEvent: SecurityEvent = {
      type: eventType,
      outcome,
      timestamp: new Date(),
      details: details || {},
      severity
    };
    
    // In development, just log to console
    if (import.meta.env.DEV) {
      const logMethod = outcome === 'SUCCESS' ? logger.info : outcome === 'ATTEMPT' ? logger.warn : logger.error;
      logMethod(
        `Security Event [${severity}]: ${eventType} (${outcome})`, 
        'SecurityLogger', 
        securityEvent.details
      );
      return;
    }
    
    // In production, should send to a secure logging endpoint
    // This is a placeholder for actual secure logging implementation
    if (severity === 'HIGH' || severity === 'CRITICAL' || outcome === 'FAILURE') {
      logger.error(
        `Security Event [${severity}]: ${eventType} (${outcome})`, 
        'SecurityLogger', 
        securityEvent.details
      );
      
      // In a real implementation, you would send this to a secure endpoint
      // fetch('/api/security/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(securityEvent)
      // }).catch(e => console.error('Failed to log security event', e));
    } else {
      logger.info(
        `Security Event: ${eventType} (${outcome})`, 
        'SecurityLogger', 
        securityEvent.details
      );
    }
  }
}

export const securityLogger = new SecurityLogger();
