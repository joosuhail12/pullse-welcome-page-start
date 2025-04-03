import { ChatEventType, ChatEventPayload, ChatPosition, ChatBranding } from '../config';

/**
 * Configuration options for the Pullse Chat Widget
 */
export interface PullseChatWidgetOptions {
  /**
   * The workspace ID for the chat widget (required)
   */
  workspaceId: string;
  
  /**
   * Welcome message to display to the user
   */
  welcomeMessage?: string;
  
  /**
   * Primary color for the chat widget theme
   * Can be any valid CSS color value
   */
  primaryColor?: string;
  
  /**
   * Position of the chat widget on the page
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * Horizontal offset from the edge of the screen (in pixels)
   */
  offsetX?: number;
  
  /**
   * Vertical offset from the edge of the screen (in pixels)
   */
  offsetY?: number;
  
  /**
   * Whether to hide the Pullse branding in the widget
   */
  hideBranding?: boolean;
  
  /**
   * Whether to open the chat widget automatically
   */
  autoOpen?: boolean;
  
  /**
   * URL for the company logo displayed in the widget
   */
  logoUrl?: string;
  
  /**
   * URL for the default avatar image
   */
  avatarUrl?: string;
  
  /**
   * Title displayed in the widget header
   */
  widgetTitle?: string;
  
  /**
   * Callback for widget events
   */
  onEvent?: (event: ChatEventPayload) => void;
  
  /**
   * Individual event handlers for specific events
   */
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
  
  /**
   * Whether to lazy load the widget when user scrolls
   */
  lazyLoadScroll?: boolean;
  
  /**
   * Threshold for lazy loading (0-1), percentage of page scroll
   */
  scrollThreshold?: number;
  
  /**
   * Pre-defined user data to associate with the chat
   */
  userData?: Record<string, any>;
  
  /**
   * Custom CSS classes to add to the widget container
   */
  customClasses?: string;
  
  /**
   * Domains allowed to embed the widget (security feature)
   */
  allowedDomains?: string[];
}

/**
 * Event callback function type
 */
export type EventCallback = (payload: ChatEventPayload) => void;

/**
 * Pullse Chat API interface
 */
export interface PullseChatAPI {
  /**
   * Open the chat widget
   */
  open: () => void;
  
  /**
   * Close the chat widget
   */
  close: () => void;
  
  /**
   * Toggle the chat widget open/closed state
   */
  toggle: () => void;
  
  /**
   * Set user data for the chat session
   */
  setUserData: (userData: Record<string, any>) => void;
  
  /**
   * Start a new conversation optionally with an initial message
   */
  startConversation: (initialMessage?: string) => void;
  
  /**
   * Send a message programmatically
   */
  sendMessage: (message: string) => void;
  
  /**
   * Update widget configuration
   */
  updateConfig: (configUpdates: Partial<PullseChatWidgetOptions>) => void;
  
  /**
   * Clear unread message counter
   */
  clearUnreadCounter: () => void;
  
  /**
   * Get access to the event manager
   */
  getEventManager: () => any;
}
