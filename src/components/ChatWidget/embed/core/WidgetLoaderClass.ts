
import { PullseChatWidgetOptions, EventCallback } from '../types';
import { ChatEventType, ChatEventPayload } from '../../config';
import { getEventManager, EventPriority } from '../enhancedEvents';
import { validateEventPayload } from '../../utils/eventValidation';
import { logger } from '@/lib/logger';
import { initializeWidgetDOM } from './domManager';
import { validateWidgetOptions } from './optionsValidator';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';

export class PullseChatWidgetLoader {
  private options: PullseChatWidgetOptions;
  private container: HTMLElement | null = null;
  private isInitialized: boolean = false;
  
  constructor(options: PullseChatWidgetOptions) {
    this.options = validateWidgetOptions(options);
    this.initialize();
  }
  
  /**
   * Initialize the widget
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }
    
    try {
      logger.info('Initializing Pullse Chat Widget', 'WidgetLoader');
      
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
      logger.info('Widget initialized successfully', 'WidgetLoader');
    } catch (error) {
      // Sanitize the error message before logging or dispatching events
      const safeErrorMessage = sanitizeErrorMessage(error);
      
      logger.error('Failed to initialize Pullse Chat Widget', 'WidgetLoader', {
        error: safeErrorMessage
      });
      
      this.dispatchEvent({
        type: 'chat:error',
        timestamp: new Date(),
        data: {
          error: 'initialization_failed',
          message: safeErrorMessage
        }
      } as ChatEventPayload);
    }
  }
  
  /**
   * Load the widget script
   */
  private loadWidgetScript(): void {
    initializeWidgetDOM(this.options);
  }
  
  /**
   * Set up event handlers from options
   */
  private setupEventHandlers(): void {
    const eventManager = getEventManager();
    
    // Register global event handler if provided
    if (this.options.onEvent) {
      logger.debug('Registering global onEvent handler', 'WidgetLoader');
      eventManager.on('all', this.options.onEvent);
    }
    
    // Register specific event handlers if provided
    if (this.options.eventHandlers) {
      logger.debug('Registering event handlers', 'WidgetLoader');
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
    logger.debug(`Subscribing to ${eventType} events`, 'WidgetLoader');
    const eventManager = getEventManager();
    return eventManager.on(eventType, callback);
  }
  
  /**
   * Unsubscribe from events
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    logger.debug(`Unsubscribing from ${eventType} events`, 'WidgetLoader');
    const eventManager = getEventManager();
    eventManager.off(eventType, callback);
  }
  
  /**
   * Destroy the widget instance
   */
  public destroy(): void {
    logger.info('Destroying widget instance', 'WidgetLoader');
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Clean up event handlers
    getEventManager().dispose();
    
    // Remove global instance reference
    delete (window as any).__PULLSE_CHAT_INSTANCE__;
    delete (window as any).__PULLSE_CHAT_CONFIG__;
    
    this.isInitialized = false;
    
    logger.info('Widget instance destroyed', 'WidgetLoader');
  }
}
