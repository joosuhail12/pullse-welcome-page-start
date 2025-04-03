
import { PullseChatWidgetOptions } from '../types';
import { logger } from '@/lib/logger';
import { ChatPosition } from '../../config';

/**
 * Validate and sanitize widget options
 */
export function validateWidgetOptions(options: PullseChatWidgetOptions): PullseChatWidgetOptions {
  // Ensure required fields
  if (!options.workspaceId) {
    const error = new Error('workspaceId is required for Pullse Chat Widget');
    logger.error('Widget initialization failed: workspaceId is required', 'WidgetLoader', error);
    throw error;
  }
  
  // Clone options to avoid mutations
  const validatedOptions = { ...options };
  
  // Sanitize color values
  if (validatedOptions.primaryColor && !isValidColor(validatedOptions.primaryColor)) {
    logger.warn(
      `Invalid primary color: ${validatedOptions.primaryColor}, using default`, 
      'WidgetLoader'
    );
    delete validatedOptions.primaryColor;
  }
  
  // Validate position
  if (validatedOptions.position && !isValidChatPosition(validatedOptions.position)) {
    logger.warn(
      `Invalid position: ${validatedOptions.position}, using default`, 
      'WidgetLoader'
    );
    delete validatedOptions.position;
  }
  
  // Validate offsets
  if (validatedOptions.offsetX !== undefined && (isNaN(validatedOptions.offsetX) || validatedOptions.offsetX < 0)) {
    logger.warn(
      `Invalid offsetX: ${validatedOptions.offsetX}, using default`, 
      'WidgetLoader'
    );
    delete validatedOptions.offsetX;
  }
  
  if (validatedOptions.offsetY !== undefined && (isNaN(validatedOptions.offsetY) || validatedOptions.offsetY < 0)) {
    logger.warn(
      `Invalid offsetY: ${validatedOptions.offsetY}, using default`, 
      'WidgetLoader'
    );
    delete validatedOptions.offsetY;
  }
  
  return validatedOptions;
}

/**
 * Check if a position value is valid
 */
export function isValidChatPosition(position: any): boolean {
  if (typeof position !== 'string') {
    return false;
  }
  return ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(position);
}

/**
 * Check if a color value is valid
 */
export function isValidColor(color: string): boolean {
  // Check for valid hex, rgb, rgba, hsl, hsla, or named color
  const colorRegex = /^(#([0-9a-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\))$/i;
  
  return colorRegex.test(color) || [
    'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 
    'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 
    'teal', 'aqua'
  ].includes(color.toLowerCase());
}
