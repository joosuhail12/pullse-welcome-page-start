
// Chat Widget Embed Script
import { ChatWidgetInterface } from './embed/types';
import { 
  createWidgetContainer, 
  renderLoadingPlaceholder, 
  renderWidget 
} from './embed/widget-initializer';
import { createWidgetAPI } from './embed/api-builder';

declare global {
  interface Window {
    ChatWidget?: ChatWidgetInterface;
  }
}

/**
 * Initialize the chat widget with the provided configuration
 */
function initChatWidget(config: any = {}) {
  console.log('Initializing chat widget with config:', config);

  // Create container and show loading placeholder
  const containerEl = createWidgetContainer();
  renderLoadingPlaceholder(containerEl, config.branding?.primaryColor);
  
  console.log('Loading chat widget components...');
  
  // Render the actual widget
  renderWidget(containerEl, config)
    .catch(err => console.error('Failed to load chat widget components:', err));
  
  // Return public API with event handling methods
  return createWidgetAPI();
}

// Expose the widget to the global scope
if (typeof window !== 'undefined') {
  console.log('Setting up global ChatWidget object');
  
  window.ChatWidget = {
    init: (config: any) => {
      console.log('ChatWidget.init called with config:', config);
      
      const api = initChatWidget(config);
      
      // Add methods to global object
      window.ChatWidget = {
        ...window.ChatWidget,
        ...api
      };
      
      return api;
    },
    open: () => {
      console.log('Global open method called');
      const event = new CustomEvent('pullse:widget:open');
      window.dispatchEvent(event);
    },
    close: () => {
      console.log('Global close method called');
      const event = new CustomEvent('pullse:widget:close');
      window.dispatchEvent(event);
    },
    toggle: () => {
      console.log('Global toggle method called');
      const event = new CustomEvent('pullse:widget:toggle');
      window.dispatchEvent(event);
    }
  } as ChatWidgetInterface;
}

export default initChatWidget;
