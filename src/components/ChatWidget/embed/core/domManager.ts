
import { PullseChatWidgetOptions } from '../types';
import { logger } from '@/lib/logger';
import { ChatPositionString } from '../../types';
import { isValidChatPosition } from './optionsValidator';

/**
 * Initialize widget DOM elements and scripts
 */
export function initializeWidgetDOM(options: PullseChatWidgetOptions): void {
  // Check if the widget script is already loaded
  if (document.getElementById('pullse-chat-widget-script')) {
    logger.warn('Pullse Chat Widget script already loaded.', 'DOMManager');
    return;
  }
  
  // Create the script element
  const script = document.createElement('script');
  script.src = 'https://cdn.pullse.io/chat-widget.js';
  script.async = true;
  script.id = 'pullse-chat-widget-script';
  
  // Set global config object
  (window as any).__PULLSE_CHAT_CONFIG__ = options;
  
  // Handle script load event
  script.onload = () => {
    logger.info('Pullse Chat Widget script loaded successfully.', 'DOMManager');
    
    // Initialize the chat widget if the init function exists
    if (typeof (window as any).initPullseChatWidget === 'function') {
      (window as any).initPullseChatWidget(options);
    } else {
      logger.warn('initPullseChatWidget function not found in the loaded script.', 'DOMManager');
    }
  };
  
  // Handle script error event
  script.onerror = (error) => {
    logger.error('Failed to load Pullse Chat Widget script', 'DOMManager', error);
  };
  
  // Append the script to the document body
  document.body.appendChild(script);
}

/**
 * Apply position styles based on configuration
 * Ensures that position is a valid ChatPositionString
 */
export function getPositionStyles(position: string, offsetX: number, offsetY: number): string {
  // Validate the position or use default
  const validPosition: ChatPositionString = isValidChatPosition(position) 
    ? position as ChatPositionString
    : 'bottom-right';
    
  // Apply appropriate CSS based on the position
  switch (validPosition) {
    case 'bottom-left':
      return `bottom: ${offsetY}px; left: ${offsetX}px;`;
    case 'top-right':
      return `top: ${offsetY}px; right: ${offsetX}px;`;
    case 'top-left':
      return `top: ${offsetY}px; left: ${offsetX}px;`;
    case 'bottom-right':
    default:
      return `bottom: ${offsetY}px; right: ${offsetX}px;`;
  }
}
