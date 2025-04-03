
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
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { validateWidgetOptions } from './core/optionsValidator';
import { 
  performSecurityChecks, 
  logSuccessfulInitialization, 
  logFailedInitialization 
} from './security/widgetSecurity';
import { 
  setupEventHandlers, 
  dispatchWidgetEvent, 
  subscribeToWidgetEvent, 
  unsubscribeFromWidgetEvent, 
  cleanupEventHandlers 
} from './events/widgetEvents';
import { 
  initializeWidgetContainer, 
  loadWidgetScript,
  initializeWidgetEvents,
  cleanupWidgetReferences
} from './initialization/widgetInitializer';

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
    // Validate options
    const validatedOptions = validateWidgetOptions(options);
    
    // Perform security checks
    performSecurityChecks(validatedOptions);
    
    // Initialize widget instance
    const widgetInstance = new PullseChatWidgetLoader(validatedOptions);
    
    // Log successful initialization
    logSuccessfulInitialization(validatedOptions);
    
    return widgetInstance;
  } catch (error) {
    // Sanitize error message before logging
    const safeErrorMessage = sanitizeErrorMessage(error);
    logger.error('Failed to initialize widget', 'WidgetLoader', { error: safeErrorMessage });
    
    // Log initialization failure
    logFailedInitialization(options, safeErrorMessage);
    
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

// Export events API
export {
  subscribeToWidgetEvent as on,
  unsubscribeFromWidgetEvent as off,
  dispatchWidgetEvent
};
