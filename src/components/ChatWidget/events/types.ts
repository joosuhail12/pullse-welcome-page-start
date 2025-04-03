
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Event priority levels for processing events in order of importance
 */
export enum EventPriority {
  CRITICAL = 0,  // Immediate processing (errors, chat ending)
  HIGH = 1,      // High priority (messages sent/received)
  NORMAL = 2,    // Normal events (typing, status changes)
  LOW = 3        // Background events (analytics, non-critical updates)
}

/**
 * Event with priority information for the event queue
 */
export interface PrioritizedEvent {
  event: ChatEventPayload;
  priority: EventPriority;
}

/**
 * Event callback function type
 */
export type EventCallback = (payload: ChatEventPayload) => void;

/**
 * Configuration for event subscription
 */
export interface EventSubscriptionOptions {
  priority?: EventPriority;
}

/**
 * Interface for event manager implementation
 */
export interface IEventManager {
  on(eventType: ChatEventType | 'all', callback: EventCallback): () => void;
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void;
  handleEvent(event: ChatEventPayload, priority?: EventPriority): void;
  createEvent(type: ChatEventType, data?: any): ChatEventPayload | null;
  dispose(): void;
}
