import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback } from '../embed/types';

// Define EventPriority enum with values for static reference
export enum EventPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

// Base event manager class
class EventManager {
  protected eventListeners: Record<string, Array<{ callback: EventCallback; priority?: EventPriority }>> = {};
  
  /**
   * Register an event listener
   */
  on(eventType: ChatEventType | 'all', callback: EventCallback, options: { priority?: EventPriority } = {}): () => void {
    const key = eventType === 'all' ? 'all' : eventType;
    if (!this.eventListeners[key]) {
      this.eventListeners[key] = [];
    }
    
    this.eventListeners[key].push({
      callback,
      priority: options.priority || EventPriority.NORMAL
    });
    
    // Return cleanup function
    return () => this.off(eventType, callback);
  }
  
  /**
   * Remove an event listener
   */
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    const key = eventType === 'all' ? 'all' : eventType;
    if (!this.eventListeners[key]) {
      return;
    }
    
    if (callback) {
      this.eventListeners[key] = this.eventListeners[key].filter(item => item.callback !== callback);
    } else {
      this.eventListeners[key] = [];
    }
  }
  
  /**
   * Handle an event by dispatching it to all registered listeners
   */
  handleEvent(event: ChatEventPayload): void {
    this.dispatchToListeners(event);
  }
  
  /**
   * Dispatch an event to all listeners
   */
  protected dispatchToListeners(event: ChatEventPayload): void {
    // First dispatch to listeners registered for all events
    const allListeners = this.eventListeners['all'] || [];
    
    // Then dispatch to listeners for this specific event
    const specificListeners = this.eventListeners[event.type as string] || [];
    
    // Combine and sort by priority
    const sortedListeners = [...allListeners, ...specificListeners].sort((a, b) => {
      const priorityMap = {
        [EventPriority.HIGH]: 3,
        [EventPriority.NORMAL]: 2,
        [EventPriority.LOW]: 1
      };
      
      const priorityA = a.priority ? priorityMap[a.priority] : 2;
      const priorityB = b.priority ? priorityMap[b.priority] : 2;
      
      return priorityB - priorityA;
    });
    
    // Dispatch event to all listeners
    sortedListeners.forEach(({ callback }) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }
}

// Enhanced event manager with additional features
export class EnhancedEventManager extends EventManager {
  // Maximum number of events to keep in history
  private readonly MAX_HISTORY_SIZE = 50;
  
  // Event history for debugging
  private eventHistory: ChatEventPayload[] = [];
  
  /**
   * Handle an event by dispatching it to all registered listeners
   * and adding it to the event history
   */
  handleEvent(event: ChatEventPayload): void {
    // Add to history
    this.eventHistory.push(event);
    
    // Trim history if it gets too large
    if (this.eventHistory.length > this.MAX_HISTORY_SIZE) {
      this.eventHistory = this.eventHistory.slice(-this.MAX_HISTORY_SIZE);
    }
    
    // Dispatch to listeners
    super.dispatchToListeners(event);
  }
  
  /**
   * Get the event history
   */
  getEventHistory(): ChatEventPayload[] {
    return [...this.eventHistory];
  }
  
  /**
   * Clear the event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }
  
  /**
   * Dispose of the event manager by clearing all listeners and history
   */
  dispose(): void {
    this.eventListeners = {};
    this.eventHistory = [];
  }
}

// Singleton instance of the enhanced event manager
let eventManagerInstance: EnhancedEventManager | null = null;

/**
 * Get the singleton instance of the enhanced event manager
 */
export function getEventManager(): EnhancedEventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EnhancedEventManager();
  }
  return eventManagerInstance;
}

/**
 * Dispatch a validated event through the event manager
 */
export function dispatchValidatedEvent(
  eventType: ChatEventType,
  data?: any,
  priority: EventPriority = EventPriority.NORMAL
): ChatEventPayload | null {
  const event: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data: data || {}
  };
  
  getEventManager().handleEvent(event);
  
  return event;
}
