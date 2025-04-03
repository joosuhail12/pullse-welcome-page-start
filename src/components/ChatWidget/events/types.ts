
import { ChatEventType, ChatEventPayload } from '../config';

export type EventCallback = (payload: ChatEventPayload) => void;

export enum EventPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export interface IEventManager {
  on(eventType: ChatEventType | 'all', callback: EventCallback, options?: { priority?: EventPriority }): () => void;
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void;
  removeAllListeners(): void;
  dispatch(eventType: ChatEventType, data?: any, priority?: EventPriority): void;
  registerGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void;
  unregisterGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void;
}

export interface EventSubscription {
  unsubscribe: () => void;
}
