
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback, EventPriority, PrioritizedEvent, IEventManager } from './types';
import { createValidatedEvent, validateEventPayload } from './validation';
import { logger } from '@/lib/logger';

/**
 * Mapping of event types to their default priorities
 */
const defaultEventPriorities: Record<ChatEventType, EventPriority> = {
  'chat:open': EventPriority.HIGH,
  'chat:close': EventPriority.HIGH,
  'chat:messageSent': EventPriority.HIGH,
  'chat:messageReceived': EventPriority.HIGH,
  'contact:initiatedChat': EventPriority.HIGH,
  'contact:formCompleted': EventPriority.NORMAL,
  'message:reacted': EventPriority.NORMAL,
  'chat:typingStarted': EventPriority.LOW,
  'chat:typingStopped': EventPriority.LOW,
  'message:fileUploaded': EventPriority.HIGH,
  'chat:ended': EventPriority.CRITICAL
};

/**
 * Core event manager with prioritization and validation
 */
export class EventManager implements IEventManager {
  protected eventListeners: Map<string, EventCallback[]> = new Map();
  private eventQueue: PrioritizedEvent[] = [];
  private isProcessing: boolean = false;
  private processingInterval: number | null = null;
  private debouncedEvents: Set<ChatEventType> = new Set([
    'chat:typingStarted',
    'chat:typingStopped'
  ]);
  private debounceTimers: Map<ChatEventType, number> = new Map();
  
  constructor(processingInterval: number = 50) {
    // Set up regular processing interval
    if (typeof window !== 'undefined') {
      this.processingInterval = window.setInterval(() => {
        this.processEventQueue();
      }, processingInterval);
    }
  }
  
  /**
   * Clean up resources when manager is no longer needed
   */
  public dispose(): void {
    if (this.processingInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    // Clean up any debounce timers
    this.debounceTimers.forEach((timerId) => {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timerId);
      }
    });
    
    // Clear all listeners
    this.eventListeners.clear();
  }
  
  /**
   * Subscribe to widget events
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    const key = eventType;
    
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    
    logger.debug(`Adding listener for ${eventType} events`, 'EventManager');
    this.eventListeners.get(key)!.push(callback);
    
    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }
  
  /**
   * Unsubscribe from widget events
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    const key = eventType;
    
    if (!this.eventListeners.has(key)) {
      return;
    }
    
    if (callback) {
      // Remove specific callback
      const listeners = this.eventListeners.get(key)!;
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    } else {
      // Remove all callbacks for this event
      this.eventListeners.delete(key);
    }
    
    logger.debug(`Removed listener(s) for ${eventType} events`, 'EventManager');
  }
  
  /**
   * Create and dispatch a validated event
   */
  public createEvent(type: ChatEventType, data?: any): ChatEventPayload | null {
    const event = createValidatedEvent(type, data);
    if (event) {
      this.handleEvent(event);
      return event;
    }
    return null;
  }
  
  /**
   * Handle widget events with validation and priority queueing
   */
  public handleEvent(event: ChatEventPayload, priority?: EventPriority): void {
    // Validate event payload
    if (!validateEventPayload(event)) {
      logger.error('Invalid event payload rejected', 'EventManager', { event });
      return;
    }
    
    // Handle debounced events
    if (this.debouncedEvents.has(event.type)) {
      this.handleDebouncedEvent(event, priority);
      return;
    }
    
    // Determine priority if not specified
    const eventPriority = priority !== undefined ? 
      priority : 
      (defaultEventPriorities[event.type] || EventPriority.NORMAL);
    
    // Add to queue
    this.queueEvent(event, eventPriority);
    
    // For debugging
    logger.debug(`Event queued: ${event.type}`, 'EventManager', 
      { priority: eventPriority, queueLength: this.eventQueue.length });
  }
  
  /**
   * Handle debounced events (like typing indicators)
   */
  private handleDebouncedEvent(event: ChatEventPayload, priority?: EventPriority): void {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(event.type);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    
    // Set new timer
    const timerId = window.setTimeout(() => {
      const eventPriority = priority !== undefined ? 
        priority : (defaultEventPriorities[event.type] || EventPriority.LOW);
      
      this.queueEvent(event, eventPriority);
      this.debounceTimers.delete(event.type);
    }, 300); // 300ms debounce
    
    this.debounceTimers.set(event.type, timerId);
  }
  
  /**
   * Queue an event with priority
   */
  private queueEvent(event: ChatEventPayload, priority: EventPriority): void {
    this.eventQueue.push({ event, priority });
    
    // Sort queue by priority (lower number = higher priority)
    this.eventQueue.sort((a, b) => a.priority - b.priority);
    
    // Process immediately for critical events
    if (priority === EventPriority.CRITICAL) {
      this.processEventQueue();
    }
  }
  
  /**
   * Process events in the queue based on priority
   */
  private processEventQueue(): void {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Process up to 5 events at once
      const batch = this.eventQueue.splice(0, 5);
      
      // Dispatch events
      batch.forEach(({ event }) => {
        this.dispatchToListeners(event);
      });
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Dispatch to registered listeners
   */
  protected dispatchToListeners(event: ChatEventPayload): void {
    // Get specific event listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          logger.error(`Error in ${event.type} event listener`, 'EventManager', e);
        }
      });
    }
    
    // Get 'all' event listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      allListeners.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          logger.error(`Error in 'all' event listener`, 'EventManager', e);
        }
      });
    }
  }
}

// Singleton instance management
let globalEventManager: EventManager | null = null;

/**
 * Get or create the global event manager instance
 */
export function getEventManager(): EventManager {
  if (!globalEventManager) {
    globalEventManager = new EventManager();
  }
  return globalEventManager;
}

/**
 * Dispatch an event with validation
 */
export function dispatchValidatedEvent(
  eventType: ChatEventType, 
  data?: any, 
  priority?: EventPriority
): ChatEventPayload | null {
  const eventManager = getEventManager();
  return eventManager.createEvent(eventType, data);
}

/**
 * Helper function to subscribe to chat events with type safety
 */
export function subscribeToEvent(
  eventType: ChatEventType | 'all',
  callback: EventCallback
): () => void {
  const eventManager = getEventManager();
  return eventManager.on(eventType, callback);
}
