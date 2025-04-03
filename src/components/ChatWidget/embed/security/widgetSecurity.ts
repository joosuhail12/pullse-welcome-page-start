
/**
 * Widget Security Module
 * 
 * Contains security-related functionality for the chat widget loader
 * including validation and security enforcement.
 * 
 * SECURITY NOTICE: This module is critical for maintaining secure embedding
 * and should be carefully reviewed when making changes.
 */

import { PullseChatWidgetOptions } from '../types';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';
import { enforceHttps } from '../../utils/security/sessionManagement';
import { errorHandler } from '@/lib/error-handler';

/**
 * Performs all security checks and validations for widget initialization
 * 
 * @param options Configuration options for the widget
 * @returns True if all security checks pass, otherwise throws an error
 */
export function performSecurityChecks(options: PullseChatWidgetOptions): boolean {
  // Log widget initialization attempt
  auditLogger.logSecurityEvent(
    auditLogger.SecurityEventType.SECURITY_SETTING_CHANGE,
    'ATTEMPT',
    { 
      action: 'widget_initialize', 
      workspaceId: options.workspaceId,
      environment: import.meta.env.MODE
    },
    'LOW'
  );
  
  // Ensure HTTPS in production environments
  if (!enforceHttps()) {
    logger.warn(
      'Redirecting to HTTPS for security', 
      'WidgetLoader.initialize', 
      { url: window.location.href }
    );
    throw new Error('Insecure connection. Redirecting to HTTPS.');
  }
  
  // Security check passed
  return true;
}

/**
 * Logs a successful security validation for widget initialization
 * 
 * @param options Configuration options for the widget
 */
export function logSuccessfulInitialization(options: PullseChatWidgetOptions): void {
  auditLogger.logSecurityEvent(
    auditLogger.SecurityEventType.SECURITY_SETTING_CHANGE,
    'SUCCESS',
    { 
      action: 'widget_initialize', 
      workspaceId: options.workspaceId,
      environment: import.meta.env.MODE
    },
    'LOW'
  );
}

/**
 * Logs a failed security validation for widget initialization
 * 
 * @param options Configuration options for the widget
 * @param error The error that occurred
 */
export function logFailedInitialization(options: PullseChatWidgetOptions, error: unknown): void {
  auditLogger.logSecurityEvent(
    auditLogger.SecurityEventType.SECURITY_SETTING_CHANGE,
    'FAILURE',
    { 
      action: 'widget_initialize', 
      workspaceId: options.workspaceId || 'unknown',
      error
    },
    'MEDIUM'
  );
}
