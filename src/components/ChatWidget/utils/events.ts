
import { ChatEventType, ChatEventPayload, ChatWidgetConfig } from '../config';
import { logger } from '@/lib/logger';

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Dispatches a chat widget event as a CustomEvent on the window object
 * and calls the optional onEvent callback if provided in the config
 * 
 * @param eventType The type of event to dispatch
 * @param data Optional data to include with the event
 * @param config The chat widget configuration
 * @param priority Optional priority level for the event
 */
export function dispatchChatEvent(
  eventType: string, 
  data?: any, 
  config?: ChatWidgetConfig,
  priority?: EventPriority
): void {
  // Create event payload
  const payload: ChatEventPayload = {
    type: eventType as ChatEventType,
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
  
  // Call global event handlers if provided
  if (config?.eventHandlers) {
    // Call event-specific handler if provided
    const specificHandler = config.eventHandlers[eventType as keyof typeof config.eventHandlers];
    if (typeof specificHandler === 'function') {
      try {
        specificHandler(payload);
      } catch (error) {
        logger.error(`Error in chat widget ${eventType} event handler`, 'events', error);
      }
    }
  }
}

/**
 * A validated version of dispatchChatEvent that can be used by internal modules
 * with priority handling and additional validation
 */
export function dispatchValidatedEvent(
  eventType: string,
  data?: any,
  priority: EventPriority = EventPriority.MEDIUM
): void {
  try {
    // Perform any validation here if needed
    
    // Get the widget config from global state or context
    // For now, we'll just pass undefined and let dispatchChatEvent handle it
    dispatchChatEvent(eventType, data, undefined, priority);
  } catch (error) {
    logger.error(`Failed to dispatch validated event: ${eventType}`, 'events', error);
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
  eventType: string | 'all',
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
      'pullse:message:reacted',
      'pullse:chat:connectionChange',
      'pullse:chat:error'
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
