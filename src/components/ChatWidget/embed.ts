/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { ChatEventType, ChatEventPayload, ChatPosition, ChatBranding } from './config';

interface PullseChatWidgetOptions {
  workspaceId: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offsetX?: number;
  offsetY?: number;
  hideBranding?: boolean;
  autoOpen?: boolean;
  logoUrl?: string;
  avatarUrl?: string;
  widgetTitle?: string;
  onEvent?: (event: ChatEventPayload) => void;
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
  lazyLoadScroll?: boolean;
  scrollThreshold?: number;
}

type EventCallback = (payload: ChatEventPayload) => void;

// Debounce function for optimizing event callbacks
function debounce<F extends (...args: any[]) => void>(
  func: F, 
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private launcherElement: HTMLDivElement | null = null;
  private initialized = false;
  private widgetLoaded = false;
  private eventListeners: Map<string, EventCallback[]> = new Map();
  private lazyLoadObserver: IntersectionObserver | null = null;

  constructor(options: PullseChatWidgetOptions) {
    // Set default options
    this.options = {
      position: 'bottom-right',
      offsetX: 20,
      offsetY: 20,
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
    
    // For lazy loading via scroll
    if (this.options.lazyLoadScroll) {
      this.initLazyLoadViaScroll();
    } 
    // For auto-open, load full widget immediately
    else if (this.options.autoOpen) {
      this.createContainer();
      this.loadFullWidget();
    } 
    // Otherwise, just create the launcher button
    else {
      this.createLauncherButton();
    }
  }

  private createContainer(): void {
    // Create container element for the widget
    this.containerElement = document.createElement('div');
    this.containerElement.id = 'pullse-chat-widget-container';
    document.body.appendChild(this.containerElement);

    // Add styles
    this.injectStyles();
  }
  
  private createLauncherButton(): void {
    // Create a lightweight launcher button
    this.launcherElement = document.createElement('div');
    this.launcherElement.id = 'pullse-chat-launcher';
    this.launcherElement.style.position = 'fixed';
    this.launcherElement.style.zIndex = '9998';
    this.launcherElement.style.cursor = 'pointer';
    
    // Apply position
    const { position, offsetX, offsetY } = this.options;
    switch (position) {
      case 'bottom-left':
        this.launcherElement.style.bottom = `${offsetY}px`;
        this.launcherElement.style.left = `${offsetX}px`;
        break;
      case 'top-right':
        this.launcherElement.style.top = `${offsetY}px`;
        this.launcherElement.style.right = `${offsetX}px`;
        break;
      case 'top-left':
        this.launcherElement.style.top = `${offsetY}px`;
        this.launcherElement.style.left = `${offsetX}px`;
        break;
      case 'bottom-right':
      default:
        this.launcherElement.style.bottom = `${offsetY}px`;
        this.launcherElement.style.right = `${offsetX}px`;
    }
    
    // Create the button
    const button = document.createElement('div');
    button.className = 'pullse-chat-button';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = this.options.primaryColor || '#6366f1';
    button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.transition = 'all 0.2s ease';
    
    // Create the icon
    const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    button.innerHTML = svgIcon;
    
    // Add hover effect
    button.onmouseover = () => {
      button.style.transform = 'scale(1.05)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
    };
    
    // Add click handler to load full widget
    button.onclick = () => {
      this.createContainer();
      this.loadFullWidget();
      if (this.launcherElement) {
        this.launcherElement.style.display = 'none';
      }
    };
    
    this.launcherElement.appendChild(button);
    document.body.appendChild(this.launcherElement);
  }
  
  private initLazyLoadViaScroll(): void {
    // Create the launcher button first for immediate interaction
    this.createLauncherButton();
    
    // Create a sentinel element for the observer
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'absolute'; 
    sentinel.style.visibility = 'hidden';
    
    // Position the sentinel near the bottom of the page
    const scrollThreshold = this.options.scrollThreshold || 0.7; // Default 70% down the page
    sentinel.style.top = (window.innerHeight * scrollThreshold) + 'px';
    
    document.body.appendChild(sentinel);
    
    // Use Intersection Observer to detect when user scrolls to the sentinel
    this.lazyLoadObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // User has scrolled to the threshold, load the widget
        this.createContainer();
        this.loadFullWidget();
        
        // Stop observing
        if (this.lazyLoadObserver) {
          this.lazyLoadObserver.disconnect();
          this.lazyLoadObserver = null;
        }
        
        // Remove sentinel
        if (sentinel.parentNode) {
          sentinel.parentNode.removeChild(sentinel);
        }
      }
    }, {
      threshold: 0.1 // Trigger when 10% visible
    });
    
    // Start observing
    this.lazyLoadObserver.observe(sentinel);
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
    const { position, offsetX, offsetY } = this.options;
    
    switch (position) {
      case 'bottom-left':
        return `bottom: ${offsetY}px; left: ${offsetX}px;`;
      case 'top-right':
        return `top: ${offsetY}px; right: ${offsetX}px;`;
      case 'top-left':
        return `top: ${offsetY}px; left: ${offsetX}px;`;
      case 'bottom-right':
      default:
        return `bottom: ${offsetY}px; right: ${offsetX}px;`;
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

  private loadFullWidget(): void {
    // Load React dependencies first
    this.loadDependencies()
      .then(() => {
        // Add cache busting to prevent stale scripts
        const cacheBuster = `?v=${new Date().getTime()}`;
        
        // Handle widget events with debouncing for typing events
        const onEvent = (event: ChatEventPayload) => {
          // Handle typing events with debouncing
          if (event.type === 'typing') {
            this.debouncedDispatchEvent(event);
          } else {
            // Handle other events immediately
            this.dispatchToListeners(event);
          }
        };
        
        // Create position configuration from options
        const position: ChatPosition = {
          placement: this.options.position,
          offsetX: this.options.offsetX && this.options.offsetX / 16, // Convert px to rem
          offsetY: this.options.offsetY && this.options.offsetY / 16  // Convert px to rem
        };
        
        // Create branding configuration
        const branding: ChatBranding = {
          primaryColor: this.options.primaryColor,
          logoUrl: this.options.logoUrl,
          avatarUrl: this.options.avatarUrl,
          widgetTitle: this.options.widgetTitle,
          showBrandingBar: !this.options.hideBranding
        };
        
        // Create global config object with version for cache busting
        (window as any).__PULLSE_CHAT_CONFIG__ = {
          workspaceId: this.options.workspaceId,
          welcomeMessage: this.options.welcomeMessage,
          branding: branding,
          position: position,
          autoOpen: this.options.autoOpen,
          onEvent: onEvent,
          eventHandlers: this.options.eventHandlers,
          version: `1.0.${Date.now()}` // Add version stamp for cache busting
        };
        
        // Save widget instance for global access
        (window as any).__PULLSE_CHAT_INSTANCE__ = this;
        
        // Load the widget bundle
        this.scriptElement = document.createElement('script');
        this.scriptElement.src = `https://cdn.pullse.io/chat-widget.js${cacheBuster}`; // Add cache busting
        this.scriptElement.async = true;
        this.scriptElement.onload = () => {
          console.log('Pullse Chat Widget loaded successfully');
          this.widgetLoaded = true;
        };
        this.scriptElement.onerror = () => {
          console.error('Failed to load Pullse Chat Widget');
        };
        
        document.body.appendChild(this.scriptElement);
      })
      .catch(error => console.error('Failed to load dependencies:', error));
  }
  
  // Create a debounced version of the dispatch event function
  private debouncedDispatchEvent = debounce((event: ChatEventPayload) => {
    this.dispatchToListeners(event);
  }, 300);
  
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
