
// Chat Widget Embed Script
import { createRoot } from 'react-dom/client';
import React from 'react';
import { ChatWidgetInterface } from './embed/types';

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

  // Create container element if it doesn't exist
  let containerEl = document.getElementById('pullse-chat-widget-container');
  
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = 'pullse-chat-widget-container';
    document.body.appendChild(containerEl);
    console.log('Created chat widget container element');
  }
  
  // Create a placeholder for the widget while it's loading
  const placeholderRoot = createRoot(containerEl);
  placeholderRoot.render(
    React.createElement('div', {
      className: 'chat-widget-loading',
      style: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: config.branding?.primaryColor || '#6366f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999
      }
    }, React.createElement('div', {
      style: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        animation: 'chat-widget-spin 1s linear infinite'
      }
    }))
  );
  
  // Add the loading animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes chat-widget-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  console.log('Loading chat widget components...');
  
  // Dynamically import the widget components
  Promise.all([
    import('./components/ChatWidget/ChatWidgetProvider'),
    import('./components/ChatWidget/ChatWidget')
  ]).then(([{ ChatWidgetProvider }, { default: ChatWidget }]) => {
    console.log('Chat widget components loaded successfully');
    
    const root = createRoot(containerEl);
    root.render(
      React.createElement(
        ChatWidgetProvider, 
        { 
          config, 
          children: React.createElement(ChatWidget, { workspaceId: config.workspaceId })
        }
      )
    );
    
    // Force widget to be shown
    setTimeout(() => {
      const event = new CustomEvent('pullse:widget:open');
      window.dispatchEvent(event);
      console.log('Chat widget opened via event');
    }, 200);
  }).catch(err => {
    console.error('Failed to load chat widget:', err);
    // Create a fallback for error cases
    const root = createRoot(containerEl);
    root.render(
      React.createElement('div', {
        style: { 
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999
        }
      }, React.createElement('p', null, 'Failed to load chat widget. Please try again later.'))
    );
  });
  
  // Return public API with event handling methods
  return {
    open: () => {
      console.log('Opening chat widget via API');
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
    },
    on: (eventName: string, callback: (detail: any) => void) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      
      const handler = (event: CustomEvent) => {
        callback(event.detail);
      };
      
      window.addEventListener(fullEventName, handler as EventListener);
      return () => window.removeEventListener(fullEventName, handler as EventListener);
    },
    off: (eventName: string, handler: EventListener) => {
      const eventPrefix = eventName.startsWith('pullse:') ? '' : 'pullse:';
      const fullEventName = `${eventPrefix}${eventName}`;
      window.removeEventListener(fullEventName, handler);
    }
  };
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
    open: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.'),
    close: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.'),
    toggle: () => console.warn('Chat widget not initialized. Call ChatWidget.init() first.')
  } as ChatWidgetInterface;
}

export default initChatWidget;
