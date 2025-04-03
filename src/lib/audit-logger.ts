
import { SecurityEventType, SecurityEventOutcome, SecurityEventSeverity } from '../components/ChatWidget/utils/securityTypes';

// Re-export the types with export type for isolatedModules
export type { SecurityEventType, SecurityEventOutcome, SecurityEventSeverity };

// Simple audit logger implementation
class AuditLogger {
  logSecurityEvent(
    eventType: SecurityEventType,
    outcome: SecurityEventOutcome,
    details?: any,
    severity: SecurityEventSeverity = 'MEDIUM'
  ) {
    if (import.meta.env.DEV) {
      console.log(`[SECURITY][${severity}][${outcome}] ${eventType}`, details);
    } else {
      // In production, we would send this to a logging service
      // or analytics platform
    }
  }

  logError(message: string, source: string, error: any) {
    if (import.meta.env.DEV) {
      console.error(`[ERROR][${source}] ${message}`, error);
    } else {
      // In production, we would send this to a logging service
    }
  }

  logWarning(message: string, source: string, details?: any) {
    if (import.meta.env.DEV) {
      console.warn(`[WARNING][${source}] ${message}`, details);
    }
  }

  logInfo(message: string, source: string, details?: any) {
    if (import.meta.env.DEV) {
      console.info(`[INFO][${source}] ${message}`, details);
    }
  }

  logDebug(message: string, source: string, details?: any) {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG][${source}] ${message}`, details);
    }
  }

  logApiRequest(endpoint: string, method: string, statusCode: number, duration: number) {
    if (import.meta.env.DEV) {
      console.log(`[API] ${method} ${endpoint} - Status: ${statusCode}, Duration: ${duration}ms`);
    }
  }

  logPerformance(operation: string, duration: number, details?: any) {
    if (import.meta.env.DEV) {
      console.log(`[PERFORMANCE] ${operation} - Duration: ${duration}ms`, details);
    }
  }

  logAdminAction(userId: string, action: string, details?: any) {
    if (import.meta.env.DEV) {
      console.log(`[ADMIN] User ${userId} performed action: ${action}`, details);
    }
  }
}

// Create and export a singleton instance
export const logger = new AuditLogger();
export const auditLogger = logger; // Export the same instance as auditLogger
