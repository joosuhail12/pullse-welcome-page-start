
/**
 * Widget Initializer Module
 * 
 * Handles the core initialization logic for the chat widget,
 * separating it from security and event handling concerns.
 */

import { PullseChatWidgetOptions } from '../types';
import { logger } from '@/lib/logger';
import { initializeWidgetDOM } from '../core/domManager';
import { validateWidgetOptions } from '../core/optionsValidator';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { performSecurityChecks, logSuccessfulInitialization, logFailedInitialization } from '../security/widgetSecurity';
import { setupEventHandlers, dispatchWidgetEvent } from '../events/widgetEvents';

/**
 * Initialize the widget container, script, and global references
 * 
 * @param options Widget configuration options
 * @returns HTMLElement container for the widget or null if initialization failed
 */
export function initializeWidgetContainer(
  options: PullseChatWidgetOptions
): HTMLElement | null {
  try {
    logger.info('Initializing Pullse Chat Widget container', 'WidgetInitializer');
    
    // Perform security checks first
    performSecurityChecks(options);
    
    // Create container for widget
    const container = document.createElement('div');
    container.id = 'pullse-chat-widget-container';
    document.body.appendChild(container);
    
    // Store global instance reference
    (window as any).__PULLSE_CHAT_CONFIG__ = options;
    
    // Log successful initialization
    logSuccessfulInitialization(options);
    
    return container;
  } catch (error) {
    // Sanitize the error message before logging
    const safeErrorMessage = sanitizeErrorMessage(error);
    
    logger.error('Failed to initialize Pullse Chat Widget container', 'WidgetInitializer', {
      error: safeErrorMessage
    });
    
    // Log initialization failure
    logFailedInitialization(options, safeErrorMessage);
    
    // Dispatch error event
    dispatchWidgetEvent({
      type: 'chat:error',
      timestamp: new Date(),
      data: {
        error: 'initialization_failed',
        message: safeErrorMessage
      }
    });
    
    return null;
  }
}

/**
 * Load the widget script and initialize DOM elements
 * 
 * @param options Widget configuration options
 * @returns Promise that resolves when loading is complete
 */
export function loadWidgetScript(options: PullseChatWidgetOptions): void {
  logger.debug('Loading widget script', 'WidgetInitializer');
  initializeWidgetDOM(options);
}

/**
 * Initialize the widget's event system
 * 
 * @param options Widget configuration options
 */
export function initializeWidgetEvents(options: PullseChatWidgetOptions): void {
  logger.debug('Setting up widget event handlers', 'WidgetInitializer');
  setupEventHandlers(options.onEvent, options.eventHandlers);
}

/**
 * Cleans up global widget references
 */
export function cleanupWidgetReferences(): void {
  logger.debug('Cleaning up widget global references', 'WidgetInitializer');
  delete (window as any).__PULLSE_CHAT_INSTANCE__;
  delete (window as any).__PULLSE_CHAT_CONFIG__;
}
