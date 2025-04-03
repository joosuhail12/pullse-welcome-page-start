
import { ChatEventType, ChatEventPayload, ChatPosition, ChatBranding } from '../config';

/**
 * Configuration options for the Pullse Chat Widget
 */
export interface PullseChatWidgetOptions {
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

export type EventCallback = (payload: ChatEventPayload) => void;

/**
 * Extended options for advanced widget configuration
 */
export interface AdvancedWidgetOptions extends PullseChatWidgetOptions {
  // Advanced accessibility options
  accessibilityLabels?: {
    openChat?: string;
    closeChat?: string;
    sendMessage?: string;
    attachFile?: string;
  };
  
  // Custom styling options
  customCSS?: string;
  
  // Analytics config
  analyticsEnabled?: boolean;
  analyticsProvider?: 'google' | 'segment' | 'mixpanel' | 'custom';
  analyticsConfig?: Record<string, any>;
  
  // User identification
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    metadata?: Record<string, any>;
  };
}
