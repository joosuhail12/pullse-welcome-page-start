
/**
 * Chat Widget Configuration Types
 */

export interface PreChatFormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface PreChatForm {
  contactFields: PreChatFormField[];
}

export interface ChatBranding {
  primaryColor?: string;
  fontFamily?: string;
  avatarUrl?: string;
  logoUrl?: string;
  showBrandingBar?: boolean;
  widgetTitle?: string;
}

export interface ChatColors {
  border?: string;
  primary?: string;
  background?: string;
  foreground?: string;
  userMessage?: string;
  agentMessage?: string;
  inputBackground?: string;
  userMessageText?: string;
  agentMessageText?: string;
  primaryForeground?: string;
  primaryColor?: string;
};

export interface ChatLabels {
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  askQuestionButtonText?: string;
  welcomeMessage?: string;
};

// Update the ChatPosition type to include both string literals and object type
export type ChatLayout = {
  placement: 'left' | 'right';
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

export interface ChatBrandAssets {
  headerLogo?: string;
  launcherIcon?: string;
  avatarUrl?: string;
}

export interface ChatInterfaceSettings {
  showBrandingBar?: boolean;
  showAgentPresence?: boolean;
  showTicketStatusBar?: boolean;
  enableMessageReaction?: boolean;
  allowVisitorsToEndChat?: boolean;
  enableConversationRating?: boolean;
  enableDeliveryReadReceipts?: boolean;
  showAgentChatStatus?: boolean;
  showOfficeHours
}

export interface ChatWidgetConfig {
  workspaceId: string;
  widgetfield: PreChatForm;
  brandAssets?: ChatBrandAssets;
  colors?: ChatColors;
  labels?: ChatLabels;
  layout?: ChatLayout;
  features?: ChatFeatures;
  interfaceSettings?: ChatInterfaceSettings;
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
  colors: {
    border: '#E1E1E1',
    primary: '#9b87f5',
    background: '#FFFFFF',
    foreground: '#1A1F2C',
    userMessage: '#9b87f5',
    agentMessage: '#F1F1F1',
    inputBackground: '#F9F9F9',
    userMessageText: '#FFFFFF',
    agentMessageText: '#1A1F2C',
    primaryForeground: '#FFFFFF'
  },
  labels: {
    welcomeTitle: 'hello',
    welcomeSubtitle: 'welcomeSubtitle'
  },
  layout: {
    placement: 'right',
    offsetX: 20,
    offsetY: 20
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
