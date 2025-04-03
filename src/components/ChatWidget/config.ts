
/**
 * Shared configuration and types for the Chat Widget
 */

// Chat event types
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
  | 'chat:error'
  | 'chat:connectionChange'
  | 'typing';

// Chat event payload structure
export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

// Chat widget position
export type ChatPosition = {
  placement: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  offsetX?: number;
  offsetY?: number;
};

// Chat widget branding
export interface ChatBranding {
  primaryColor?: string;
  showBrandingBar?: boolean;
  avatarUrl?: string;
  logoUrl?: string;
  customCss?: string;
}

// Pre-chat form configuration
export interface PreChatForm {
  enabled: boolean;
  fields?: Array<{
    id?: string;  // Make id optional
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'select';
    required?: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  title?: string;
  subtitle?: string;
}

// Real-time configuration
export interface RealTimeConfig {
  enabled: boolean;
  typingIndicators?: boolean;
  readReceipts?: boolean;
  presenceIndicators?: boolean;
}

// Security configuration
export interface SecurityConfig {
  csrfProtection?: boolean;
  contentSecurity?: {
    allowedDomains?: string[];
    allowImages?: boolean;
    allowLinks?: boolean;
    allowedFileTypes?: string[];
  };
  rateLimit?: {
    messagesPerMinute?: number;
    tokensPerMinute?: number;
  };
}

// Features configuration
export interface FeaturesConfig {
  messageReactions?: boolean;
  fileUploads?: boolean;
  searchMessages?: boolean;
  quickReplies?: boolean;
  cards?: boolean;
  voiceMessages?: boolean;
  readReceipts?: boolean;
}

// Add event handler type for global events
export type EventCallback = (payload: ChatEventPayload) => void;

// Complete widget configuration
export interface ChatWidgetConfig {
  workspaceId: string;
  welcomeMessage?: string;
  branding?: ChatBranding;
  position?: ChatPosition;
  preChatForm?: PreChatForm;
  realtime?: RealTimeConfig;
  security?: SecurityConfig;
  features?: FeaturesConfig;
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
  onEvent?: EventCallback;
}

// Default configuration
export const defaultConfig: ChatWidgetConfig = {
  workspaceId: 'default',
  welcomeMessage: 'Hello! How can I help you today?',
  branding: {
    primaryColor: '#6366f1',
    showBrandingBar: true
  },
  position: {
    placement: 'bottom-right',
    offsetX: 20,
    offsetY: 20
  },
  preChatForm: {
    enabled: false,
    fields: [
      {
        id: 'user-name',  // Add explicit ID
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your name'
      },
      {
        id: 'user-email',  // Add explicit ID
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Enter your email'
      }
    ]
  },
  realtime: {
    enabled: true,
    typingIndicators: true,
    readReceipts: true,
    presenceIndicators: true
  },
  security: {
    csrfProtection: true,
    contentSecurity: {
      allowedDomains: ['*'],
      allowImages: true,
      allowLinks: true,
      allowedFileTypes: ['image/*', 'application/pdf']
    },
    rateLimit: {
      messagesPerMinute: 10,
      tokensPerMinute: 1000
    }
  },
  features: {
    messageReactions: true,
    fileUploads: true,
    searchMessages: true,
    quickReplies: true,
    cards: true,
    voiceMessages: false,
    readReceipts: true
  }
};
