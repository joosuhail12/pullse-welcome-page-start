
import { PullseChatWidgetOptions } from '../types';
import { logger } from '@/lib/logger';

/**
 * Initialize widget DOM elements and scripts
 */
export function initializeWidgetDOM(options: PullseChatWidgetOptions): void {
  // Check if the widget script is already loaded
  if (document.getElementById('pullse-chat-widget-script')) {
    logger.warn('Pullse Chat Widget script already loaded.', 'DOMManager');
    return;
  }
  
  // Create a loading indicator before the script loads
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'pullse-chat-widget-loading';
  loadingIndicator.style.position = 'fixed';
  loadingIndicator.style.bottom = '20px';
  loadingIndicator.style.right = '20px';
  loadingIndicator.style.width = '50px';
  loadingIndicator.style.height = '50px';
  loadingIndicator.style.backgroundColor = '#f0f0f0';
  loadingIndicator.style.borderRadius = '50%';
  loadingIndicator.style.display = 'flex';
  loadingIndicator.style.alignItems = 'center';
  loadingIndicator.style.justifyContent = 'center';
  loadingIndicator.style.zIndex = '9999';
  loadingIndicator.innerHTML = `<div style="width: 20px; height: 20px; border: 3px solid #ccc; border-top-color: #10B981; border-radius: 50%; animation: pullse-loading-spin 1s linear infinite;"></div>
    <style>@keyframes pullse-loading-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`;
  
  document.body.appendChild(loadingIndicator);
  
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
    
    // Remove loading indicator when script is loaded
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };
  
  // Handle script error event
  script.onerror = (error) => {
    logger.error('Failed to load Pullse Chat Widget script', 'DOMManager', error);
    
    // Remove loading indicator if there's an error
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };
  
  // Append the script to the document body
  document.body.appendChild(script);
}

/**
 * Apply position styles based on configuration
 */
export function getPositionStyles(position: string, offsetX: number, offsetY: number): string {
  switch (position) {
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
