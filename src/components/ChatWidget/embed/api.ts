
import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Comprehensive API for programmatic control of the Pullse Chat Widget
 */
export interface PullseChatWidgetAPI {
  // Core widget controls
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  
  // Configuration controls
  updateConfig(options: Partial<PullseChatWidgetOptions>): void;
  getConfig(): PullseChatWidgetOptions;
  
  // Message controls
  sendMessage(text: string, metadata?: Record<string, any>): Promise<void>;
  clearMessages(): void;
  
  // Event handling
  on(eventType: ChatEventType | 'all', callback: EventCallback): () => void;
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void;
  
  // Widget management
  destroy(): void;
  reload(): void;
}

/**
 * Implementation of the widget API that delegates to the actual widget instance
 */
export class PullseChatWidgetAPIImpl implements PullseChatWidgetAPI {
  private widgetInstance: any;
  private config: PullseChatWidgetOptions;
  private isOpenState: boolean = false;
  
  constructor(config: PullseChatWidgetOptions, widgetInstance?: any) {
    this.config = { ...config };
    this.widgetInstance = widgetInstance;
  }
  
  /**
   * Set the widget instance reference (called when the full widget loads)
   */
  setWidgetInstance(instance: any): void {
    this.widgetInstance = instance;
  }
  
  /**
   * Open the chat widget
   */
  open(): void {
    if (this.widgetInstance?.open) {
      this.widgetInstance.open();
    } else {
      // If widget isn't fully loaded, we need to trigger a load and set to open
      this.isOpenState = true;
      this.ensureWidgetLoaded();
    }
  }
  
  /**
   * Close the chat widget
   */
  close(): void {
    if (this.widgetInstance?.close) {
      this.widgetInstance.close();
    }
    this.isOpenState = false;
  }
  
  /**
   * Toggle the chat widget open/closed state
   */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Check if the chat widget is open
   */
  isOpen(): boolean {
    return this.widgetInstance?.isOpen?.() || this.isOpenState;
  }
  
  /**
   * Update the widget configuration
   */
  updateConfig(options: Partial<PullseChatWidgetOptions>): void {
    this.config = { ...this.config, ...options };
    
    if (this.widgetInstance?.updateConfig) {
      this.widgetInstance.updateConfig(this.config);
    }
    
    // Update the global config object for when the widget loads
    if (window && (window as any).__PULLSE_CHAT_CONFIG__) {
      (window as any).__PULLSE_CHAT_CONFIG__ = {
        ...(window as any).__PULLSE_CHAT_CONFIG__,
        ...options
      };
    }
  }
  
  /**
   * Get the current widget configuration
   */
  getConfig(): PullseChatWidgetOptions {
    return { ...this.config };
  }
  
  /**
   * Send a message programmatically
   */
  async sendMessage(text: string, metadata?: Record<string, any>): Promise<void> {
    if (this.widgetInstance?.sendMessage) {
      return this.widgetInstance.sendMessage(text, metadata);
    } else {
      // Queue the message to be sent when widget loads
      this.ensureWidgetLoaded();
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.widgetInstance?.sendMessage) {
            clearInterval(checkInterval);
            this.widgetInstance.sendMessage(text, metadata).then(resolve);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }
  }
  
  /**
   * Clear all messages in the current conversation
   */
  clearMessages(): void {
    if (this.widgetInstance?.clearMessages) {
      this.widgetInstance.clearMessages();
    }
  }
  
  /**
   * Subscribe to widget events
   */
  on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    if (this.widgetInstance?.on) {
      return this.widgetInstance.on(eventType, callback);
    }
    
    // Register the event for when the widget loads
    const unbind = (window as any).Pullse?.on(eventType, callback) || (() => {});
    return unbind;
  }
  
  /**
   * Unsubscribe from widget events
   */
  off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    if (this.widgetInstance?.off) {
      this.widgetInstance.off(eventType, callback);
    } else {
      (window as any).Pullse?.off(eventType, callback);
    }
  }
  
  /**
   * Destroy the widget instance and remove from DOM
   */
  destroy(): void {
    if (this.widgetInstance?.destroy) {
      this.widgetInstance.destroy();
    }
    
    // Remove the widget container from DOM as fallback
    const container = document.getElementById('pullse-chat-widget-container');
    if (container) {
      container.parentElement?.removeChild(container);
    }
  }
  
  /**
   * Reload the widget with current configuration
   */
  reload(): void {
    this.destroy();
    this.ensureWidgetLoaded();
  }
  
  /**
   * Helper to ensure the widget is fully loaded
   */
  private ensureWidgetLoaded(): void {
    // If we don't have the widget instance, we need to load it
    if (!this.widgetInstance && (window as any).Pullse?.initChatWidget) {
      // Create a new widget instance with autoOpen set based on current state
      const config = {
        ...this.config,
        autoOpen: this.isOpenState
      };
      
      // Initialize a new widget instance
      (window as any).__PULLSE_CHAT_INSTANCE__ = (window as any).Pullse.initChatWidget(config);
      
      // Get the reference to the widget instance
      this.widgetInstance = (window as any).__PULLSE_CHAT_INSTANCE__;
    }
  }
}

