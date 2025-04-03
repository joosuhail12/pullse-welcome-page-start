
// Re-export needed types
import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType, ChatEventPayload } from '../config';

// Add a utility function to get default config
export const getDefaultConfig = (workspaceId: string) => {
  return {
    workspaceId,
    welcomeMessage: 'How can I help you today?',
    branding: {
      primaryColor: '#6366f1',
      showBrandingBar: true
    },
    position: {
      placement: 'bottom-right',
      offsetX: 4,
      offsetY: 4
    }
  };
};

export type { 
  PullseChatWidgetOptions, 
  EventCallback,
  ChatEventType,
  ChatEventPayload
};
