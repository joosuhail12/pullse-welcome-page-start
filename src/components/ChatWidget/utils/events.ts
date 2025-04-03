
import { ChatEventType, ChatEventPayload, ChatWidgetConfig } from '../config';
import { logger } from '@/lib/logger';

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
  // Create event payload
  const payload: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data
  };
  
  // Debug log in development only
  logger.debug(`Dispatching event: ${eventType}`, 'events', {
    data: import.meta.env.DEV ? data : undefined
  });
  
  // Dispatch window CustomEvent
  window.dispatchEvent(
    new CustomEvent('pullse:' + eventType, {
      detail: payload,
      bubbles: true,
      cancelable: true
    })
  );
  
  // Call the onEvent callback if provided
  if (config?.onEvent) {
    try {
      config.onEvent(payload);
    } catch (error) {
      logger.error('Error in chat widget onEvent callback', 'events', error);
    }
  }
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
  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };

  if (eventType === 'all') {
    // Subscribe to all events
    const allEvents = [
      'pullse:chat:open',
      'pullse:chat:close',
      'pullse:chat:messageSent',
      'pullse:chat:messageReceived',
      'pullse:contact:initiatedChat',
      'pullse:contact:formCompleted',
      'pullse:message:reacted'
    ];
    
    logger.debug('Subscribing to all events', 'events');
    allEvents.forEach(event => {
      window.addEventListener(event, handleEvent);
    });
    
    // Return cleanup function
    return () => {
      logger.debug('Unsubscribing from all events', 'events');
      allEvents.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  } else {
    // Subscribe to specific event
    const eventName = 'pullse:' + eventType;
    
    logger.debug(`Subscribing to event: ${eventName}`, 'events');
    window.addEventListener(eventName, handleEvent);
    
    // Return cleanup function
    return () => {
      logger.debug(`Unsubscribing from event: ${eventName}`, 'events');
      window.removeEventListener(eventName, handleEvent);
    };
  }
}

/**
 * Register a global event handler for the widget
 * This function is exposed to the host website
 */
export function registerGlobalEventHandler(
  callback: (payload: ChatEventPayload) => void
): () => void {
  logger.debug('Registering global event handler', 'events');
  return subscribeToChatEvent('all', callback);
}
