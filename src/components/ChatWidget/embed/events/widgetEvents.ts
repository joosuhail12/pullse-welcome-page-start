
/**
 * Widget Events Module
 * 
 * Manages event registration, dispatch, and handling for the chat widget.
 */

import { ChatEventType, ChatEventPayload } from '../../config';
import { EventCallback } from '../types';
import { EventPriority, getEventManager } from '../../events';
import { validateEventPayload } from '../../events/validation';
import { logger } from '@/lib/logger';

/**
 * Set up widget event handlers from configuration
 * 
 * @param eventHandler Global event handler
 * @param eventHandlers Specific event handlers
 */
export function setupEventHandlers(
  eventHandler?: EventCallback,
  eventHandlers?: Record<string, EventCallback>
): void {
  const eventManager = getEventManager();
  
  // Register global event handler if provided
  if (eventHandler) {
    logger.debug('Registering global onEvent handler', 'WidgetEvents');
    eventManager.on('all', eventHandler);
  }
  
  // Register specific event handlers if provided
  if (eventHandlers) {
    logger.debug('Registering event handlers', 'WidgetEvents');
    Object.entries(eventHandlers).forEach(([eventType, handler]) => {
      if (handler) {
        eventManager.on(eventType as ChatEventType, handler);
      }
    });
  }
}

/**
 * Dispatch an event through the event manager
 * 
 * @param event Event payload to dispatch
 */
export function dispatchWidgetEvent(event: ChatEventPayload): void {
  const eventManager = getEventManager();
  
  // Validate event before dispatching
  if (validateEventPayload(event)) {
    eventManager.dispatch(event.type, event.data);
  } else {
    logger.warn('Invalid event payload detected and blocked', 'WidgetEvents', { event });
  }
}

/**
 * Subscribe to widget events
 * 
 * @param eventType Type of event to subscribe to
 * @param callback Callback function to execute on event
 * @returns Function to unsubscribe from events
 */
export function subscribeToWidgetEvent(
  eventType: ChatEventType | 'all', 
  callback: EventCallback
): () => void {
  logger.debug(`Subscribing to ${eventType} events`, 'WidgetEvents');
  const eventManager = getEventManager();
  return eventManager.on(eventType, callback);
}

/**
 * Unsubscribe from widget events
 * 
 * @param eventType Type of event to unsubscribe from
 * @param callback Optional specific callback to unsubscribe
 */
export function unsubscribeFromWidgetEvent(
  eventType: ChatEventType | 'all', 
  callback?: EventCallback
): void {
  logger.debug(`Unsubscribing from ${eventType} events`, 'WidgetEvents');
  const eventManager = getEventManager();
  eventManager.off(eventType, callback);
}

/**
 * Clean up all event handlers and subscriptions
 */
export function cleanupEventHandlers(): void {
  getEventManager().removeAllListeners();
}
