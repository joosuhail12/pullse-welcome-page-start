
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Creates a validated event object that conforms to the expected structure
 * @param type Event type
 * @param data Optional event data
 * @returns A valid event payload or null if validation fails
 */
export function createValidatedEvent(type: ChatEventType, data: any = {}): ChatEventPayload | null {
  if (!type) {
    console.error('Event type is required');
    return null;
  }
  
  // Create the event with required fields
  const event: ChatEventPayload = {
    type,
    timestamp: new Date(),
    data: data || {}
  };
  
  return event;
}

/**
 * Validates that an event conforms to the expected structure
 * @param event The event to validate
 * @returns True if the event is valid
 */
export function validateEvent(event: any): boolean {
  if (!event || typeof event !== 'object') {
    return false;
  }
  
  if (!event.type || !event.timestamp) {
    return false;
  }
  
  // Ensure data is at least an empty object
  if (!event.data || typeof event.data !== 'object') {
    return false;
  }
  
  return true;
}
