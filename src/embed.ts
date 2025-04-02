
// Chat Widget Embed Script
import { ChatWidgetInterface } from './embed/types';
import { 
  createWidgetContainer, 
  renderLoadingPlaceholder, 
  renderWidget 
} from './embed/widget-initializer';
import { createWidgetAPI } from './embed/api-builder';
import { dispatchWidgetEvent, WIDGET_EVENTS } from './embed/event-dispatcher';

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
  
  // Render the actual widget
  renderWidget(containerEl, config)
    .catch(err => console.error('Failed to load chat widget components:', err));
  
  // Return public API with event handling methods
  return createWidgetAPI();
}

// Expose the widget to the global scope
if (typeof window !== 'undefined') {
  console.log('Setting up global ChatWidget object');
  
  // Create the global API with streamlined implementation
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
      dispatchWidgetEvent(WIDGET_EVENTS.OPEN);
    },
    close: () => {
      console.log('Global close method called');
      dispatchWidgetEvent(WIDGET_EVENTS.CLOSE);
    },
    toggle: () => {
      console.log('Global toggle method called');
      dispatchWidgetEvent(WIDGET_EVENTS.TOGGLE);
    }
  } as ChatWidgetInterface;
}

export default initChatWidget;
