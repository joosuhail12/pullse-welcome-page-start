export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export type ChatBranding = 'light' | 'dark' | 'hidden';

export type ChatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface ChatLayout {
  placement: 'left' | 'right';
  offsetX: number;
  offsetY: number;
  isCompact?: boolean;
}

export interface ChatColors {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  userMessageBackgroundColor: string;
  agentMessageBackgroundColor: string;
}

export interface ChatLabels {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeSubtitle: string;
  askQuestionButtonText: string;
}

export interface BrandAssets {
  headerLogo?: string;
  avatarUrl?: string;
  launcherIcon?: string;
}

export interface WidgetSettings {
  allowedDomains: string[];
}

export interface InterfaceSettings {
  showBrandingBar: boolean;
  showOfficeHours: boolean;
  showAgentPresence: boolean;
  showAgentChatStatus: boolean;
  showTicketStatusBar: boolean;
  enableMessageReaction: boolean;
  allowVisitorsToEndChat: boolean;
  enableConversationRating: boolean;
  enableDeliveryReadReceipts: boolean;
}

export interface Features {
  fileUploads?: boolean;
  webhooks?: boolean;
  customForms?: boolean;
  searchMessages?: boolean;
  messageReactions?: boolean;
  richContent?: boolean;
  attachments?: boolean;
  qrSupport?: boolean;
  cardMessages?: boolean;
}

// Types for form fields
export interface PreChatFormField {
  entityname: string;
  columnname: string;
  label: string;
  type?: string;
  placeholder?: string;
  required: boolean;
  options?: string[] | null;
  position: number;
}

export interface WidgetField {
  fields: PreChatFormField[];
}

export interface ChatWidgetConfig {
  workspaceId: string;
  welcomeMessage: string;
  colors?: ChatColors;
  labels?: ChatLabels;
  layout?: ChatLayout;
  brandAssets?: BrandAssets;
  widgetSettings?: WidgetSettings;
  interfaceSettings?: InterfaceSettings;
  features?: Features;
  officeHours?: {
    enabled: boolean;
    timezone: string;
    message: string;
    schedule: Record<string, { open: string; close: string }>;
  };
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
  lazyLoadScroll?: boolean;
  scrollThreshold?: number;
  contact?: any;
  widgetfield?: WidgetField;
  sessionId?: string;
  realtime?: boolean; // Add realtime flag for backward compatibility
}

export type ChatEventType =
  | 'chat:loaded'
  | 'chat:opened'
  | 'chat:closed'
  | 'chat:minimized'
  | 'chat:maximized'
  | 'chat:error'
  | 'chat:ready'
  | 'message:sent'
  | 'message:received'
  | 'message:read'
  | 'message:delivered'
  | 'message:reaction'
  | 'file:upload'
  | 'contact:formCompleted'
  | 'chat:ended'
  | 'agent:typing'
  | 'agent:status'
  | 'web:pageView'
  | 'rating:submitted';

export const defaultConfig: ChatWidgetConfig = {
  workspaceId: '',
  welcomeMessage: 'Hello! How can we help you today?',
  colors: {
    primaryColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    textColor: '#374151',
    userMessageBackgroundColor: '#ECFDF5',
    agentMessageBackgroundColor: '#F9FAFB'
  },
  labels: {
    welcomeTitle: 'Welcome to Support',
    welcomeMessage: 'Hello! How can we help you today?',
    welcomeSubtitle: 'We typically reply within a few minutes',
    askQuestionButtonText: 'Ask a question'
  },
  layout: {
    placement: 'right',
    offsetX: 20,
    offsetY: 20,
    isCompact: false
  },
  brandAssets: {
    headerLogo: '',
    avatarUrl: '',
    launcherIcon: ''
  },
  widgetSettings: {
    allowedDomains: ['*']
  },
  interfaceSettings: {
    showBrandingBar: true,
    showOfficeHours: false,
    showAgentPresence: true,
    showAgentChatStatus: true,
    showTicketStatusBar: false,
    enableMessageReaction: true,
    allowVisitorsToEndChat: true,
    enableConversationRating: true,
    enableDeliveryReadReceipts: true
  },
  features: {
    fileUploads: true,
    webhooks: true,
    customForms: false,
    searchMessages: true,
    messageReactions: true,
    richContent: true,
    attachments: true,
    qrSupport: true,
    cardMessages: true
  },
  officeHours: {
    enabled: false,
    timezone: 'America/New_York',
    message: 'We are currently outside of our office hours. We will get back to you as soon as possible.',
    schedule: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    }
  },
  realtime: true, // Add realtime flag for existing code
  widgetfield: {
    fields: [
      {
        entityname: 'contact',
        columnname: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        required: true,
        position: 1
      }
    ]
  }
};
