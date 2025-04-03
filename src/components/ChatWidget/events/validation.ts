
import { ChatEventType, ChatEventPayload } from '../config';
import { logger } from '@/lib/logger';

/**
 * Valid event types for validation
 */
const VALID_EVENT_TYPES: Set<ChatEventType> = new Set([
  'chat:open',
  'chat:close',
  'chat:messageSent',
  'chat:messageReceived',
  'contact:initiatedChat',
  'contact:formCompleted',
  'message:reacted',
  'chat:typingStarted',
  'chat:typingStopped',
  'message:fileUploaded',
  'chat:ended'
]);

/**
 * Validates an event payload
 * @param payload Event payload to validate
 * @returns Boolean indicating if event is valid
 */
export function validateEventPayload(payload: any): payload is ChatEventPayload {
  if (!payload || typeof payload !== 'object') {
    logger.warn('Invalid event payload: not an object', 'validation');
    return false;
  }
  
  if (!payload.type || !VALID_EVENT_TYPES.has(payload.type as ChatEventType)) {
    logger.warn('Invalid event type', 'validation', { type: payload.type });
    return false;
  }
  
  if (!(payload.timestamp instanceof Date)) {
    logger.warn('Invalid event timestamp', 'validation', { timestamp: payload.timestamp });
    return false;
  }
  
  return true;
}

/**
 * Creates a validated event payload
 * @param type Event type
 * @param data Optional event data
 * @returns Validated event payload or null if invalid
 */
export function createValidatedEvent(type: ChatEventType, data?: any): ChatEventPayload | null {
  // Create the event
  const event: ChatEventPayload = {
    type,
    timestamp: new Date(),
    data
  };
  
  // Validate it
  if (!validateEventPayload(event)) {
    logger.warn('Failed to create validated event', 'validation', { type, data });
    return null;
  }
  
  return event;
}

/**
 * Validates generic event data
 * @param data Data to validate
 * @returns Validated data or null if invalid
 */
export function validateEventData(data: any): any {
  if (data === null || data === undefined) {
    return undefined;
  }
  
  // If it's a string, sanitize it
  if (typeof data === 'string') {
    return sanitizeEventData(data);
  }
  
  // If it's an object, recursively sanitize its properties
  if (typeof data === 'object' && !Array.isArray(data)) {
    const sanitized: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = validateEventData(data[key]);
    });
    return sanitized;
  }
  
  // If it's an array, recursively sanitize its elements
  if (Array.isArray(data)) {
    return data.map(item => validateEventData(item));
  }
  
  // For other primitive types, pass through
  return data;
}

/**
 * Sanitizes event data to prevent XSS and other injection attacks
 * @param data Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeEventData(data: string): string {
  if (typeof data !== 'string') {
    return data;
  }
  
  // Basic XSS prevention
  return data
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
