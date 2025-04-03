
// Export main types
export { EventPriority, type EventCallback } from './types';

// Export main event manager and functions
export {
  EventManager,
  getEventManager,
} from './eventManager';

// Export DOM event utilities
export {
  dispatchDomEvent,
  subscribeToDomEvent,
  registerGlobalDomEventHandler
} from './domEvents';

// Export validation utils
export {
  validateEventPayload,
  createValidatedEvent,
  validateEventData,
  sanitizeEventData
} from './validation';
