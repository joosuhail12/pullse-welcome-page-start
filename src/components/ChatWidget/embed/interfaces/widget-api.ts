
import { PullseChatWidgetOptions, EventCallback } from '../types';
import { ChatEventType } from '../../config';

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
