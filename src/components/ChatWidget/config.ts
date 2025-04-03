import { AgentStatus } from "./types";

export type ChatEventType = 
  | 'chat:open'
  | 'chat:close'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'contact:initiatedChat'
  | 'contact:formCompleted'
  | 'message:reacted'
  | 'chat:typingStarted'
  | 'chat:typingStopped'
  | 'message:fileUploaded'
  | 'chat:ended'
  | 'chat:connectionChange'
  | 'chat:error';

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export type ChatBranding = {
  primaryColor?: string;
  logoUrl?: string;
  avatarUrl?: string;
  widgetTitle?: string;
  showBrandingBar?: boolean;
};

export type ChatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export enum ChatWidgetViews {
  HOME = 'home',
  CHAT = 'chat',
  MESSAGES = 'messages',
  SETTINGS = 'settings'
}

export interface ChatWidgetConfig {
  workspaceId?: string;
  branding?: ChatBranding;
  position?: {
    placement: ChatPosition;
    offsetX?: number;
    offsetY?: number;
  };
  features?: {
    searchMessages?: boolean;
    fileUploads?: boolean;
    messageReactions?: boolean;
    readReceipts?: boolean;
    typing?: boolean;
  };
  preChatForm?: {
    enabled: boolean;
    requiredFields: string[];
    optionalFields?: string[];
    title?: string;
    subtitle?: string;
    fields?: Array<{
      name: string;
      type: string;
      label: string;
      required: boolean;
      placeholder?: string;
      id?: string;
    }>;
  };
  realtime?: {
    enabled?: boolean;
    serverUrl?: string;
    apiKey?: string;
  };
  appearance?: {
    theme?: 'light' | 'dark' | 'auto';
    chatBubbleColor?: string;
    userBubbleColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    roundedCorners?: boolean;
  };
  welcomeMessage?: string;
  onEvent?: (event: ChatEventPayload) => void;
  eventHandlers?: Record<string, (payload: ChatEventPayload) => void>;
  messages?: {
    emptyStateText?: string;
    loadMoreText?: string;
  };
}

export const defaultConfig: ChatWidgetConfig = {
  branding: {
    primaryColor: '#8B5CF6',
    widgetTitle: 'Support Chat',
    showBrandingBar: true
  },
  position: {
    placement: 'bottom-right',
    offsetX: 20,
    offsetY: 20
  },
  features: {
    searchMessages: true,
    fileUploads: true,
    messageReactions: false,
    readReceipts: true,
    typing: true
  }
};
