
import { PullseChatWidgetOptions } from './types';
import { getPositionStyles, loadDependencies } from './utils';
import { EventManager } from './events';
import { createLauncherButton, createWidgetContainer, injectWidgetStyles } from './ui-components';
import { initLazyLoadViaScroll, prepareWidgetConfig } from './lazy-loading';
import { PullseChatWidgetAPI } from './api';
import { PullseChatWidgetAPIImpl } from './api-implementation';

/**
 * Main widget loader class
 */
export class PullseChatWidgetLoader implements PullseChatWidgetAPI {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private launcherElement: HTMLDivElement | null = null;
  private initialized = false;
  private widgetLoaded = false;
  private lazyLoadObserver: IntersectionObserver | null = null;
  private eventManager: EventManager;
  private api: PullseChatWidgetAPIImpl;
  private _isOpen = false;

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

    this.eventManager = new EventManager();
    this.api = new PullseChatWidgetAPIImpl(this.options, this);

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
      this.lazyLoadObserver = initLazyLoadViaScroll(
        this.options, 
        this.loadFullWidget.bind(this),
        this.createContainer.bind(this)
      );
    } 
    // For auto-open, load full widget immediately
    else if (this.options.autoOpen) {
      this._isOpen = true;
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
    this.containerElement = createWidgetContainer();
    document.body.appendChild(this.containerElement);

    // Add styles
    this.injectStyles();
  }
  
  private createLauncherButton(): void {
    // Create a lightweight launcher button
    const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
    this.launcherElement = createLauncherButton(this.options, position, offsetX, offsetY);
    
    // Add click handler to load full widget
    const button = this.launcherElement.querySelector('.pullse-chat-button');
    if (button) {
      button.onclick = () => {
        this._isOpen = true;
        this.createContainer();
        this.loadFullWidget();
        if (this.launcherElement) {
          this.launcherElement.style.display = 'none';
        }
      };
    }
    
    document.body.appendChild(this.launcherElement);
  }

  private injectStyles(): void {
    const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
    const positionStyles = getPositionStyles(position, offsetX, offsetY);
    this.styleElement = injectWidgetStyles(positionStyles);
  }

  private loadFullWidget(): void {
    // Load React dependencies first
    loadDependencies()
      .then(() => {
        // Add cache busting to prevent stale scripts
        const cacheBuster = `?v=${new Date().getTime()}`;
        
        // Handle widget events
        const onEvent = (event: any) => {
          this.eventManager.handleEvent(event);
        };
        
        // Create config with position, branding etc.
        const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
        const config = prepareWidgetConfig(this.options, position, offsetX, offsetY);
        
        // Add event handler
        config.onEvent = onEvent;
        
        // Create global config object
        (window as any).__PULLSE_CHAT_CONFIG__ = config;
        
        // Save widget instance for global access
        (window as any).__PULLSE_CHAT_INSTANCE__ = this;
        
        // Load the widget bundle
        this.scriptElement = document.createElement('script');
        this.scriptElement.src = `https://cdn.pullse.io/chat-widget.js${cacheBuster}`;
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
  
  /**
   * Subscribe to widget events
   */
  public on(eventType: any, callback: any): () => void {
    return this.eventManager.on(eventType, callback);
  }
  
  /**
   * Unsubscribe from widget events
   */
  public off(eventType: any, callback?: any): void {
    this.eventManager.off(eventType, callback);
  }

  /**
   * Open the chat widget
   */
  public open(): void {
    this._isOpen = true;
    
    if (!this.containerElement) {
      this.createContainer();
      this.loadFullWidget();
    }
    
    if (this.launcherElement) {
      this.launcherElement.style.display = 'none';
    }
    
    // Try to trigger open on the widget if it's loaded
    if (this.widgetLoaded && (window as any).__PULLSE_CHAT_WIDGET__) {
      (window as any).__PULLSE_CHAT_WIDGET__.open();
    }
  }
  
  /**
   * Close the chat widget
   */
  public close(): void {
    this._isOpen = false;
    
    // Try to trigger close on the widget if it's loaded
    if (this.widgetLoaded && (window as any).__PULLSE_CHAT_WIDGET__) {
      (window as any).__PULLSE_CHAT_WIDGET__.close();
    }
    
    // Show the launcher button again
    if (this.launcherElement) {
      this.launcherElement.style.display = 'block';
    }
  }
  
  /**
   * Toggle the chat widget open/closed state
   */
  public toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Check if the chat widget is open
   */
  public isOpen(): boolean {
    return this._isOpen;
  }
  
  /**
   * Update the widget configuration
   */
  public updateConfig(options: Partial<PullseChatWidgetOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update the global config object
    if ((window as any).__PULLSE_CHAT_CONFIG__) {
      (window as any).__PULLSE_CHAT_CONFIG__ = {
        ...(window as any).__PULLSE_CHAT_CONFIG__,
        ...prepareWidgetConfig(this.options)
      };
    }
    
    // Try to update the widget if it's loaded
    if (this.widgetLoaded && (window as any).__PULLSE_CHAT_WIDGET__) {
      (window as any).__PULLSE_CHAT_WIDGET__.updateConfig(this.options);
    }
  }
  
  /**
   * Get the current widget configuration
   */
  public getConfig(): PullseChatWidgetOptions {
    return { ...this.options };
  }
  
  /**
   * Send a message programmatically
   */
  public async sendMessage(text: string, metadata?: Record<string, any>): Promise<void> {
    // Make sure the widget is open
    if (!this._isOpen) {
      this.open();
    }
    
    // Wait for the widget to load if necessary
    if (!this.widgetLoaded) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.widgetLoaded && (window as any).__PULLSE_CHAT_WIDGET__) {
            clearInterval(checkInterval);
            (window as any).__PULLSE_CHAT_WIDGET__.sendMessage(text, metadata).then(resolve);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 5000);
      });
    }
    
    // Send the message if the widget is loaded
    if ((window as any).__PULLSE_CHAT_WIDGET__) {
      return (window as any).__PULLSE_CHAT_WIDGET__.sendMessage(text, metadata);
    }
  }
  
  /**
   * Clear all messages in the current conversation
   */
  public clearMessages(): void {
    if (this.widgetLoaded && (window as any).__PULLSE_CHAT_WIDGET__) {
      (window as any).__PULLSE_CHAT_WIDGET__.clearMessages();
    }
  }
  
  /**
   * Destroy the widget instance and remove from DOM
   */
  public destroy(): void {
    // Remove all elements from DOM
    if (this.containerElement) {
      this.containerElement.parentElement?.removeChild(this.containerElement);
      this.containerElement = null;
    }
    
    if (this.launcherElement) {
      this.launcherElement.parentElement?.removeChild(this.launcherElement);
      this.launcherElement = null;
    }
    
    if (this.styleElement) {
      this.styleElement.parentElement?.removeChild(this.styleElement);
      this.styleElement = null;
    }
    
    if (this.scriptElement) {
      this.scriptElement.parentElement?.removeChild(this.scriptElement);
      this.scriptElement = null;
    }
    
    // Stop observing if lazy loading was enabled
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
      this.lazyLoadObserver = null;
    }
    
    this.initialized = false;
    this.widgetLoaded = false;
  }
  
  /**
   * Reload the widget with current configuration
   */
  public reload(): void {
    this.destroy();
    this.init();
  }
}
