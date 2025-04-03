
import { ChatEventType, ChatEventPayload } from '../config';

export type EventPriority = 'high' | 'normal' | 'low';

export type EventCallback = (payload: ChatEventPayload) => void;

interface EventListener {
  callback: EventCallback;
  priority?: EventPriority;
}

// Basic event manager class
class EventManager {
  protected eventListeners: Map<string, EventListener[]> = new Map();
  private allEventListeners: EventListener[] = [];

  // Register an event listener
  public on(eventType: ChatEventType | 'all', callback: EventCallback, options?: { priority?: EventPriority }): () => void {
    const listener: EventListener = {
      callback,
      priority: options?.priority || 'normal'
    };

    if (eventType === 'all') {
      this.allEventListeners.push(listener);
    } else {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, []);
      }
      this.eventListeners.get(eventType)?.push(listener);
    }

    // Return an unsubscribe function
    return () => {
      this.off(eventType, callback);
    };
  }

  // Remove an event listener
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (eventType === 'all') {
      if (!callback) {
        this.allEventListeners = [];
      } else {
        this.allEventListeners = this.allEventListeners.filter(
          listener => listener.callback !== callback
        );
      }
    } else if (this.eventListeners.has(eventType)) {
      if (!callback) {
        this.eventListeners.set(eventType, []);
      } else {
        const listeners = this.eventListeners.get(eventType) || [];
        this.eventListeners.set(
          eventType,
          listeners.filter(listener => listener.callback !== callback)
        );
      }
    }
  }

  // Handle an event
  public handleEvent(event: ChatEventPayload): void {
    this.dispatchToListeners(event);
  }

  // Dispatch an event to all relevant listeners
  protected dispatchToListeners(event: ChatEventPayload): void {
    // Get listeners for this specific event type
    const typeListeners = this.eventListeners.get(event.type) || [];
    
    // Combine with 'all' event listeners
    const allListeners = [...typeListeners, ...this.allEventListeners];
    
    // Sort by priority
    allListeners.sort((a, b) => {
      const priorityMap = { high: 0, normal: 1, low: 2 };
      return priorityMap[a.priority || 'normal'] - priorityMap[b.priority || 'normal'];
    });
    
    // Dispatch to all listeners
    allListeners.forEach(listener => {
      try {
        listener.callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
  
  // Dispose all event listeners
  public dispose(): void {
    this.eventListeners.clear();
    this.allEventListeners = [];
  }
}

// Enhanced event manager with additional features
export class EnhancedEventManager extends EventManager {
  private static instance: EnhancedEventManager;
  private eventHistory: ChatEventPayload[] = [];
  private readonly MAX_HISTORY_SIZE = 100;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): EnhancedEventManager {
    if (!EnhancedEventManager.instance) {
      EnhancedEventManager.instance = new EnhancedEventManager();
    }
    return EnhancedEventManager.instance;
  }
  
  // Override to add event history
  protected dispatchToListeners(event: ChatEventPayload): void {
    // Add to history
    this.eventHistory.unshift(event);
    
    // Trim history if needed
    if (this.eventHistory.length > this.MAX_HISTORY_SIZE) {
      this.eventHistory = this.eventHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
    
    // Call parent method
    super.dispatchToListeners(event);
  }
  
  // Get event history
  public getEventHistory(): ChatEventPayload[] {
    return [...this.eventHistory];
  }
  
  // Filter history by event type
  public getEventsByType(eventType: ChatEventType): ChatEventPayload[] {
    return this.eventHistory.filter(event => event.type === eventType);
  }
  
  // Clear history
  public clearHistory(): void {
    this.eventHistory = [];
  }
  
  // Add dispose method to match EventManager
  public dispose(): void {
    super.dispose();
    this.eventHistory = [];
  }
}

// Helper function to get an instance of the enhanced event manager
export function getEventManager(): EnhancedEventManager {
  return EnhancedEventManager.getInstance();
}

// Utility function to dispatch validated events
export function dispatchValidatedEvent(
  eventType: ChatEventType, 
  data?: any, 
  priority?: EventPriority
): boolean {
  try {
    const event: ChatEventPayload = {
      type: eventType,
      timestamp: new Date(),
      data
    };
    
    const eventManager = getEventManager();
    eventManager.handleEvent(event);
    return true;
  } catch (error) {
    console.error('Error dispatching event:', error);
    return false;
  }
}
