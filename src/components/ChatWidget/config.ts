
import { AgentStatus } from "./types";

export interface ChatWidgetConfig {
  branding?: {
    primaryColor?: string;
    widgetTitle?: string;
    avatarUrl?: string;
    logoUrl?: string;
    welcomeMessage?: string;
    showBrandingBar?: boolean;
  };
  position?: {
    placement: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    offsetX?: number;
    offsetY?: number;
  };
  features?: {
    searchMessages?: boolean;
    fileUploads?: boolean;
    messageReactions?: boolean;
    readReceipts?: boolean;
    typing?: boolean;
  };
  preChatForm?: {
    enabled: boolean;
    requiredFields: string[];
    optionalFields?: string[];
    title?: string;
    subtitle?: string;
  };
}

export const defaultConfig: ChatWidgetConfig = {
  branding: {
    primaryColor: '#8B5CF6',
    widgetTitle: 'Support Chat',
    showBrandingBar: true
  },
  position: {
    placement: 'bottom-right',
    offsetX: 20,
    offsetY: 20
  },
  features: {
    searchMessages: true,
    fileUploads: true,
    messageReactions: false,
    readReceipts: true,
    typing: true
  }
};
