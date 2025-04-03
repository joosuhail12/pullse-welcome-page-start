
import { EventCallback, EventPriority, IEventManager } from './types';
import { ChatEventType, ChatEventPayload } from '../config';
import { validateEventPayload, createValidatedEvent } from './validation';
import { logger } from '@/lib/logger';

const EVENT_PREFIX = 'pullse:';

export class EventManager implements IEventManager {
  private listeners: Map<string, Set<EventCallback>>;
  private prioritizedListeners: Map<string, Map<EventPriority, Set<EventCallback>>>;
  private globalHandlers: Set<(eventType: ChatEventType, payload: ChatEventPayload) => void>;

  constructor() {
    this.listeners = new Map();
    this.prioritizedListeners = new Map();
    this.globalHandlers = new Set();
  }

  // Register an event listener
  on(
    eventType: ChatEventType | 'all',
    callback: EventCallback,
    options?: { priority?: EventPriority }
  ): () => void {
    const priority = options?.priority || EventPriority.NORMAL;
    const fullEventType = eventType === 'all' ? 'all' : eventType;

    if (priority !== EventPriority.NORMAL) {
      // Handle prioritized listeners
      if (!this.prioritizedListeners.has(fullEventType)) {
        this.prioritizedListeners.set(fullEventType, new Map());
      }

      const eventPriorities = this.prioritizedListeners.get(fullEventType)!;

      if (!eventPriorities.has(priority)) {
        eventPriorities.set(priority, new Set());
      }

      eventPriorities.get(priority)!.add(callback);
    } else {
      // Handle regular listeners
      if (!this.listeners.has(fullEventType)) {
        this.listeners.set(fullEventType, new Set());
      }

      this.listeners.get(fullEventType)!.add(callback);
    }

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  // Remove an event listener
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    const fullEventType = eventType === 'all' ? 'all' : eventType;

    // If no callback provided, remove all listeners for this event type
    if (!callback) {
      this.listeners.delete(fullEventType);
      this.prioritizedListeners.delete(fullEventType);
      return;
    }

    // Remove from regular listeners
    if (this.listeners.has(fullEventType)) {
      this.listeners.get(fullEventType)!.delete(callback);
      if (this.listeners.get(fullEventType)!.size === 0) {
        this.listeners.delete(fullEventType);
      }
    }

    // Remove from prioritized listeners
    if (this.prioritizedListeners.has(fullEventType)) {
      const eventPriorities = this.prioritizedListeners.get(fullEventType)!;
      
      eventPriorities.forEach((callbacks, priority) => {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          eventPriorities.delete(priority);
        }
      });

      if (eventPriorities.size === 0) {
        this.prioritizedListeners.delete(fullEventType);
      }
    }
  }

  // Remove all event listeners
  removeAllListeners(): void {
    this.listeners.clear();
    this.prioritizedListeners.clear();
    this.globalHandlers.clear();
  }

  // Dispatch an event to listeners
  dispatch(eventType: ChatEventType, data?: any, priority?: EventPriority): void {
    const event = createValidatedEvent(eventType, data);
    
    if (!validateEventPayload(event)) {
      logger.warn('Invalid event payload detected and blocked', 'EventManager', { event });
      return;
    }

    // Higher priority handling
    if (priority === EventPriority.CRITICAL || priority === EventPriority.HIGH) {
      this.dispatchWithPriority(event, priority);
      return;
    }

    // Dispatch to specific event listeners
    this.dispatchToListeners(event.type, event);

    // Dispatch to 'all' event listeners
    this.dispatchToListeners('all', event);

    // Dispatch to global handlers
    this.globalHandlers.forEach(handler => {
      try {
        handler(event.type, event);
      } catch (error) {
        logger.error('Error in global event handler', 'EventManager', { error });
      }
    });

    // Dispatch to DOM for external listeners
    this.dispatchToDom(event);
  }

  // Register a global handler for all events
  registerGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void {
    this.globalHandlers.add(handler);
  }

  // Unregister a global handler
  unregisterGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void {
    this.globalHandlers.delete(handler);
  }

  // Helper method to dispatch events to specific listeners
  private dispatchToListeners(eventType: string, event: ChatEventPayload): void {
    // Regular listeners
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error in event listener', 'EventManager', { error, eventType });
        }
      });
    }

    // Prioritized listeners (for non-prioritized dispatches)
    if (this.prioritizedListeners.has(eventType)) {
      const eventPriorities = this.prioritizedListeners.get(eventType)!;
      
      // Dispatch to all priorities in order: CRITICAL, HIGH, NORMAL, LOW
      const priorityOrder = [EventPriority.CRITICAL, EventPriority.HIGH, EventPriority.NORMAL, EventPriority.LOW];
      
      priorityOrder.forEach(priority => {
        if (eventPriorities.has(priority)) {
          eventPriorities.get(priority)!.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              logger.error('Error in prioritized event listener', 'EventManager', { error, eventType, priority });
            }
          });
        }
      });
    }
  }

  // Helper method to dispatch high-priority events
  private dispatchWithPriority(event: ChatEventPayload, priority: EventPriority): void {
    const eventType = event.type;
    
    // Only dispatch to matching priority or higher
    const validPriorities = priority === EventPriority.CRITICAL 
      ? [EventPriority.CRITICAL] 
      : [EventPriority.CRITICAL, EventPriority.HIGH];
    
    // Dispatch to specific event listeners with matching priority
    if (this.prioritizedListeners.has(eventType)) {
      const eventPriorities = this.prioritizedListeners.get(eventType)!;
      
      validPriorities.forEach(validPriority => {
        if (eventPriorities.has(validPriority)) {
          eventPriorities.get(validPriority)!.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              logger.error('Error in high-priority event listener', 'EventManager', { error, eventType, priority: validPriority });
            }
          });
        }
      });
    }
    
    // Also dispatch to 'all' listeners with matching priority
    if (this.prioritizedListeners.has('all')) {
      const allPriorities = this.prioritizedListeners.get('all')!;
      
      validPriorities.forEach(validPriority => {
        if (allPriorities.has(validPriority)) {
          allPriorities.get(validPriority)!.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              logger.error('Error in high-priority "all" event listener', 'EventManager', { error, eventType, priority: validPriority });
            }
          });
        }
      });
    }
    
    // After handling high-priority listeners, continue with normal dispatch
    this.dispatchToListeners(eventType, event);
    this.dispatchToListeners('all', event);
    
    // Global handlers
    this.globalHandlers.forEach(handler => {
      try {
        handler(event.type, event);
      } catch (error) {
        logger.error('Error in global event handler (high priority)', 'EventManager', { error });
      }
    });
    
    // DOM events
    this.dispatchToDom(event);
  }

  // Helper method to dispatch events to DOM
  private dispatchToDom(event: ChatEventPayload): void {
    if (typeof window !== 'undefined' && window.document) {
      const domEvent = new CustomEvent(`${EVENT_PREFIX}${event.type}`, {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      
      window.document.dispatchEvent(domEvent);
      
      // Also dispatch a generic event for catching all Pullse events
      const allEvent = new CustomEvent(EVENT_PREFIX, {
        detail: event,
        bubbles: true,
        cancelable: true
      });
      
      window.document.dispatchEvent(allEvent);
    }
  }
}

// Singleton instance
let eventManagerInstance: EventManager | null = null;

// Get the event manager instance
export const getEventManager = (): EventManager => {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager();
  }
  return eventManagerInstance;
};

// Helper for dispatching validated events
export const dispatchValidatedEvent = (eventType: ChatEventType, data?: any, priority?: EventPriority): void => {
  getEventManager().dispatch(eventType, data, priority);
};

// Helper for subscribing to events
export const subscribeToEvent = (
  eventType: ChatEventType | 'all',
  callback: EventCallback,
  options?: { priority?: EventPriority }
): () => void => {
  return getEventManager().on(eventType, callback, options);
};
