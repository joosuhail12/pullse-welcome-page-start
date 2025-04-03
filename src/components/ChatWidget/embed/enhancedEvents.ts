
import { ChatEventType, ChatEventPayload } from '../config';
import { EventManager } from './events';
import { validateEventPayload } from '../utils/eventValidation';

/**
 * Event priority levels for ordering event processing
 */
export enum EventPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2
}

/**
 * Prioritized event queue entry
 */
interface EventQueueEntry {
  event: ChatEventPayload;
  priority: EventPriority;
  timestamp: number;
}

// Singleton instance of the enhanced event manager
let eventManagerInstance: EnhancedEventManager | null = null;

/**
 * Enhanced event manager with additional security features
 * - Event validation
 * - Event prioritization
 * - Rate limiting
 * - Delayed event dispatch
 */
export class EnhancedEventManager extends EventManager {
  private eventQueue: EventQueueEntry[] = [];
  private processingQueue: boolean = false;
  private rateLimitCounters: Map<string, { count: number, timestamp: number }> = new Map();
  
  // Rate limiting configuration
  private readonly MAX_EVENTS_PER_MINUTE = 100;
  private readonly MAX_EVENTS_OF_TYPE_PER_MINUTE = 20;
  
  constructor() {
    super();
    this.processQueue = this.processQueue.bind(this);
  }
  
  /**
   * Dispatch an event with validation and priority
   */
  public dispatchEvent(event: ChatEventPayload, priority: EventPriority = EventPriority.NORMAL): boolean {
    // Validate event structure and content
    if (!validateEventPayload(event)) {
      console.warn('Invalid event payload detected and blocked:', event);
      return false;
    }
    
    // Check against rate limits
    if (this.isRateLimited(event)) {
      console.warn('Event rate limited:', event.type);
      return false;
    }
    
    // Add to queue with priority
    this.eventQueue.push({ 
      event, 
      priority,
      timestamp: Date.now()
    });
    
    // Sort queue by priority
    this.eventQueue.sort((a, b) => 
      a.priority - b.priority || a.timestamp - b.timestamp
    );
    
    // Start queue processing if not already processing
    if (!this.processingQueue) {
      this.processingQueue = true;
      setTimeout(this.processQueue, 0);
    }
    
    return true;
  }
  
  /**
   * Process event queue
   */
  private processQueue(): void {
    if (this.eventQueue.length === 0) {
      this.processingQueue = false;
      return;
    }
    
    const { event } = this.eventQueue.shift()!;
    
    // Dispatch to listeners with proper super method
    super.dispatchToListeners(event);
    
    // Continue processing if queue has more items
    if (this.eventQueue.length > 0) {
      setTimeout(this.processQueue, 0);
    } else {
      this.processingQueue = false;
    }
  }
  
  /**
   * Check if event should be rate limited
   */
  private isRateLimited(event: ChatEventPayload): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean up old counters
    this.rateLimitCounters.forEach((value, key) => {
      if (value.timestamp < oneMinuteAgo) {
        this.rateLimitCounters.delete(key);
      }
    });
    
    // Check global rate limit
    const globalKey = 'global';
    const globalCounter = this.rateLimitCounters.get(globalKey) || { count: 0, timestamp: now };
    
    if (globalCounter.count >= this.MAX_EVENTS_PER_MINUTE) {
      return true; // Rate limited
    }
    
    // Update global counter
    this.rateLimitCounters.set(globalKey, {
      count: globalCounter.count + 1,
      timestamp: Math.max(globalCounter.timestamp, now)
    });
    
    // Check type-specific rate limit
    const typeKey = `type:${event.type}`;
    const typeCounter = this.rateLimitCounters.get(typeKey) || { count: 0, timestamp: now };
    
    if (typeCounter.count >= this.MAX_EVENTS_OF_TYPE_PER_MINUTE) {
      return true; // Rate limited
    }
    
    // Update type counter
    this.rateLimitCounters.set(typeKey, {
      count: typeCounter.count + 1,
      timestamp: Math.max(typeCounter.timestamp, now)
    });
    
    return false; // Not rate limited
  }
  
  /**
   * Get access to parent class eventListeners in a safe way
   */
  public getEventListeners(): Map<string, Function[]> {
    // Access the protected property
    return new Map(Array.from(this.eventListeners.entries()));
  }
}

/**
 * Get singleton instance of EnhancedEventManager
 */
export function getEventManager(): EnhancedEventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EnhancedEventManager();
  }
  return eventManagerInstance;
}

/**
 * Dispatch a validated event through the enhanced event manager
 */
export function dispatchValidatedEvent(
  eventType: ChatEventType,
  data: any = {},
  priority: EventPriority = EventPriority.NORMAL
): boolean {
  const eventManager = getEventManager();
  
  const event: ChatEventPayload = {
    type: eventType,
    timestamp: new Date(),
    data
  };
  
  return eventManager.dispatchEvent(event, priority);
}
