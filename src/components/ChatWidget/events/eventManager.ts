
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback, EventPriority, IEventManager } from './types';
import { logger } from '@/lib/logger';

// Global event manager instance
let eventManagerInstance: EventManager | null = null;

export class EventManager implements IEventManager {
  private listeners: {
    [key in ChatEventType | 'all']?: Array<{
      callback: EventCallback;
      priority: EventPriority;
    }>;
  } = {};
  
  private globalHandlers: Array<(eventType: ChatEventType, payload: ChatEventPayload) => void> = [];
  
  on(
    eventType: ChatEventType | 'all',
    callback: EventCallback,
    options?: { priority?: EventPriority }
  ): () => void {
    const priority = options?.priority || EventPriority.NORMAL;
    
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    
    this.listeners[eventType]?.push({ callback, priority });
    
    // Sort listeners by priority
    this.listeners[eventType]?.sort((a, b) => {
      const priorities = {
        [EventPriority.CRITICAL]: 0,
        [EventPriority.HIGH]: 1,
        [EventPriority.NORMAL]: 2,
        [EventPriority.LOW]: 3
      };
      
      return priorities[a.priority] - priorities[b.priority];
    });
    
    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }
  
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (!callback) {
      // Remove all listeners for this event type
      delete this.listeners[eventType];
      return;
    }
    
    if (!this.listeners[eventType]) {
      return;
    }
    
    this.listeners[eventType] = this.listeners[eventType]?.filter(
      listener => listener.callback !== callback
    );
    
    if (this.listeners[eventType]?.length === 0) {
      delete this.listeners[eventType];
    }
  }
  
  removeAllListeners(): void {
    this.listeners = {};
    this.globalHandlers = [];
  }
  
  dispatch(eventType: ChatEventType, data?: any, priority: EventPriority = EventPriority.NORMAL): void {
    const payload: ChatEventPayload = {
      type: eventType,
      timestamp: new Date(),
      data: data || {}
    };
    
    // Call specific event listeners
    this.listeners[eventType]?.forEach(listener => {
      try {
        listener.callback(payload);
      } catch (error) {
        logger.error(`Error in event listener for ${eventType}`, 'EventManager', error);
      }
    });
    
    // Call 'all' event listeners
    this.listeners['all']?.forEach(listener => {
      try {
        listener.callback(payload);
      } catch (error) {
        logger.error(`Error in 'all' event listener for ${eventType}`, 'EventManager', error);
      }
    });
    
    // Call global handlers
    this.globalHandlers.forEach(handler => {
      try {
        handler(eventType, payload);
      } catch (error) {
        logger.error(`Error in global handler for ${eventType}`, 'EventManager', error);
      }
    });
    
    // Debug log the event if not a high-frequency event
    if (
      eventType !== 'chat:typing' &&
      eventType !== 'chat:presence' &&
      eventType !== 'chat:heartbeat'
    ) {
      logger.debug(`Event dispatched: ${eventType}`, 'EventManager', { payload });
    }
  }
  
  registerGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void {
    this.globalHandlers.push(handler);
  }
  
  unregisterGlobalHandler(handler: (eventType: ChatEventType, payload: ChatEventPayload) => void): void {
    this.globalHandlers = this.globalHandlers.filter(h => h !== handler);
  }
}

/**
 * Get the global event manager instance
 */
export function getEventManager(): IEventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager();
  }
  
  return eventManagerInstance;
}
