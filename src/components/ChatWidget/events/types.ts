
import { ChatEventType, ChatEventPayload } from '../config';

export enum EventPriority {
  HIGH = 0,
  NORMAL = 10,
  LOW = 20,
  BACKGROUND = 30
}

export interface EventCallback {
  (event: ChatEventPayload): void;
}

export interface PrioritizedEvent {
  event: ChatEventPayload;
  priority: EventPriority;
}

export interface IEventManager {
  on(eventType: ChatEventType | 'all', callback: EventCallback): () => void;
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void;
  handleEvent(event: ChatEventPayload, priority?: EventPriority): void;
  createEvent(type: ChatEventType, data?: any): ChatEventPayload | null;
  dispose(): void;
}
