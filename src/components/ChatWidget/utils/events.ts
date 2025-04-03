
import { ChatEventType, ChatEventPayload, ChatWidgetConfig } from '../config';
import { logger } from '@/lib/logger';
import { dispatchDomEvent } from '../events';

/**
 * Dispatches a chat widget event as a CustomEvent on the window object
 * and calls the optional onEvent callback if provided in the config
 * 
 * @param eventType The type of event to dispatch
 * @param data Optional data to include with the event
 * @param config The chat widget configuration
 */
export function dispatchChatEvent(
  eventType: ChatEventType, 
  data?: any, 
  config?: ChatWidgetConfig
): void {
  // Use the new centralized DOM event dispatcher
  dispatchDomEvent(eventType, data, config?.onEvent);
}

/**
 * Subscribe to chat widget events
 * 
 * @param eventType The type of event to listen for
 * @param callback Function to call when the event is triggered
 * @returns Cleanup function to remove the event listener
 */
export function subscribeToChatEvent(
  eventType: ChatEventType | 'all',
  callback: (payload: ChatEventPayload) => void
): () => void {
  // Use the new centralized DOM event subscription system
  return subscribeToDomEvent(eventType, callback);
}

/**
 * Register a global event handler for the widget
 */
export function registerGlobalEventHandler(
  callback: (payload: ChatEventPayload) => void
): () => void {
  logger.debug('Registering global event handler', 'events');
  return subscribeToChatEvent('all', callback);
}

// Import here to avoid circular dependencies
import { subscribeToDomEvent } from '../events';
