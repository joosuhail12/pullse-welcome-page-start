
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback, EventPriority, PrioritizedEvent, IEventManager } from './types';
import { logger } from '@/lib/logger';
import { validateEventPayload, createValidatedEvent } from './validation';

/**
 * Central event manager for chat widget events
 * Provides methods to subscribe to, publish, and handle events
 */
export class EventManager implements IEventManager {
  private eventListeners: Map<ChatEventType | 'all', Set<EventCallback>>;
  private eventQueue: PrioritizedEvent[];
  private isProcessing: boolean;
  private disposed: boolean;

  constructor() {
    this.eventListeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
    this.disposed = false;
    
    logger.debug('Event manager initialized', 'EventManager');
  }

  /**
   * Subscribe to events of a specific type
   * @param eventType Type of event to listen for, or 'all' for all events
   * @param callback Function to call when events occur
   * @returns Function to unsubscribe
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    if (this.disposed) {
      logger.warn('Attempted to subscribe to events on disposed event manager', 'EventManager');
      return () => {};
    }
    
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.add(callback);
    
    logger.debug(`Subscribed to ${eventType} events`, 'EventManager', { listenersCount: listeners.size });
    
    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from events
   * @param eventType Type of event to unsubscribe from
   * @param callback Optional specific callback to remove, or all if not provided
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (this.disposed) {
      logger.warn('Attempted to unsubscribe from events on disposed event manager', 'EventManager');
      return;
    }
    
    const listeners = this.eventListeners.get(eventType);
    if (!listeners) return;
    
    if (callback) {
      listeners.delete(callback);
      logger.debug(`Unsubscribed from ${eventType} events`, 'EventManager', { listenersCount: listeners.size });
    } else {
      listeners.clear();
      logger.debug(`Cleared all listeners for ${eventType} events`, 'EventManager');
    }
  }

  /**
   * Handle an event, optionally with priority
   * @param event Event payload to handle
   * @param priority Optional priority level
   */
  public handleEvent(event: ChatEventPayload, priority: EventPriority = EventPriority.NORMAL): void {
    if (this.disposed) {
      logger.warn('Attempted to handle event on disposed event manager', 'EventManager');
      return;
    }
    
    if (!validateEventPayload(event)) {
      logger.warn('Invalid event payload rejected', 'EventManager', { event });
      return;
    }
    
    // Add to queue with priority
    this.eventQueue.push({ event, priority });
    
    // Sort queue by priority (lower number = higher priority)
    this.eventQueue.sort((a, b) => a.priority - b.priority);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  /**
   * Create a validated event
   * @param type Event type
   * @param data Optional event data
   * @returns Validated event payload or null if invalid
   */
  public createEvent(type: ChatEventType, data?: any): ChatEventPayload | null {
    return createValidatedEvent(type, data);
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    logger.debug('Disposing event manager', 'EventManager');
    this.eventListeners.clear();
    this.eventQueue = [];
    this.disposed = true;
  }

  /**
   * Process the event queue
   * @private
   */
  private processEventQueue(): void {
    if (this.disposed || this.isProcessing || this.eventQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Get next event from queue
      const { event } = this.eventQueue.shift()!;
      
      // Notify specific listeners
      const specificListeners = this.eventListeners.get(event.type);
      if (specificListeners && specificListeners.size > 0) {
        specificListeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            logger.error(
              `Error in event listener for ${event.type}`,
              'EventManager.processEventQueue',
              error
            );
          }
        });
      }
      
      // Notify global listeners
      const globalListeners = this.eventListeners.get('all');
      if (globalListeners && globalListeners.size > 0) {
        globalListeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            logger.error(
              'Error in global event listener',
              'EventManager.processEventQueue',
              error
            );
          }
        });
      }
    } catch (error) {
      logger.error('Error processing event queue', 'EventManager', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more events
      if (this.eventQueue.length > 0) {
        setTimeout(() => this.processEventQueue(), 0);
      }
    }
  }
}

// Singleton instance
let eventManagerInstance: EventManager | null = null;

/**
 * Get the singleton event manager instance
 * @returns EventManager instance
 */
export function getEventManager(): EventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager();
  }
  return eventManagerInstance;
}

/**
 * Dispatch a validated event through the event manager
 * @param type Event type
 * @param data Event data
 * @param priority Optional priority level
 * @returns The event that was dispatched, or null if validation failed
 */
export function dispatchValidatedEvent(
  type: ChatEventType,
  data?: any,
  priority: EventPriority = EventPriority.NORMAL
): ChatEventPayload | null {
  const event = createValidatedEvent(type, data);
  if (event) {
    getEventManager().handleEvent(event, priority);
    return event;
  }
  return null;
}

/**
 * Subscribe to events
 * @param eventType Type of event to subscribe to
 * @param callback Callback function
 * @returns Unsubscribe function
 */
export function subscribeToEvent(
  eventType: ChatEventType | 'all',
  callback: EventCallback
): () => void {
  return getEventManager().on(eventType, callback);
}
