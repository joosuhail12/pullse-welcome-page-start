
import { ChatEventType, ChatEventPayload } from '../config';
import { EventPriority, EventCallback } from '../events/types';
import { getEventManager } from '../events/eventManager';
import { validateEventPayload } from '../events/validation';

/**
 * Enhanced event system that integrates with the main event manager
 * but adds additional validation and priority handling.
 */

/**
 * Dispatch a validated event to the event manager with priority
 * @param eventType The type of event to dispatch
 * @param data Optional data to include with the event
 * @param priority Optional priority level for the event
 * @returns The dispatched event payload
 */
export function dispatchValidatedEvent(
  eventType: ChatEventType | string, 
  data?: any, 
  priority: EventPriority = EventPriority.NORMAL
): ChatEventPayload | null {
  // Create the event object
  const event: ChatEventPayload = {
    type: eventType as ChatEventType,
    timestamp: new Date(),
    data: data || {}
  };

  // Validate the event before dispatching
  if (!validateEventPayload(event)) {
    console.warn('Invalid event payload rejected:', event);
    return null;
  }

  // Use the event manager to handle the event with the specified priority
  getEventManager().handleEvent(event, priority);
  
  // Also dispatch as DOM event for legacy consumers
  dispatchDomEvent(event);

  return event;
}

/**
 * Dispatch a DOM event that can be listened to by external code
 * @param event The event payload to dispatch
 */
function dispatchDomEvent(event: ChatEventPayload): void {
  try {
    const customEvent = new CustomEvent(`pullse:${event.type}`, {
      detail: event,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(customEvent);
    
    // Also dispatch a general event for 'catch-all' listeners
    const allEvent = new CustomEvent('pullse:all', {
      detail: event,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(allEvent);
  } catch (error) {
    console.error('Error dispatching DOM event:', error);
  }
}

/**
 * Subscribe to an enhanced event with validation
 * @param eventType The type of event to listen for
 * @param callback Function to call when the event is triggered
 * @returns Cleanup function to remove the event listener
 */
export function subscribeToEnhancedEvent(
  eventType: ChatEventType | 'all',
  callback: EventCallback
): () => void {
  return getEventManager().on(eventType, (event: ChatEventPayload) => {
    // Extra validation before calling the callback
    if (validateEventPayload(event)) {
      callback(event);
    } else {
      console.warn('Invalid event payload blocked from callback:', event);
    }
  });
}

/**
 * Re-export EventPriority for consumers
 */
export { EventPriority } from '../events/types';

// Add extra function to clean up event handlers for widget cleanup
export function cleanupEventHandlers(): void {
  // This is a simple wrapper around the event manager's cleanup method
  // to make it accessible from the widget loader
  getEventManager().removeAllListeners();
}
