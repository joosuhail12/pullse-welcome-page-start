
import { EventManager } from './events';
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback } from './types';
import { createValidatedEvent, validateEventPayload } from '../utils/eventValidation';
import { debounce } from './utils';

/**
 * Event priority levels
 */
export enum EventPriority {
  CRITICAL = 0,  // Immediate processing (errors, chat ending)
  HIGH = 1,      // High priority (messages sent/received)
  NORMAL = 2,    // Normal events (typing, status changes)
  LOW = 3        // Background events (analytics, non-critical updates)
}

/**
 * Event with priority information
 */
interface PrioritizedEvent {
  event: ChatEventPayload;
  priority: EventPriority;
}

/**
 * Mapping of event types to their default priorities
 */
const defaultEventPriorities: Partial<Record<ChatEventType, EventPriority>> = {
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
 * Enhanced event manager with prioritization and validation
 */
export class EnhancedEventManager extends EventManager {
  private eventQueue: PrioritizedEvent[] = [];
  private isProcessing: boolean = false;
  private processingInterval: number | null = null;
  
  constructor(processingInterval: number = 50) {
    super();
    
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
   * Overridden handleEvent with validation and priority queueing
   */
  public handleEvent(event: ChatEventPayload, priority?: EventPriority): void {
    // Validate event payload
    if (!validateEventPayload(event)) {
      console.error('Invalid event payload:', event);
      return;
    }
    
    // Determine priority if not specified
    const eventPriority = priority !== undefined ? 
      priority : 
      (defaultEventPriorities[event.type] || EventPriority.NORMAL);
    
    // Add to queue
    this.queueEvent(event, eventPriority);
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
        // Special handling for typing events (use debounce from parent class)
        if (event.type === 'chat:typingStarted' || event.type === 'chat:typingStopped') {
          super.handleEvent(event);
        } else {
          // For other events, dispatch directly
          this.dispatchToListeners(event);
        }
      });
    } finally {
      this.isProcessing = false;
    }
  }
}

/**
 * Create a global instance of the enhanced event manager
 */
let globalEventManager: EnhancedEventManager | null = null;

/**
 * Get or create the global event manager instance
 */
export function getEventManager(): EnhancedEventManager {
  if (!globalEventManager) {
    globalEventManager = new EnhancedEventManager();
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
  callback: EventCallback,
  options?: { priority?: boolean }
): () => void {
  const eventManager = getEventManager();
  return eventManager.on(eventType, callback);
}
