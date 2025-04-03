
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback, EventPriority, IEventManager, PrioritizedEvent } from './types';

/**
 * Event Manager class that handles event subscription and dispatching
 * with support for prioritized event handling
 */
export class EventManager implements IEventManager {
  private listeners: Map<ChatEventType | 'all', Set<EventCallback>>;
  private eventQueue: PrioritizedEvent[];
  private isProcessing: boolean;
  private disposed: boolean;

  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
    this.disposed = false;
    
    // Process the event queue periodically
    setInterval(() => this.processQueue(), 16); // ~60fps
  }

  /**
   * Subscribe to an event type
   * @param eventType Type of event to listen for, or 'all' for all events
   * @param callback Function to call when the event occurs
   * @returns Function to unsubscribe
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    if (this.disposed) {
      console.warn('EventManager has been disposed, ignoring subscription');
      return () => {};
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return an unsubscribe function
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * Unsubscribe from an event type
   * @param eventType Type of event to unsubscribe from, or 'all' for all events
   * @param callback Optional specific callback to remove, otherwise removes all
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (this.disposed) {
      return;
    }

    if (!this.listeners.has(eventType)) {
      return;
    }

    if (callback) {
      this.listeners.get(eventType)!.delete(callback);
    } else {
      this.listeners.delete(eventType);
    }
  }

  /**
   * Create and validate an event
   * @param type Event type
   * @param data Optional event data
   * @returns A valid event payload or null if validation fails
   */
  public createEvent(type: ChatEventType, data: any = {}): ChatEventPayload | null {
    if (this.disposed) {
      console.warn('EventManager has been disposed, cannot create events');
      return null;
    }

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
   * Handle an event, adding it to the priority queue
   * @param event Event payload
   * @param priority Optional priority level for the event
   */
  public handleEvent(event: ChatEventPayload, priority: EventPriority = EventPriority.NORMAL): void {
    if (this.disposed) {
      console.warn('EventManager has been disposed, ignoring event');
      return;
    }

    // Add to the queue with the specified priority
    this.eventQueue.push({ event, priority });

    // Start processing if not already doing so
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the event queue, dispatching events in priority order
   */
  private processQueue(): void {
    if (this.isProcessing || this.disposed || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort by priority (lower number = higher priority)
      this.eventQueue.sort((a, b) => a.priority - b.priority);

      // Take the highest priority event
      const { event } = this.eventQueue.shift()!;

      // Notify specific listeners
      if (this.listeners.has(event.type)) {
        this.listeners.get(event.type)!.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in event listener for ${event.type}:`, error);
          }
        });
      }

      // Notify 'all' listeners
      if (this.listeners.has('all')) {
        this.listeners.get('all')!.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in 'all' event listener for ${event.type}:`, error);
          }
        });
      }
    } finally {
      this.isProcessing = false;

      // If more events are in the queue, continue processing
      if (this.eventQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Clean up resources used by the EventManager
   */
  public dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.listeners.clear();
    this.eventQueue = [];
  }
}

// Singleton instance
let eventManager: EventManager | null = null;

/**
 * Get the singleton event manager instance
 * @returns EventManager instance
 */
export function getEventManager(): IEventManager {
  if (!eventManager) {
    eventManager = new EventManager();
  }
  return eventManager;
}

/**
 * Dispatch an event via the event manager with validation
 * @param eventType Type of event to dispatch
 * @param data Optional data to include with the event
 * @param priority Optional priority level for the event
 * @returns The dispatched event or null if invalid
 */
export function dispatchValidatedEvent(
  eventType: ChatEventType, 
  data?: any, 
  priority: EventPriority = EventPriority.NORMAL
): ChatEventPayload | null {
  const manager = getEventManager();
  const event = manager.createEvent(eventType, data);
  
  if (event) {
    manager.handleEvent(event, priority);
    return event;
  }
  
  return null;
}

/**
 * Subscribe to an event via the event manager
 * @param eventType Type of event to listen for
 * @param callback Function to call when the event occurs
 * @returns Function to unsubscribe
 */
export function subscribeToEvent(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
  return getEventManager().on(eventType, callback);
}
