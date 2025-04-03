
import { ChatEventType, ChatEventPayload } from '../config';
import { EventCallback } from './types';
import { debounce } from './utils';

/**
 * Event management for the chat widget
 */
export class EventManager {
  protected eventListeners: Map<string, EventCallback[]> = new Map(); // Changed private to protected
  private debouncedDispatch: (event: ChatEventPayload) => void;
  
  constructor() {
    this.debouncedDispatch = debounce((event: ChatEventPayload) => {
      this.dispatchToListeners(event);
    }, 300);
  }
  
  /**
   * Handle widget events (debounce typing events)
   */
  public handleEvent(event: ChatEventPayload): void {
    // Handle typing events with debouncing
    if (event.type === 'typing') {
      this.debouncedDispatch(event);
    } else {
      // Handle other events immediately
      this.dispatchToListeners(event);
    }
  }
  
  /**
   * Subscribe to widget events
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    const key = eventType;
    
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    
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
  }
  
  /**
   * Get listeners for a specific event type - make this protected for inheritance
   */
  protected getListeners(eventType: ChatEventType | 'all'): EventCallback[] | undefined {
    return this.eventListeners.get(eventType);
  }
  
  /**
   * Dispatch event to registered listeners - made protected so subclasses can use it
   */
  protected dispatchToListeners(event: ChatEventPayload): void {
    // Dispatch to specific event listeners
    const listeners = this.getListeners(event.type as ChatEventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          console.error(`Error in ${event.type} listener:`, e);
        }
      });
    }
    
    // Dispatch to 'all' event listeners
    const allListeners = this.getListeners('all');
    if (allListeners) {
      allListeners.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          console.error(`Error in 'all' listener:`, e);
        }
      });
    }
  }
}
