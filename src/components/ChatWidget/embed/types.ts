
/**
 * Type definitions for the Pullse Chat Widget embed script
 */

import { ChatEventPayload, ChatEventType } from '../config';

export type EventCallback = (event: ChatEventPayload) => void;

export interface PullseChatWidgetOptions {
  workspaceId: string;
  welcomeMessage?: string;
  primaryColor?: string;
  logoUrl?: string;
  avatarUrl?: string;
  widgetTitle?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offsetX?: number;
  offsetY?: number;
  hideBranding?: boolean;
  autoOpen?: boolean;
  onEvent?: EventCallback;
  eventHandlers?: {
    [key in ChatEventType]?: EventCallback;
  };
  lazyLoadScroll?: boolean;
  scrollThreshold?: number;
  testMode?: boolean; // New option for test mode
}

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseNotes?: string;
  updateUrl?: string;
  error?: string;
}
