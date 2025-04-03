
import { ChatEventType, ChatEventPayload } from '../config';
import { ChatPositionString } from '../types';

/**
 * Configuration options for the Pullse Chat Widget
 */
export interface PullseChatWidgetOptions {
  workspaceId: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: ChatPositionString;
  offsetX?: number;
  offsetY?: number;
  hideBranding?: boolean;
  autoOpen?: boolean;
  logoUrl?: string;
  avatarUrl?: string;
  widgetTitle?: string;
  onEvent?: (event: ChatEventPayload) => void;
  eventHandlers?: {
    [key in ChatEventType]?: (payload: ChatEventPayload) => void;
  };
  lazyLoadScroll?: boolean;
  scrollThreshold?: number;
}

export type EventCallback = (payload: ChatEventPayload) => void;
