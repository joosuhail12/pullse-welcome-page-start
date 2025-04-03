
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

// Update the ChatPosition type to include both string literals and object type
export type ChatPosition = 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-right' 
  | 'top-left'
  | {
      placement: string;
      offsetX: number;
      offsetY: number;
    };

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
  | 'chat:connectionChange' // Add connection change event type
  | 'chat:error';          // Add error event type

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

// Add widget appearance configuration
export interface ChatAppearance {
  launcher?: {
    size?: 'small' | 'medium' | 'large';
  };
  dimensions?: {
    width?: number;
    height?: number;
  };
  shape?: 'rounded' | 'square' | 'pill' | 'soft';
}

// Add ChatWidgetViews type
export type ChatWidgetViews = 'home' | 'messages' | 'chat' | 'settings';

export interface ChatWidgetConfig {
  workspaceId: string;
  welcomeMessage: string;
  preChatForm: PreChatForm;
  branding?: ChatBranding;
  position?: ChatPosition;
  features?: ChatFeatures;
  realtime?: ChatRealtime;
  sessionId?: string;
  appearance?: ChatAppearance; // Add appearance property
  messages?: any[]; // Add messages property
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
  position: 'bottom-right',
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
  appearance: {
    launcher: {
      size: 'medium'
    },
    dimensions: {
      width: 380,
      height: 580
    },
    shape: 'rounded'
  },
  realtime: {
    enabled: false,
    // Using auth endpoint instead of direct API key
    authEndpoint: '/api/chat-widget/token'
  },
  messages: [] // Add default empty array
};
