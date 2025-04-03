
import { ChatEventType, ChatEventPayload } from '../config';
import { getEventManager } from './eventManager';
import { EventPriority } from './types';
import { validateEventPayload } from './validation';

/**
 * Dispatches a validated event through the event manager
 */
export const dispatchValidatedEvent = (
  eventType: ChatEventType,
  data?: any,
  priority: EventPriority = EventPriority.NORMAL
): ChatEventPayload | null => {
  const event: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data: data || {}
  };
  
  // Validate the event before dispatching
  if (validateEventPayload(event)) {
    getEventManager().dispatch(eventType, data, priority);
    return event;
  }
  
  console.warn('Event validation failed, event not dispatched:', eventType, data);
  return null;
};

/**
 * Subscribe to an event with validation
 */
export const subscribeToEvent = (
  eventType: ChatEventType | 'all',
  callback: (payload: ChatEventPayload) => void,
  options?: { priority?: EventPriority }
) => {
  return getEventManager().on(eventType, (payload: ChatEventPayload) => {
    if (validateEventPayload(payload)) {
      callback(payload);
    }
  }, options);
};
