
/**
 * Chat Widget Configuration
 * 
 * This file defines the configuration types and default values for the Chat Widget
 */

// Chat Widget Configuration Interface
export interface ChatWidgetConfig {
  workspaceId: string;
  position?: {
    placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    offsetX?: number;
    offsetY?: number;
  };
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    avatarUrl?: string;
    widgetTitle?: string;
    showBrandingBar?: boolean;
  };
  realtime?: {
    enabled?: boolean;
    connectionTimeout?: number;
    reconnectAttempts?: number;
  };
  onEvent?: (event: ChatEventPayload) => void;
  autoOpen?: boolean;
  welcomeMessage?: string;
  sessionId?: string;
  preChatForm?: {
    enabled: boolean;
    title: string;
    description?: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
      required: boolean;
      options?: string[];
      placeholder?: string;
    }>;
    submitButtonText?: string;
  };
  testMode?: boolean;
}

// Default configuration
export const defaultConfig: ChatWidgetConfig = {
  workspaceId: '',
  position: {
    placement: 'bottom-right',
    offsetX: 20,
    offsetY: 20
  },
  branding: {
    primaryColor: '#6366f1',
    showBrandingBar: true,
    widgetTitle: 'Chat with us'
  },
  realtime: {
    enabled: false,
    connectionTimeout: 30000,
    reconnectAttempts: 5
  },
  welcomeMessage: 'How can we help you today?',
  preChatForm: {
    enabled: false,
    title: 'Start a conversation',
    fields: []
  }
};

// Chat Event Types
export type ChatEventType =
  | 'chat:open'
  | 'chat:close'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'chat:typingStarted'
  | 'chat:typingStopped'
  | 'contact:initiatedChat'
  | 'contact:identified'
  | 'chat:ended'
  | 'message:sent'
  | 'message:delivered'
  | 'message:read'
  | 'message:reacted'
  | 'message:fileUploaded'
  | 'error'
  | 'chat:connectionChange'
  | string; // Allow string extension for dynamic events

// Chat Event Payload Interface
export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

// Security Event Types
export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  USER_MANAGEMENT = 'user_management',
  CONFIGURATION_CHANGE = 'configuration_change',
  SECURITY_SETTING_CHANGE = 'security_setting_change',
  LOGIN_ATTEMPT = 'login_attempt',
  LOGOUT = 'logout',
  SESSION_MANAGEMENT = 'session_management',
  API_ACCESS = 'api_access',
  RATE_LIMIT = 'rate_limit'
}

// Security Event Outcome
export type SecurityEventOutcome = 'SUCCESS' | 'FAILURE' | 'ATTEMPT' | 'UNKNOWN';
