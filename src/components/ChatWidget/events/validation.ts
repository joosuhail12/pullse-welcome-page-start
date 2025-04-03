
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Event validation schema definitions
 */
const eventSchemas: Record<ChatEventType, (data: any) => boolean> = {
  'chat:open': (data) => true, // No specific data requirements
  'chat:close': (data) => true, // No specific data requirements
  'chat:messageSent': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      typeof data.messageId === 'string' &&
      typeof data.text === 'string');
  },
  'chat:messageReceived': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      typeof data.messageId === 'string');
  },
  'contact:initiatedChat': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      typeof data.sessionId === 'string');
  },
  'contact:formCompleted': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      Array.isArray(data.fields));
  },
  'message:reacted': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      typeof data.messageId === 'string' && 
      (data.reaction === 'thumbsUp' || data.reaction === 'thumbsDown' || data.reaction === null));
  },
  'chat:typingStarted': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      (typeof data.userId === 'string' || typeof data.agentId === 'string'));
  },
  'chat:typingStopped': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      (typeof data.userId === 'string' || typeof data.agentId === 'string'));
  },
  'message:fileUploaded': (data) => {
    return !!(data && 
      typeof data === 'object' && 
      typeof data.messageId === 'string' && 
      typeof data.fileName === 'string');
  },
  'chat:ended': (data) => true // No specific data requirements
};

/**
 * Validates event data based on event type
 * @param eventType Type of the event
 * @param data Event data payload
 * @returns Whether the data is valid for this event type
 */
export const validateEventData = (eventType: ChatEventType, data: any): boolean => {
  if (!eventSchemas[eventType]) {
    console.warn(`No validation schema defined for event type: ${eventType}`);
    return true; // Allow unknown event types to pass through
  }
  
  return eventSchemas[eventType](data);
};

/**
 * Sanitizes event data by removing any potentially dangerous fields
 * @param data Event data to sanitize
 * @returns Sanitized event data
 */
export const sanitizeEventData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Create a copy to avoid mutating the original object
  const sanitized = { ...data };
  
  // Remove potentially dangerous properties
  const dangerousProps = ['__proto__', 'constructor', 'prototype'];
  dangerousProps.forEach(prop => {
    if (prop in sanitized) {
      delete sanitized[prop];
    }
  });
  
  return sanitized;
};

/**
 * Validates a complete event payload
 * @param event The event payload to validate
 * @returns Whether the event payload is valid
 */
export const validateEventPayload = (event: ChatEventPayload): boolean => {
  // Check required fields
  if (!event.type || !event.timestamp) {
    return false;
  }
  
  // Validate based on event type
  return validateEventData(event.type, event.data);
};

/**
 * Creates a validated event payload
 * @param type Event type
 * @param data Event data
 * @returns Validated event payload or null if invalid
 */
export const createValidatedEvent = (type: ChatEventType, data?: any): ChatEventPayload | null => {
  // Sanitize the data first
  const sanitizedData = data ? sanitizeEventData(data) : undefined;
  
  // Create the event payload
  const event: ChatEventPayload = {
    type,
    timestamp: new Date(),
    data: sanitizedData
  };
  
  // Validate the event
  if (!validateEventPayload(event)) {
    console.error(`Invalid event payload for type: ${type}`, data);
    return null;
  }
  
  return event;
};
