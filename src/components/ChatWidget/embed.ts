
/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { PullseChatWidgetLoader } from './embed/widget-loader';
import { PullseChatWidgetOptions, EventCallback } from './embed/types';
import { ChatEventType, ChatEventPayload } from './config';

/**
 * Create global Pullse object with enhanced API
 */
(window as any).Pullse = (window as any).Pullse || {};
(window as any).Pullse.initChatWidget = (options: PullseChatWidgetOptions) => {
  return new PullseChatWidgetLoader(options);
};

/**
 * Comprehensive API for programmatic control of the widget
 */
(window as any).Pullse.chatAPI = {
  // Widget visibility control
  open: () => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.open();
  },
  
  close: () => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.close();
  },
  
  toggle: () => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.toggle();
  },
  
  // User information
  setUserData: (userData: Record<string, any>) => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.setUserData(userData);
  },
  
  // Conversation management
  startConversation: (initialMessage?: string) => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.startConversation(initialMessage);
  },
  
  sendMessage: (message: string) => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.sendMessage(message);
  },
  
  // Appearance and customization
  updateConfig: (configUpdates: Partial<PullseChatWidgetOptions>) => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.updateConfig(configUpdates);
  },
  
  // Notification and badge management
  clearUnreadCounter: () => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return;
    }
    (window as any).__PULLSE_CHAT_INSTANCE__.clearUnreadCounter();
  },
  
  // Event handling
  getEventManager: () => {
    if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
      console.error('Pullse Chat Widget not initialized');
      return null;
    }
    return (window as any).__PULLSE_CHAT_INSTANCE__.eventManager;
  }
};

// Add event API to global Pullse object
(window as any).Pullse.on = (eventType: ChatEventType | 'all', callback: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return () => {};
  }
  return (window as any).__PULLSE_CHAT_INSTANCE__.on(eventType, callback);
};

(window as any).Pullse.off = (eventType: ChatEventType | 'all', callback?: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return;
  }
  (window as any).__PULLSE_CHAT_INSTANCE__.off(eventType, callback);
};

// Export for ESM environments
export default PullseChatWidgetLoader;
export { PullseChatWidgetLoader, ChatEventType, ChatEventPayload };
