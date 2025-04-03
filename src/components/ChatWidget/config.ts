
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
  logoUrl?: string;
  showBrandingBar?: boolean;
  widgetTitle?: string;
}

export interface ChatPosition {
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offsetX?: number;
  offsetY?: number;
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
  | 'chat:typingStarted'
  | 'chat:typingStopped'
  | 'message:fileUploaded'
  | 'chat:ended'
  | 'chat:configUpdated'; // Added new event type for configuration updates

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
  position?: ChatPosition;
  features?: ChatFeatures;
  realtime?: ChatRealtime;
  sessionId?: string;
  onEvent?: (event: ChatEventPayload) => void;
  // Added to support advanced event subscription
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
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
    showBrandingBar: true
  },
  position: {
    placement: 'bottom-right',
    offsetX: 4,
    offsetY: 4
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
  }
};
