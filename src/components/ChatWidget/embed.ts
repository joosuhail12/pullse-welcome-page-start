
/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { ChatEventType, ChatEventPayload } from './config';

interface PullseChatWidgetOptions {
  workspaceId: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  hideBranding?: boolean;
  autoOpen?: boolean;
  onEvent?: (event: ChatEventPayload) => void;
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
}

type EventCallback = (payload: ChatEventPayload) => void;

class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private initialized = false;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  constructor(options: PullseChatWidgetOptions) {
    // Set default options
    this.options = {
      position: 'bottom-right',
      hideBranding: false,
      autoOpen: false,
      ...options
    };

    // Validate required options
    if (!this.options.workspaceId) {
      console.error('Pullse Chat Widget: workspaceId is required');
      return;
    }

    // Initialize the widget
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    if (this.initialized) return;
    this.initialized = true;
    
    console.log('Initializing Pullse Chat Widget with options:', this.options);
    
    // Create container element
    this.containerElement = document.createElement('div');
    this.containerElement.id = 'pullse-chat-widget-container';
    document.body.appendChild(this.containerElement);

    // Add styles
    this.injectStyles();
    
    // Load React and ReactDOM if needed
    this.loadDependencies()
      .then(() => this.loadWidget())
      .catch(error => console.error('Failed to load Pullse Chat Widget dependencies:', error));
  }

  private injectStyles(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      #pullse-chat-widget-container {
        position: fixed;
        z-index: 9999;
        ${this.getPositionStyles()}
      }
    `;
    document.head.appendChild(this.styleElement);
  }

  private getPositionStyles(): string {
    switch (this.options.position) {
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;';
      case 'top-right':
        return 'top: 20px; right: 20px;';
      case 'top-left':
        return 'top: 20px; left: 20px;';
      case 'bottom-right':
      default:
        return 'bottom: 20px; right: 20px;';
    }
  }

  private loadDependencies(): Promise<void> {
    return new Promise((resolve) => {
      // Check if React and ReactDOM are already loaded
      if (window.React && window.ReactDOM) {
        resolve();
        return;
      }

      // Load React and ReactDOM from CDN
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
      reactScript.crossOrigin = 'anonymous';
      
      const reactDomScript = document.createElement('script');
      reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
      reactDomScript.crossOrigin = 'anonymous';
      
      // Wait for both to load
      let loaded = 0;
      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) resolve();
      };
      
      reactScript.onload = checkLoaded;
      reactDomScript.onload = checkLoaded;
      
      document.head.appendChild(reactScript);
      document.head.appendChild(reactDomScript);
    });
  }

  private loadWidget(): void {
    // Handle widget events
    const onEvent = (event: ChatEventPayload) => {
      // Call the main onEvent handler if provided
      if (this.options.onEvent) {
        try {
          this.options.onEvent(event);
        } catch (e) {
          console.error('Error in onEvent handler:', e);
        }
      }
      
      // Call specific event handlers if provided
      const specificHandler = this.options.eventHandlers?.[event.type as ChatEventType];
      if (specificHandler) {
        try {
          specificHandler(event);
        } catch (e) {
          console.error(`Error in ${event.type} handler:`, e);
        }
      }
      
      // Dispatch to registered listeners
      this.dispatchToListeners(event);
    };
    
    // Create global config object
    (window as any).__PULLSE_CHAT_CONFIG__ = {
      workspaceId: this.options.workspaceId,
      welcomeMessage: this.options.welcomeMessage,
      branding: {
        primaryColor: this.options.primaryColor,
        showBrandingBar: !this.options.hideBranding
      },
      autoOpen: this.options.autoOpen,
      onEvent: onEvent,
      eventHandlers: this.options.eventHandlers
    };
    
    // Load the widget bundle
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = 'https://cdn.pullse.io/chat-widget.js'; // Replace with actual CDN URL
    this.scriptElement.async = true;
    this.scriptElement.onload = () => {
      console.log('Pullse Chat Widget loaded successfully');
    };
    this.scriptElement.onerror = () => {
      console.error('Failed to load Pullse Chat Widget');
    };
    
    document.body.appendChild(this.scriptElement);
  }
  
  /**
   * Subscribe to widget events
   * @param eventType Event type to subscribe to, or 'all' for all events
   * @param callback Function to call when event is triggered
   * @returns Function to unsubscribe
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
   * @param eventType Event type to unsubscribe from
   * @param callback Optional callback to remove (if not provided, removes all callbacks for event)
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
   * Dispatch event to registered listeners
   */
  private dispatchToListeners(event: ChatEventPayload): void {
    // Dispatch to specific event listeners
    const listeners = this.eventListeners.get(event.type as ChatEventType);
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
    const allListeners = this.eventListeners.get('all');
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

// Create global Pullse object
(window as any).Pullse = (window as any).Pullse || {};
(window as any).Pullse.initChatWidget = (options: PullseChatWidgetOptions) => {
  return new PullseChatWidgetLoader(options);
};

// Add event API to global Pullse object
(window as any).Pullse.on = (eventType: ChatEventType | 'all', callback: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return () => {};
  }
  return (window as any).__PULLSE_CHAT_INSTANCE__.on(eventType, callback);
};

(window as any).Pullse.off = (eventType: ChatEventType | 'all', callback?: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return;
  }
  (window as any).__PULLSE_CHAT_INSTANCE__.off(eventType, callback);
};

// Export for ESM environments
export default PullseChatWidgetLoader;
