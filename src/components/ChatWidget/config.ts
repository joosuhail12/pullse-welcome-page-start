
/**
 * Chat Widget Configuration Types
 */

export interface PreChatFormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface PreChatForm {
  enabled: boolean;
  title?: string;
  fields: PreChatFormField[];
}

export interface ChatBranding {
  primaryColor?: string;
  fontFamily?: string;
  avatarUrl?: string;
  showBrandingBar?: boolean;
  // Enhanced styling options
  borderRadius?: string;
  buttonStyle?: 'solid' | 'outline' | 'ghost' | 'soft';
  messageStyle?: 'rounded' | 'square' | 'bubble';
  theme?: 'light' | 'dark' | 'auto';
  // Custom CSS properties
  customCSS?: {
    [key: string]: string;
  };
  widgetHeader?: {
    backgroundColor?: string;
    textColor?: string;
  };
  userBubble?: {
    backgroundColor?: string;
    textColor?: string;
  };
  systemBubble?: {
    backgroundColor?: string;
    textColor?: string;
  };
  inputBox?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

export interface ChatFeatures {
  fileUpload?: boolean;
  messageRating?: boolean;
  readReceipts?: boolean;
  quickReplies?: boolean;
  cards?: boolean;
  chatSuggestions?: boolean;
  messageReactions?: boolean;
  typingIndicators?: boolean;
  searchMessages?: boolean;
}

export interface ChatRealtime {
  enabled: boolean;
  // No longer storing API key directly here
  authEndpoint?: string;
}

export type ChatEventType = 
  | 'chat:open'
  | 'chat:close'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'contact:initiatedChat'
  | 'contact:formCompleted'
  | 'message:reacted'
  // New events
  | 'widget:loaded'
  | 'message:delivered'
  | 'message:read'
  | 'conversation:ended'
  | 'file:uploaded'
  | 'file:error'
  | 'search:performed'
  | 'error:occurred'
  | 'agent:typing';

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export interface ChatWidgetConfig {
  workspaceId: string;
  welcomeMessage: string;
  preChatForm: PreChatForm;
  branding?: ChatBranding;
  features?: ChatFeatures;
  realtime?: ChatRealtime;
  sessionId?: string;
  onEvent?: (event: ChatEventPayload) => void;
  // New options for custom event handling
  events?: {
    // Allows registering multiple event handlers by event type
    [key in ChatEventType]?: Array<(payload: ChatEventPayload) => void>;
  };
  // Position options
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const defaultConfig: ChatWidgetConfig = {
  workspaceId: 'default',
  welcomeMessage: 'Welcome! How can we help you today?',
  preChatForm: {
    enabled: true,
    title: 'Start a Conversation',
    fields: [
      {
        id: 'name-field',
        name: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true
      },
      {
        id: 'email-field',
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true
      }
    ]
  },
  branding: {
    primaryColor: '#8B5CF6',
    showBrandingBar: true,
    borderRadius: '0.5rem',
    buttonStyle: 'solid',
    messageStyle: 'rounded',
    theme: 'light',
  },
  features: {
    fileUpload: true,
    messageRating: false,
    readReceipts: true,
    quickReplies: true,
    cards: true,
    chatSuggestions: false,
    messageReactions: true,
    typingIndicators: true,
    searchMessages: true
  },
  realtime: {
    enabled: false,
    // Using auth endpoint instead of direct API key
    authEndpoint: '/api/chat-widget/token'
  },
  position: 'bottom-right'
};

