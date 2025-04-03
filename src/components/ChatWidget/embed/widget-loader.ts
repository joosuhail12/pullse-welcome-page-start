import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType, ChatEventPayload } from '../config';
import { getEventManager, EventPriority } from './enhancedEvents';
import { validateEventPayload } from '../utils/eventValidation';

export class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private container: HTMLElement | null = null;
  private isInitialized: boolean = false;
  
  constructor(options: PullseChatWidgetOptions) {
    this.options = this.validateOptions(options);
    this.initialize();
  }
  
  /**
   * Validate and sanitize widget options
   */
  private validateOptions(options: PullseChatWidgetOptions): PullseChatWidgetOptions {
    // Ensure required fields
    if (!options.workspaceId) {
      console.error('Pullse Chat Widget: workspaceId is required');
      throw new Error('workspaceId is required for Pullse Chat Widget');
    }
    
    // Clone options to avoid mutations
    const validatedOptions = { ...options };
    
    // Sanitize color values
    if (validatedOptions.primaryColor && !this.isValidColor(validatedOptions.primaryColor)) {
      console.warn(`Invalid primary color: ${validatedOptions.primaryColor}, using default`);
      delete validatedOptions.primaryColor;
    }
    
    // Validate position
    if (validatedOptions.position && 
        !['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(validatedOptions.position)) {
      console.warn(`Invalid position: ${validatedOptions.position}, using default`);
      delete validatedOptions.position;
    }
    
    // Validate offsets
    if (validatedOptions.offsetX !== undefined && (isNaN(validatedOptions.offsetX) || validatedOptions.offsetX < 0)) {
      console.warn(`Invalid offsetX: ${validatedOptions.offsetX}, using default`);
      delete validatedOptions.offsetX;
    }
    
    if (validatedOptions.offsetY !== undefined && (isNaN(validatedOptions.offsetY) || validatedOptions.offsetY < 0)) {
      console.warn(`Invalid offsetY: ${validatedOptions.offsetY}, using default`);
      delete validatedOptions.offsetY;
    }
    
    return validatedOptions;
  }
  
  /**
   * Check if a color value is valid
   */
  private isValidColor(color: string): boolean {
    // Check for valid hex, rgb, rgba, hsl, hsla, or named color
    const colorRegex = /^(#([0-9a-f]{3}){1,2}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\))$/i;
    
    return colorRegex.test(color) || [
      'black', 'silver', 'gray', 'white', 'maroon', 'red', 'purple', 
      'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 
      'teal', 'aqua'
    ].includes(color.toLowerCase());
  }
  
  /**
   * Initialize the widget
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }
    
    try {
      // Create container for widget
      this.container = document.createElement('div');
      this.container.id = 'pullse-chat-widget-container';
      document.body.appendChild(this.container);
      
      // Store global instance reference
      (window as any).__PULLSE_CHAT_INSTANCE__ = this;
      (window as any).__PULLSE_CHAT_CONFIG__ = this.options;
      
      // Initialize widget script
      this.loadWidgetScript();
      
      // Set up event handlers from options
      this.setupEventHandlers();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Pullse Chat Widget:', error);
      this.dispatchEvent({
        type: 'chat:error',
        timestamp: new Date(),
        data: {
          error: 'initialization_failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      } as ChatEventPayload);
    }
  }
  
  /**
   * Load the widget script
   */
  private loadWidgetScript(): void {
    // Implementation for loading widget script
    // Check if the widget script is already loaded
    if (document.getElementById('pullse-chat-widget-script')) {
      console.warn('Pullse Chat Widget script already loaded.');
      return;
    }
    
    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://cdn.pullse.io/chat-widget.js';
    script.async = true;
    script.id = 'pullse-chat-widget-script';
    
    // Set global config object
    (window as any).__PULLSE_CHAT_CONFIG__ = this.options;
    
    // Handle script load event
    script.onload = () => {
      console.log('Pullse Chat Widget script loaded successfully.');
      
      // Initialize the chat widget if the init function exists
      if (typeof (window as any).initPullseChatWidget === 'function') {
        (window as any).initPullseChatWidget(this.options);
      } else {
        console.warn('initPullseChatWidget function not found in the loaded script.');
      }
    };
    
    // Handle script error event
    script.onerror = (error) => {
      console.error('Failed to load Pullse Chat Widget script:', error);
    };
    
    // Append the script to the document body
    document.body.appendChild(script);
  }
  
  /**
   * Set up event handlers from options
   */
  private setupEventHandlers(): void {
    const eventManager = getEventManager();
    
    // Register global event handler if provided
    if (this.options.onEvent) {
      eventManager.on('all', this.options.onEvent);
    }
    
    // Register specific event handlers if provided
    if (this.options.eventHandlers) {
      Object.entries(this.options.eventHandlers).forEach(([eventType, handler]) => {
        if (handler) {
          eventManager.on(eventType as ChatEventType, handler);
        }
      });
    }
  }
  
  /**
   * Dispatch an event
   */
  private dispatchEvent(event: ChatEventPayload): void {
    const eventManager = getEventManager();
    eventManager.handleEvent(event);
  }
  
  /**
   * Subscribe to events
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    const eventManager = getEventManager();
    return eventManager.on(eventType, callback);
  }
  
  /**
   * Unsubscribe from events
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    const eventManager = getEventManager();
    eventManager.off(eventType, callback);
  }
  
  /**
   * Destroy the widget instance
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Clean up event handlers
    getEventManager().dispose();
    
    // Remove global instance reference
    delete (window as any).__PULLSE_CHAT_INSTANCE__;
    delete (window as any).__PULLSE_CHAT_CONFIG__;
    
    this.isInitialized = false;
  }
}
