
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
  // New branding options
  logoUrl?: string;
  backgroundGradient?: string;
  headerGradient?: string;
  buttonStyle?: 'solid' | 'outline' | 'ghost';
  borderRadius?: 'sm' | 'md' | 'lg' | 'full';
  widgetPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  widgetSize?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
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
  quickPrompts?: boolean;  // New feature flag for quick prompts
  welcomeScreen?: boolean;
  offlineSupport?: boolean;
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
  | 'quickPrompt:selected';  // New event type for quick prompts

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export interface ChatWidgetConfig {
  workspaceId: string;
  welcomeMessage: string;
  // New welcome content options
  welcomeDescription?: string;
  welcomeImageUrl?: string;
  quickPrompts?: string[];
  preChatForm: PreChatForm;
  branding?: ChatBranding;
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
  welcomeDescription: 'Get help, ask questions, or start a conversation with our support team.',
  quickPrompts: [
    'How do I reset my password?',
    'What are your business hours?',
    'Can I get a refund?'
  ],
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
    theme: 'light',
    borderRadius: 'md',
    widgetPosition: 'bottom-right',
    widgetSize: 'md',
    buttonStyle: 'solid'
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
    searchMessages: true,
    quickPrompts: true,
    welcomeScreen: true,
    offlineSupport: true
  },
  realtime: {
    enabled: false,
    // Using auth endpoint instead of direct API key
    authEndpoint: '/api/chat-widget/token'
  }
};

