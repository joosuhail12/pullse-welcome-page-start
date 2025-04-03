/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { PullseChatWidgetLoader } from './embed/widget-loader';
import { PullseChatWidgetOptions, EventCallback } from './embed/types';
import { ChatEventType, ChatEventPayload } from './config';
import { PullseChatWidgetAPI } from './embed/api';
import { PullseChatWidgetAPIImpl } from './embed/api-implementation';

// Create global Pullse object
(window as any).Pullse = (window as any).Pullse || {};

// Store initialized widgets
(window as any).__PULLSE_CHAT_WIDGETS__ = (window as any).__PULLSE_CHAT_WIDGETS__ || [];

/**
 * Initialize the chat widget and return the API
 */
(window as any).Pullse.initChatWidget = (options: PullseChatWidgetOptions): PullseChatWidgetAPI => {
  const widget = new PullseChatWidgetLoader(options);
  (window as any).__PULLSE_CHAT_WIDGETS__.push(widget);
  return widget;
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

// Extended API methods
(window as any).Pullse.openWidget = () => {
  if ((window as any).__PULLSE_CHAT_INSTANCE__) {
    (window as any).__PULLSE_CHAT_INSTANCE__.open();
  } else {
    console.error('Pullse Chat Widget not initialized');
  }
};

(window as any).Pullse.closeWidget = () => {
  if ((window as any).__PULLSE_CHAT_INSTANCE__) {
    (window as any).__PULLSE_CHAT_INSTANCE__.close();
  } else {
    console.error('Pullse Chat Widget not initialized');
  }
};

(window as any).Pullse.toggleWidget = () => {
  if ((window as any).__PULLSE_CHAT_INSTANCE__) {
    (window as any).__PULLSE_CHAT_INSTANCE__.toggle();
  } else {
    console.error('Pullse Chat Widget not initialized');
  }
};

(window as any).Pullse.sendMessage = (text: string, metadata?: Record<string, any>) => {
  if ((window as any).__PULLSE_CHAT_INSTANCE__) {
    return (window as any).__PULLSE_CHAT_INSTANCE__.sendMessage(text, metadata);
  } else {
    console.error('Pullse Chat Widget not initialized');
    return Promise.resolve();
  }
};

(window as any).Pullse.updateConfig = (options: Partial<PullseChatWidgetOptions>) => {
  if ((window as any).__PULLSE_CHAT_INSTANCE__) {
    (window as any).__PULLSE_CHAT_INSTANCE__.updateConfig(options);
  } else {
    console.error('Pullse Chat Widget not initialized');
  }
};

// Export for ESM environments
export default PullseChatWidgetLoader;
export { PullseChatWidgetAPI, PullseChatWidgetAPIImpl };
