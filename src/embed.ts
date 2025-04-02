
// Chat Widget Embed Script
import { createRoot } from 'react-dom/client';
import React from 'react';
import { ChatWidgetProvider, ChatWidget } from './components/ChatWidget';

declare global {
  interface Window {
    ChatWidget?: {
      init: (config: any) => void;
      open: () => void;
      close: () => void;
      toggle: () => void;
    };
  }
}

/**
 * Initialize the chat widget with the provided configuration
 */
function initChatWidget(config: any = {}) {
  // Create container element if it doesn't exist
  let containerEl = document.getElementById('pullse-chat-widget-container');
  
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'pullse-chat-widget-container';
    document.body.appendChild(containerEl);
  }
  
  // Render the chat widget
  const root = createRoot(containerEl);
  root.render(
    React.createElement(
      ChatWidgetProvider, 
      { config },
      React.createElement(ChatWidget, { workspaceId: config.workspaceId })
    )
  );
  
  // Return public API
  return {
    open: () => {
      const event = new CustomEvent('pullse:widget:open');
      window.dispatchEvent(event);
    },
    close: () => {
      const event = new CustomEvent('pullse:widget:close');
      window.dispatchEvent(event);
    },
    toggle: () => {
      const event = new CustomEvent('pullse:widget:toggle');
      window.dispatchEvent(event);
    }
  };
}

// Expose the widget to the global scope
if (typeof window !== 'undefined') {
  window.ChatWidget = {
    init: (config: any) => {
      const api = initChatWidget(config);
      
      // Add methods to global object
      window.ChatWidget = {
        ...window.ChatWidget,
        ...api
      };
      
      return api;
    },
    open: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.'),
    close: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.'),
    toggle: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.')
  };
}

export default initChatWidget;
