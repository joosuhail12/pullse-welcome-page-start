
/**
 * Chat Widget Configuration
 * 
 * This file defines the configuration types and default values for the Chat Widget
 */

// Import types to avoid circular dependencies
import type { MessageReadStatus } from './components/MessageReadReceipt';

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
  features?: {
    searchMessages?: boolean;
    messageReactions?: boolean;
    fileUploads?: boolean;
    readReceipts?: boolean;
    typing?: boolean;
    cardMessages?: boolean;
    quickReplies?: boolean;
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
      id: string;
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
  features: {
    searchMessages: true,
    messageReactions: true,
    fileUploads: true,
    readReceipts: true,
    typing: true,
    cardMessages: true,
    quickReplies: true
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

// Import and re-export security event types
export { SecurityEventType, SecurityEventOutcome } from './utils/security/types';
