
import { PullseChatWidgetOptions } from './types';
import { getPositionStyles, loadDependencies } from './utils';
import { EventManager } from './events';
import { createLauncherButton, createWidgetContainer, injectWidgetStyles } from './ui-components';
import { initLazyLoadViaScroll, prepareWidgetConfig } from './lazy-loading';

/**
 * Main widget loader class
 */
export class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private scriptElement: HTMLScriptElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private containerElement: HTMLDivElement | null = null;
  private launcherElement: HTMLDivElement | null = null;
  private initialized = false;
  private widgetLoaded = false;
  private lazyLoadObserver: IntersectionObserver | null = null;
  public eventManager: EventManager;
  private isOpen = false;
  private userData: Record<string, any> = {};

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
        this.createContainer();
        this.loadFullWidget();
        this.open();
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
    // Don't load again if already loaded
    if (this.widgetLoaded) return;
    
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
        
        // Include user data if available
        if (Object.keys(this.userData).length > 0) {
          config.userData = this.userData;
        }
        
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
          
          // Auto open if configured
          if (this.options.autoOpen) {
            this.open();
          }
        };
        this.scriptElement.onerror = () => {
          console.error('Failed to load Pullse Chat Widget');
        };
        
        document.body.appendChild(this.scriptElement);
      })
      .catch(error => console.error('Failed to load dependencies:', error));
  }
  
  /**
   * Public API Methods
   */
  
  // Widget visibility control
  public open(): void {
    this.isOpen = true;
    
    // Ensure widget is loaded before trying to open
    if (!this.widgetLoaded) {
      this.loadFullWidget();
    }
    
    // Dispatch event
    this.eventManager.dispatchEvent({
      type: 'chat:open',
      timestamp: new Date(),
      data: undefined
    });
    
    // Update DOM if widget is loaded
    if (this.containerElement) {
      this.containerElement.style.display = 'block';
      
      // Hide launcher button
      if (this.launcherElement) {
        this.launcherElement.style.display = 'none';
      }
    }
  }
  
  public close(): void {
    this.isOpen = false;
    
    // Dispatch event
    this.eventManager.dispatchEvent({
      type: 'chat:close',
      timestamp: new Date(),
      data: undefined
    });
    
    // Update DOM if widget is loaded
    if (this.containerElement) {
      this.containerElement.style.display = 'none';
      
      // Show launcher button
      if (this.launcherElement) {
        this.launcherElement.style.display = 'block';
      }
    }
  }
  
  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // User information
  public setUserData(userData: Record<string, any>): void {
    this.userData = { ...this.userData, ...userData };
    
    // Update global config
    if ((window as any).__PULLSE_CHAT_CONFIG__) {
      (window as any).__PULLSE_CHAT_CONFIG__.userData = this.userData;
    }
    
    // Dispatch event
    this.eventManager.dispatchEvent({
      type: 'user:updated',
      timestamp: new Date(),
      data: { userData: this.userData }
    });
  }
  
  // Conversation management
  public startConversation(initialMessage?: string): void {
    // First open the widget
    this.open();
    
    // Wait for widget to load
    if (!this.widgetLoaded) {
      setTimeout(() => {
        this.startConversation(initialMessage);
      }, 500);
      return;
    }
    
    // Dispatch event to start conversation
    this.eventManager.dispatchEvent({
      type: 'contact:initiatedChat',
      timestamp: new Date(),
      data: { initialMessage }
    });
    
    // If initial message provided, send it
    if (initialMessage) {
      this.sendMessage(initialMessage);
    }
  }
  
  public sendMessage(message: string): void {
    if (!message || !message.trim()) return;
    
    // Open widget first if closed
    if (!this.isOpen) {
      this.open();
    }
    
    // Wait for widget to load
    if (!this.widgetLoaded) {
      setTimeout(() => {
        this.sendMessage(message);
      }, 500);
      return;
    }
    
    // Dispatch event to send message
    this.eventManager.dispatchEvent({
      type: 'chat:messageSent',
      timestamp: new Date(),
      data: { message }
    });
  }
  
  // Appearance and customization
  public updateConfig(configUpdates: Partial<PullseChatWidgetOptions>): void {
    // Update options
    this.options = { ...this.options, ...configUpdates };
    
    // Update global config
    if ((window as any).__PULLSE_CHAT_CONFIG__) {
      const { position = 'bottom-right', offsetX = 20, offsetY = 20 } = this.options;
      const config = prepareWidgetConfig(this.options, position, offsetX, offsetY);
      (window as any).__PULLSE_CHAT_CONFIG__ = {
        ...(window as any).__PULLSE_CHAT_CONFIG__,
        ...config
      };
    }
    
    // Update styles if position changed
    if (configUpdates.position || configUpdates.offsetX || configUpdates.offsetY) {
      if (this.styleElement) {
        document.head.removeChild(this.styleElement);
        this.injectStyles();
      }
    }
  }
  
  // Notification and badge management
  public clearUnreadCounter(): void {
    this.eventManager.dispatchEvent({
      type: 'notifications:cleared',
      timestamp: new Date(),
      data: undefined
    });
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
}
