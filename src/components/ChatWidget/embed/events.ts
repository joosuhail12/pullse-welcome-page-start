
import { toast } from 'sonner';
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Valid event types that the widget can dispatch
 */
export const validEventTypes: ChatEventType[] = [
  'chat:loaded',
  'chat:opened',
  'chat:closed',
  'chat:minimized',
  'chat:maximized',
  'chat:error',
  'chat:ready',
  'message:sent',
  'message:received',
  'message:read',
  'message:delivered',
  'message:reaction',
  'file:upload',
  'contact:formCompleted',
  'chat:ended',
  'agent:typing',
  'agent:status',
  'web:pageView',
  'rating:submitted'
];

/**
 * Check if an event type is valid
 */
export function isValidEventType(eventType: string): eventType is ChatEventType {
  return validEventTypes.includes(eventType as ChatEventType);
}

/**
 * Dispatch a chat event to the window
 */
export function dispatchChatEvent(eventType: string, data?: any): void {
  try {
    // Skip invalid events in development
    if (!isValidEventType(eventType)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid event type: ${eventType}`);
      }
      return;
    }

    // Create event payload
    const payload: ChatEventPayload = {
      type: eventType as ChatEventType,
      timestamp: new Date(),
      data
    };

    // Dispatch window event
    window.dispatchEvent(
      new CustomEvent(`pullse:${eventType}`, {
        detail: payload,
        bubbles: true,
        cancelable: true
      })
    );

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event dispatched: ${eventType}`, data);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error dispatching event ${eventType}:`, error);
      toast.error(`Failed to dispatch event: ${eventType}`);
    }
  }
}

/**
 * Subscribe to a chat event
 */
export function subscribeToChatEvent(
  eventType: ChatEventType,
  callback: (payload: ChatEventPayload) => void
): () => void {
  const eventListener = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };

  const eventName = `pullse:${eventType}`;
  window.addEventListener(eventName, eventListener);

  // Return unsubscribe function
  return () => {
    window.removeEventListener(eventName, eventListener);
  };
}
