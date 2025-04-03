
import { ChatEventType, ChatEventPayload } from '../config';

// Define event priority types
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

// Define event callback type
export type EventCallback = (event: ChatEventPayload) => void;

// Event manager singleton
let eventManager: EventManager | null = null;

// Create event manager class
class EventManager {
  private handlers: Map<string, Array<EventCallback>> = new Map();
  private globalHandlers: Array<EventCallback> = [];

  // Register event handler
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    if (eventType === 'all') {
      this.globalHandlers.push(callback);
      
      // Return unsubscribe function
      return () => {
        const index = this.globalHandlers.indexOf(callback);
        if (index !== -1) {
          this.globalHandlers.splice(index, 1);
        }
      };
    }
    
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    const eventHandlers = this.handlers.get(eventType)!;
    eventHandlers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) || [];
      const index = handlers.indexOf(callback);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  // Unregister event handler
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (eventType === 'all') {
      if (callback) {
        const index = this.globalHandlers.indexOf(callback);
        if (index !== -1) {
          this.globalHandlers.splice(index, 1);
        }
      } else {
        this.globalHandlers = [];
      }
      return;
    }
    
    if (!callback) {
      // Remove all handlers for this event type
      this.handlers.delete(eventType);
      return;
    }
    
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    
    const index = handlers.indexOf(callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  // Handle an event
  public handleEvent(event: ChatEventPayload, priority: EventPriority = EventPriority.NORMAL): void {
    // First, notify specific handlers
    const handlers = this.handlers.get(event.type) || [];
    
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
    
    // Then, notify global handlers
    for (const handler of this.globalHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in global event handler:`, error);
      }
    }
    
    // Dispatch DOM event for external integrations
    this.dispatchDOMEvent(event, priority);
  }
  
  // Dispatch an event to the DOM
  private dispatchDOMEvent(event: ChatEventPayload, priority: EventPriority): void {
    try {
      const customEvent = new CustomEvent(`pullse:chat:${event.type}`, {
        detail: {
          ...event,
          priority
        },
        bubbles: false,
        cancelable: true
      });
      
      document.dispatchEvent(customEvent);
    } catch (error) {
      console.error(`Error dispatching DOM event for ${event.type}:`, error);
    }
  }
  
  // Clean up all event handlers
  public dispose(): void {
    this.handlers.clear();
    this.globalHandlers = [];
  }
}

// Get or create event manager instance
export const getEventManager = (): EventManager => {
  if (!eventManager) {
    eventManager = new EventManager();
  }
  return eventManager;
};

// Validate and dispatch event
export const dispatchValidatedEvent = (
  eventType: ChatEventType, 
  data?: any, 
  priority: EventPriority = EventPriority.NORMAL
): void => {
  // Create event payload
  const event: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data
  };
  
  // Dispatch through event manager
  getEventManager().handleEvent(event, priority);
  
  return;
};
