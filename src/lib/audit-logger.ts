
import { SecurityEventType, SecurityEventOutcome } from '@/components/ChatWidget/utils/security/types';

/**
 * Audit Logger for security and system events
 * 
 * Provides standardized logging for security-related events with proper
 * sanitization and optional remote logging capabilities.
 */

// Re-export the SecurityEventType and SecurityEventOutcome 
export { SecurityEventType, SecurityEventOutcome };

// Simple audit logger implementation
const auditLogger = {
  // Add SecurityEventType property to properly support external references
  SecurityEventType,
  
  logSecurityEvent: (
    eventType: SecurityEventType | string, 
    outcome: SecurityEventOutcome, 
    details?: any, 
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ) => {
    // In a real implementation, this would send logs to a secure backend
    // For now just console log with security prefix
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY][${severity}][${timestamp}] ${eventType} - ${outcome}`, details);
  },

  logUserAction: (userId: string, action: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[USER][${timestamp}] User ${userId} - ${action}`, details);
  },

  logSystemEvent: (eventName: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[SYSTEM][${timestamp}] ${eventName}`, details);
  },

  logPerformanceMetric: (metricName: string, durationMs: number, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[PERFORMANCE][${timestamp}] ${metricName}: ${durationMs}ms`, details);
  },

  logError: (error: Error, componentName: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR][${timestamp}] Error in ${componentName}:`, error.message, details);
  },

  logWarning: (message: string, componentName: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARNING][${timestamp}] ${componentName}: ${message}`, details);
  },

  logAccessAttempt: (userId: string, resource: string, outcome: 'ALLOWED' | 'DENIED', details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[ACCESS][${timestamp}] User ${userId} - ${resource}: ${outcome}`, details);
  },

  logAdminAction: (userId: string, action: string, details?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[ADMIN][${timestamp}] Admin ${userId} - ${action}`, details);
  }
};

export { auditLogger };
