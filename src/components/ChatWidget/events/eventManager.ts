
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback, EventPriority } from './types';
import { logger } from '@/lib/logger';

export class EventManager {
  private eventListeners: Map<ChatEventType | 'all', Map<EventCallback, { priority: EventPriority }>>;
  
  constructor() {
    this.eventListeners = new Map();
  }
  
  /**
   * Register an event handler
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Map());
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.set(callback, { priority: EventPriority.NORMAL });
    
    // Return function to unsubscribe
    return () => {
      this.off(eventType, callback);
    };
  }
  
  /**
   * Unregister an event handler
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    
    if (callback) {
      listeners.delete(callback);
    } else {
      listeners.clear();
    }
    
    // If no more listeners for this event type, remove it from the map
    if (listeners.size === 0) {
      this.eventListeners.delete(eventType);
    }
  }
  
  /**
   * Handle an event
   */
  public handleEvent(event: ChatEventPayload, priority: EventPriority = EventPriority.NORMAL): void {
    logger.debug(`Handling event: ${event.type}`, 'EventManager', {
      timestamp: event.timestamp,
      data: import.meta.env.DEV ? event.data : undefined
    });
    
    // Call specific event listeners
    this.notifyListeners(event, event.type, priority);
    
    // Call global 'all' event listeners
    this.notifyListeners(event, 'all', priority);
  }
  
  /**
   * Notify listeners for a specific event type
   */
  private notifyListeners(event: ChatEventPayload, eventType: ChatEventType | 'all', priority: EventPriority): void {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners) {
      return;
    }
    
    // Create a new array from the listeners and sort by priority
    Array.from(listeners.entries())
      .filter(([_, details]) => {
        // Convert string priority to number for comparison
        const detailPriority = this.getPriorityValue(details.priority);
        const currentPriority = this.getPriorityValue(priority);
        return detailPriority >= currentPriority;
      })
      .sort(([_, a], [__, b]) => {
        // Convert string priority to number for comparison
        const priorityA = this.getPriorityValue(a.priority);
        const priorityB = this.getPriorityValue(b.priority);
        return priorityB - priorityA;
      })
      .forEach(([callback, _]) => {
        try {
          callback(event);
        } catch (error) {
          logger.error(`Error in event listener for ${eventType}`, 'EventManager', error);
        }
      });
  }

  /**
   * Convert string priority to numeric value for comparison
   */
  private getPriorityValue(priority: EventPriority): number {
    switch (priority) {
      case EventPriority.CRITICAL:
        return 4;
      case EventPriority.HIGH:
        return 3;
      case EventPriority.NORMAL:
        return 2;
      case EventPriority.LOW:
        return 1;
      default:
        return 0;
    }
  }
  
  /**
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    this.eventListeners.clear();
  }
  
  /**
   * Clean up all resources
   */
  public dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let eventManagerInstance: EventManager | null = null;

/**
 * Get the event manager instance
 */
export function getEventManager(): EventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager();
  }
  return eventManagerInstance;
}
