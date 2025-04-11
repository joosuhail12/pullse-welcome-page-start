
import { WidgetEventType } from './types';
import { dispatchEvent } from './utils';

// Enhanced typing status tracking
const typingStatus: Record<string, boolean> = {};

/**
 * Dispatch typing events with necessary throttling and safety checks
 * @param type Event type
 * @param detail Event details
 */
export function dispatchTypingEvent(type: 'chat:typingStarted' | 'chat:typingStopped', detail: any): void {
  // Type safety check - typingStarted and typingStopped are special cases
  if (type === 'chat:typingStarted' || type === 'chat:typingStopped') {
    const userId = detail?.userId || 'unknown';
    
    // Prevent duplicate events for same state
    if (type === 'chat:typingStarted' && typingStatus[userId]) {
      return;
    }
    
    if (type === 'chat:typingStopped' && typingStatus[userId] === false) {
      return;
    }
    
    // Update typing status
    typingStatus[userId] = type === 'chat:typingStarted';
    
    // Dispatch the event
    dispatchEvent(type, {
      type,
      timestamp: new Date(),
      data: detail
    });
  }
}

/**
 * Safely dispatch chat widget events
 * @param type Event type
 * @param detail Event details 
 */
export function dispatchWidgetEvent(type: string, detail: any): void {
  // Create event payload
  const payload = {
    type,
    timestamp: new Date(),
    data: detail
  };
  
  // Dispatch the event
  dispatchEvent(type, payload);
}

/**
 * Register global event handler for the widget
 * @param callback Callback function
 */
export function registerGlobalEventHandler(
  callback: (event: any) => void
): () => void {
  // Define the event listener function
  const eventListener = (event: Event) => {
    try {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail);
    } catch (error) {
      console.error('Error in chat widget event handler', error);
    }
  };
  
  // List of events to listen to
  const eventTypes = [
    'pullse:chat:open',
    'pullse:chat:close',
    'pullse:chat:messageSent',
    'pullse:chat:messageReceived',
    'pullse:chat:typingStarted',
    'pullse:chat:typingStopped',
    'pullse:widget:loaded',
    'pullse:widget:error',
    'pullse:contact:initiated',
    'pullse:contact:formCompleted',
    'pullse:message:fileUploaded',
    'pullse:message:reacted',
    'pullse:chat:ended'
  ];
  
  // Register event listeners
  eventTypes.forEach(eventType => {
    window.addEventListener(eventType, eventListener);
  });
  
  // Return function to remove event listeners
  return () => {
    eventTypes.forEach(eventType => {
      window.removeEventListener(eventType, eventListener);
    });
  };
}
