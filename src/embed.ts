
// Chat Widget Embed Script
import { ChatWidgetInterface } from './embed/types';
import { 
  createWidgetContainer, 
  renderLoadingPlaceholder, 
  renderWidget,
  attemptOpenWidget
} from './embed/widget-initializer';
import { createWidgetAPI } from './embed/api-builder';
import { dispatchWidgetEvent, WIDGET_EVENTS, forceTriggerEvent } from './embed/event-dispatcher';

declare global {
  interface Window {
    ChatWidget?: ChatWidgetInterface;
    __CHAT_WIDGET_LOADED__?: boolean;
    __CHAT_WIDGET_DEBUG__?: boolean;
  }
}

/**
 * Initialize the chat widget with the provided configuration
 */
function initChatWidget(config: any = {}) {
  console.log('Initializing chat widget with config:', config);
  
  // Setup debug mode if needed
  window.__CHAT_WIDGET_DEBUG__ = config.debug || false;
  
  // Prevent double initialization
  if (window.__CHAT_WIDGET_LOADED__) {
    console.warn('Chat widget already initialized, skipping');
    return window.ChatWidget;
  }
  
  try {
    // Create container and show loading placeholder
    const containerEl = createWidgetContainer();
    renderLoadingPlaceholder(containerEl, config.branding?.primaryColor);
    
    // Flag as loaded to prevent double initialization
    window.__CHAT_WIDGET_LOADED__ = true;
    
    // Render the actual widget
    renderWidget(containerEl, config)
      .then(() => {
        console.log('🎉 Chat widget loaded successfully');
        // Immediately attempt to open widget after loading
        setTimeout(() => attemptOpenWidget(), 300);
      })
      .catch(err => {
        console.error('❌ Failed to load chat widget components:', err);
        // Try to recover from failed initialization
        setTimeout(() => {
          forceTriggerEvent(WIDGET_EVENTS.OPEN); 
        }, 800);
      });
    
    // Return public API with event handling methods
    return createWidgetAPI();
  } catch (error) {
    console.error('Fatal error during widget initialization:', error);
    return {}; // Return empty object to prevent further errors
  }
}

// Expose the widget to the global scope
if (typeof window !== 'undefined') {
  console.log('Setting up global ChatWidget object');
  
  // Create the global API with streamlined implementation
  window.ChatWidget = {
    init: (config: any) => {
      console.log('ChatWidget.init called with config:', config);
      
      try {
        const api = initChatWidget(config);
        
        // Add methods to global object
        window.ChatWidget = {
          ...window.ChatWidget,
          ...api
        };
        
        // Ensure widget opens after initialization with multiple attempts
        for (let delay = 300; delay <= 1500; delay += 400) {
          setTimeout(() => {
            console.log(`Attempt to open widget after ${delay}ms`);
            forceTriggerEvent(WIDGET_EVENTS.OPEN);
            if (window.ChatWidget && window.ChatWidget.open) {
              window.ChatWidget.open();
            }
          }, delay);
        }
        
        return api;
      } catch (error) {
        console.error('Error initializing widget:', error);
        return {}; // Return empty object to prevent further errors
      }
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
  
  // Add window-level debugging to track widget events
  window.addEventListener('pullse:widget:open', () => {
    console.log('🔔 Widget OPEN event received at window level');
  });
  
  window.addEventListener('pullse:widget:close', () => {
    console.log('🔔 Widget CLOSE event received at window level');
  });
  
  window.addEventListener('pullse:widget:toggle', () => {
    console.log('🔔 Widget TOGGLE event received at window level');
  });
  
  // Add extra diagnostics for debugging
  window.addEventListener('pullse:widget:render', () => {
    console.log('🎨 Widget RENDER event received - widget content should be visible');
  });
  
  window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM fully loaded and parsed, widget should be initialized if configured for auto-load');
  });
}

export default initChatWidget;
