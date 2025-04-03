import { PullseChatWidgetOptions, EventCallback } from '../types';
import { ChatEventType, ChatEventPayload } from '../../config';
import { validateWidgetOptions } from './optionsValidator';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { 
  initializeWidgetContainer, 
  loadWidgetScript,
  initializeWidgetEvents,
  cleanupWidgetReferences
} from '../initialization/widgetInitializer';
import {
  subscribeToWidgetEvent,
  unsubscribeFromWidgetEvent,
  dispatchWidgetEvent
} from '../events/widgetEvents';

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
      this.container = initializeWidgetContainer(this.options);
      
      // Store global instance reference
      (window as any).__PULLSE_CHAT_INSTANCE__ = this;
      
      // Initialize widget script
      loadWidgetScript(this.options);
      
      // Set up event handlers from options
      initializeWidgetEvents(this.options);
      
      this.isInitialized = true;
      logger.info('Widget initialized successfully', 'WidgetLoader');
    } catch (error) {
      // Sanitize the error message before logging or dispatching events
      const safeErrorMessage = sanitizeErrorMessage(error);
      
      logger.error('Failed to initialize Pullse Chat Widget', 'WidgetLoader', {
        error: safeErrorMessage
      });
      
      dispatchWidgetEvent({
        type: 'chat:error',
        timestamp: new Date(),
        data: {
          error: 'initialization_failed',
          message: safeErrorMessage
        }
      });
    }
  }
  
  /**
   * Subscribe to events
   */
  public on(eventType: ChatEventType | 'all', callback: EventCallback): () => void {
    return subscribeToWidgetEvent(eventType, callback);
  }
  
  /**
   * Unsubscribe from events
   */
  public off(eventType: ChatEventType | 'all', callback?: EventCallback): void {
    unsubscribeFromWidgetEvent(eventType, callback);
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
    cleanupEventHandlers();
    
    // Remove global instance reference
    cleanupWidgetReferences();
    
    this.isInitialized = false;
    
    logger.info('Widget instance destroyed', 'WidgetLoader');
  }
}
