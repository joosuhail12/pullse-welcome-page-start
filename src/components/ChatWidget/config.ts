// Add isLoggedIn to the ChatWidgetConfig interface
export interface ChatWidgetConfig {
  workspaceId: string;
  colors?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    userMessageBackgroundColor?: string;
    agentMessageBackgroundColor?: string;
  };
  layout?: {
    position?: string;
    xOffset?: string;
    yOffset?: string;
    isCompact?: boolean;
    placement?: string;
    offsetX?: number;
    offsetY?: number;
  };
  labels?: {
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    askQuestionButtonText?: string;
    welcomeMessage?: string;
  };
  brandAssets?: {
    headerLogo?: string;
    launcherIcon?: string;
  };
  widgetSettings?: {
    allowedDomains?: string[];
  };
  interfaceSettings?: {
    showBrandingBar?: boolean;
    showOfficeHours?: boolean;
    showAgentPresence?: boolean;
    showAgentChatStatus?: boolean;
    showTicketStatusBar?: boolean;
    enableMessageReaction?: boolean;
    allowVisitorsToEndChat?: boolean;
    enableConversationRating?: boolean;
    enableDeliveryReadReceipts?: boolean;
  };
  widgetfield?: {
    id?: string;
    widgetId?: string;
    contactFields?: PreChatFormField[];
    companyFields?: PreChatFormField[];
    customDataFields?: PreChatFormField[];
    customObjectFields?: any[];
  };
  isLoggedIn?: boolean;
}

// Keep all existing interfaces and constants
export interface PreChatFormField {
  type: string;
  label: string;
  options: any[];
  required: boolean;
  columnname: string;
  entityname: string;
  placeholder?: string;
}

export interface ChatEventPayload {
  type: ChatEventType;
  timestamp: Date;
  data?: any;
}

export type ChatEventType =
  | 'chat:open'
  | 'chat:close'
  | 'chat:start'
  | 'chat:end'
  | 'chat:minimize'
  | 'chat:restore'
  | 'message:sent'
  | 'message:received'
  | 'message:read'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:end'
  | 'contact:formCompleted'
  | 'error'
  | 'status:online'
  | 'status:offline'
  | 'status:away'
  | 'custom';

export const defaultConfig: ChatWidgetConfig = {
  workspaceId: 'demo-workspace-123',
  colors: {
    primaryColor: '#6366F1',
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    userMessageBackgroundColor: '#EEF2FF',
    agentMessageBackgroundColor: '#F3F4F6',
  },
  layout: {
    position: 'bottom-right',
    xOffset: '20px',
    yOffset: '20px',
    isCompact: false
  },
  labels: {
    welcomeTitle: 'Welcome to Support',
    welcomeSubtitle: 'How can we help you today?',
    askQuestionButtonText: 'Ask a Question',
    welcomeMessage: 'Hi there! How can we help you today?'
  },
  widgetfield: {
    contactFields: [
      {
        type: 'text',
        label: 'Name',
        options: [],
        required: true,
        columnname: 'name',
        entityname: 'contact',
        placeholder: 'Your name'
      },
      {
        type: 'email',
        label: 'Email',
        options: [],
        required: true,
        columnname: 'email',
        entityname: 'contact',
        placeholder: 'Your email address'
      }
    ],
    companyFields: [],
    customDataFields: []
  },
  isLoggedIn: false
};
