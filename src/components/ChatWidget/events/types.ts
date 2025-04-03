
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Event priority levels
 */
export enum EventPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

/**
 * Event callback function type
 */
export type EventCallback = (payload: ChatEventPayload) => void;

/**
 * Event manager interface
 */
export interface IEventManager {
  on(eventType: ChatEventType | 'all', callback: EventCallback, options?: { priority?: EventPriority }): () => void;
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void;
  removeAllListeners(): void;
  dispatch(eventType: ChatEventType, data?: any, priority?: EventPriority): void;
  registerGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void;
  unregisterGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void;
  
  // Additional methods needed for compatibility
  handleEvent(event: ChatEventPayload, priority?: EventPriority): void;
  dispose(): void;
}
