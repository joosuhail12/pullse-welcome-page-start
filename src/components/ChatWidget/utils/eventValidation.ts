
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Validates that an event payload matches the expected format
 * @param payload Event payload to validate
 * @returns boolean indicating if the payload is valid
 */
export function validateEventPayload(payload: any): payload is ChatEventPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  
  // Check for required fields
  if (typeof payload.type !== 'string' || !(payload.timestamp instanceof Date)) {
    return false;
  }
  
  // Validate that the event type is a known type
  const validEventType = Object.values(eventValidators).some(
    validator => payload.type in validator
  );
  
  return validEventType;
}

// Type-specific validators for event data
const eventValidators: Record<string, Record<string, (data: any) => boolean>> = {
  validationMap: {
    'chat:open': (data: any) => true, // No specific validation needed
    'chat:close': (data: any) => true, // No specific validation needed
    'chat:messageSent': (data: any) => 
      typeof data === 'object' && 
      typeof data.messageId === 'string' &&
      typeof data.text === 'string',
    'chat:messageReceived': (data: any) =>
      typeof data === 'object' &&
      typeof data.messageId === 'string' &&
      typeof data.text === 'string',
    'contact:initiatedChat': (data: any) =>
      typeof data === 'object' &&
      typeof data.sessionId === 'string',
    'contact:formCompleted': (data: any) => 
      typeof data === 'object' &&
      typeof data.formData === 'object',
    'message:reacted': (data: any) =>
      typeof data === 'object' &&
      typeof data.messageId === 'string' &&
      typeof data.reaction === 'string',
    'chat:typingStarted': (data: any) => 
      typeof data === 'object',
    'chat:typingStopped': (data: any) =>
      typeof data === 'object',
    'message:fileUploaded': (data: any) =>
      typeof data === 'object' &&
      typeof data.messageId === 'string' &&
      typeof data.fileInfo === 'object',
    'chat:ended': (data: any) => true,
    'chat:error': (data: any) => 
      typeof data === 'object' &&
      typeof data.error === 'string',
    'chat:connectionChange': (data: any) => 
      typeof data === 'object' &&
      typeof data.status === 'string',
    'typing': (data: any) => 
      typeof data === 'object' &&
      typeof data.status === 'string'
  }
};

// Create a validated event
export function createValidatedEvent(type: string, data?: any): ChatEventPayload | null {
  const event = {
    type: type as ChatEventType,
    timestamp: new Date(),
    data: data || {}
  };
  
  if (validateEventPayload(event)) {
    return event;
  }
  
  return null;
}

// Define EventPriority as an enum with values
export enum EventPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  NORMAL = 'normal',
  LOW = 'low'
}
