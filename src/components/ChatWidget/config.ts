import { CSSProperties } from 'react';

export interface BrandAssets {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  fontFamily?: string;
}

export interface Contact {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export interface QuickReply {
  id: string;
  text: string;
  payload: string;
}

export interface ThemeConfig {
  light: CSSProperties;
  dark: CSSProperties;
}

export enum ChatEventType {
  // Chat Widget status
  Open = "chat:open",
  Close = "chat:close",
  
  // Message events
  MessageSent = "chat:messageSent",
  MessageReceived = "chat:messageReceived",
  MessageReacted = "message:reacted",
  FileUploaded = "message:fileUploaded",
  
  // Contact events
  InitiatedChat = "contact:initiated",
  FormCompleted = "contact:formCompleted",
  
  // Typing events
  TypingStarted = "chat:typingStarted",
  TypingStopped = "chat:typingStopped",
  
  // Connection events
  ConnectionChange = "chat:connectionChange",
  
  // Error events
  Error = "chat:error"
}

export interface ChatWidgetConfig {
  workspaceId: string;
  baseUrl?: string;
  brandAssets?: BrandAssets;
  contact?: Contact;
  greeting?: string;
  farewell?: string;
  offlineMessage?: string;
  theme?: ThemeConfig;
  position?: 'left' | 'right';
  customCss?: string;
  display poweredBy?: boolean;
  quickReplies?: QuickReply[];
  preChatFormEnabled?: boolean;
  realtime?: {
    enabled: boolean;
    readReceipts?: boolean;
  };
  onEvent?: (event: ChatEventPayload) => void;
  eventHandlers?: {
    [key in ChatEventType]?: (event: ChatEventPayload) => void;
  };
  sessionId?: string;
}

export const defaultConfig: ChatWidgetConfig = {
  workspaceId: '',
  baseUrl: 'http://localhost:3000',
  brandAssets: {
    primaryColor: '#007BFF',
    secondaryColor: '#6C757D',
    logoUrl: '',
  },
  greeting: 'Hello! How can I help you today?',
  farewell: 'Thank you for chatting with us!',
  offlineMessage: 'We are currently offline. Please leave a message, and we\'ll get back to you as soon as possible.',
  theme: {
    light: {
      '--widget-background-color': '#f9f9f9',
      '--widget-text-color': '#333',
      '--widget-primary-color': '#007BFF',
    },
    dark: {
      '--widget-background-color': '#333',
      '--widget-text-color': '#f9f9f9',
      '--widget-primary-color': '#007BFF',
    },
  },
  position: 'right',
  displayPoweredBy: true,
  preChatFormEnabled: true,
};
