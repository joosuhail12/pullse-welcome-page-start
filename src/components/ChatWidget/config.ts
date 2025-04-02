
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
}

export interface ChatFeatures {
  fileUpload?: boolean;
  messageRating?: boolean;
  readReceipts?: boolean;
  quickReplies?: boolean;
  cards?: boolean;
  chatSuggestions?: boolean;
}

export interface ChatRealtime {
  enabled: boolean;
  ablyApiKey?: string;
}

export type ChatEventType = 
  | 'chat:open'
  | 'chat:close'
  | 'chat:messageSent'
  | 'chat:messageReceived'
  | 'contact:initiatedChat'
  | 'contact:formCompleted';

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
  features: {
    fileUpload: true,
    messageRating: false,
    readReceipts: false,
    quickReplies: true,
    cards: true,
    chatSuggestions: false
  },
  realtime: {
    enabled: false
  }
};
