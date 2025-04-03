/**
 * Pullse Chat Widget Loader
 * 
 * This module provides the core functionality for loading and initializing
 * the Pullse Chat Widget with various configuration options.
 * 
 * SECURITY NOTICE: The widget loader is a critical security boundary and
 * must carefully validate all inputs and enforce security controls.
 */

import { PullseChatWidgetLoader } from './core/WidgetLoaderClass';
import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType } from '../config';
import { validateEventPayload } from '../utils/eventValidation';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { enforceHttps } from '../utils/security/sessionManagement';
import { auditLogger } from '@/lib/audit-logger';
import { errorHandler } from '@/lib/error-handler';

// Export the main class for direct usage
export { PullseChatWidgetLoader };

// Add convenience method for initialization with enhanced security
/**
 * Initialize the Chat Widget with security checks and logging
 * @param options Configuration options for the widget
 * @returns Initialized widget instance
 * 
 * TODO: Add domain allowlisting for embedding security
 * TODO: Implement stricter origin validation
 * TODO: Consider adding Permissions-Policy headers
 */
export function initializeWidget(options: PullseChatWidgetOptions): PullseChatWidgetLoader {
  try {
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
    
    const widgetInstance = new PullseChatWidgetLoader(options);
    
    // Log successful widget initialization
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
    
    return widgetInstance;
  } catch (error) {
    // Sanitize error message before logging
    const safeErrorMessage = sanitizeErrorMessage(error);
    logger.error('Failed to initialize widget', 'WidgetLoader', { error: safeErrorMessage });
    
    // Log initialization failure
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.SECURITY_SETTING_CHANGE,
      'FAILURE',
      { 
        action: 'widget_initialize', 
        workspaceId: options.workspaceId || 'unknown',
        error: safeErrorMessage
      },
      'MEDIUM'
    );
    
    throw error;
  }
}

// Export utility functions for advanced usage
export {
  validateWidgetOptions,
  isValidColor
} from './core/optionsValidator';

export {
  getPositionStyles,
  initializeWidgetDOM
} from './core/domManager';
