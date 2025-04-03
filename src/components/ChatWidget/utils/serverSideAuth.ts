import { auditLogger } from '@/lib/audit-logger';
import { SecurityEventType } from '@/lib/securityTypes';

/**
 * Utility function to indicate that a feature requires server-side implementation
 * @param featureName Name of the feature that requires server-side implementation
 * @param details Additional details about the feature
 * @returns Placeholder value to indicate that the feature is not implemented
 */
export function requiresServerImplementation<T>(featureName: string, details?: Record<string, any>): T {
  // Log the attempted access to server-side functionality
  auditLogger.logSecurityEvent(
    SecurityEventType.SUSPICIOUS_ACTIVITY, 
    'ATTEMPT',
    {
      feature: featureName,
      environment: import.meta.env.MODE,
      ...details
    }
  );
  
  // In development mode, show a warning
  if (import.meta.env.DEV) {
    console.warn(`Feature "${featureName}" requires server-side implementation. Returning placeholder.`);
  }
  
  // Return a placeholder value
  return `SERVER_IMPLEMENTATION_REQUIRED: ${featureName}` as T;
}
