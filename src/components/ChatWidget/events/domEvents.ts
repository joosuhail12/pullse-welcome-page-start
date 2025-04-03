
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback } from './types';
import { logger } from '@/lib/logger';

/**
 * Dispatches a chat widget event as a CustomEvent on the window object
 * and calls the optional onEvent callback if provided in the config
 * 
 * @param eventType The type of event to dispatch
 * @param data Optional data to include with the event
 * @param config Object with optional onEvent callback
 */
export function dispatchDomEvent(
  eventType: ChatEventType, 
  data?: any, 
  onEventCallback?: (event: ChatEventPayload) => void
): void {
  // Create event payload
  const payload: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data
  };
  
  // Debug log in development only
  logger.debug(`Dispatching DOM event: ${eventType}`, 'DomEvents', {
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
  if (onEventCallback) {
    try {
      onEventCallback(payload);
    } catch (error) {
      logger.error('Error in event callback', 'DomEvents', error);
    }
  }
}

/**
 * Subscribe to chat widget DOM events
 * 
 * @param eventType The type of event to listen for
 * @param callback Function to call when the event is triggered
 * @returns Cleanup function to remove the event listener
 */
export function subscribeToDomEvent(
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
      'pullse:message:reacted',
      'pullse:chat:typingStarted',
      'pullse:chat:typingStopped',
      'pullse:message:fileUploaded',
      'pullse:chat:ended'
    ];
    
    logger.debug('Subscribing to all DOM events', 'DomEvents');
    allEvents.forEach(event => {
      window.addEventListener(event, handleEvent);
    });
    
    // Return cleanup function
    return () => {
      logger.debug('Unsubscribing from all DOM events', 'DomEvents');
      allEvents.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  } else {
    // Subscribe to specific event
    const eventName = 'pullse:' + eventType;
    
    logger.debug(`Subscribing to DOM event: ${eventName}`, 'DomEvents');
    window.addEventListener(eventName, handleEvent);
    
    // Return cleanup function
    return () => {
      logger.debug(`Unsubscribing from DOM event: ${eventName}`, 'DomEvents');
      window.removeEventListener(eventName, handleEvent);
    };
  }
}

/**
 * Register a global event handler for the widget
 */
export function registerGlobalDomEventHandler(
  callback: (payload: ChatEventPayload) => void
): () => void {
  logger.debug('Registering global DOM event handler', 'DomEvents');
  return subscribeToDomEvent('all', callback);
}
