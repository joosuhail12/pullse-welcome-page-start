
/**
 * Pullse Chat Widget Loader
 * 
 * This module provides the core functionality for loading and initializing
 * the Pullse Chat Widget with various configuration options.
 */

import { PullseChatWidgetLoader } from './core/WidgetLoaderClass';
import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType } from '../config';
import { validateEventPayload } from '../utils/eventValidation';
import { logger } from '@/lib/logger';

// Export the main class for direct usage
export { PullseChatWidgetLoader };

// Add convenience method for initialization
export function initializeWidget(options: PullseChatWidgetOptions): PullseChatWidgetLoader {
  try {
    return new PullseChatWidgetLoader(options);
  } catch (error) {
    logger.error('Failed to initialize widget', 'WidgetLoader', error);
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
