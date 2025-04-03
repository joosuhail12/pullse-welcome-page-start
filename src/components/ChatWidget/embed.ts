
/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { PullseChatWidgetLoader } from './embed/widget-loader';
import { PullseChatWidgetOptions, EventCallback } from './embed/types';
import { ChatEventType, ChatEventPayload } from './config';
import { WIDGET_VERSION, checkForUpdates } from './embed/api';

// Create global Pullse object
(window as any).Pullse = (window as any).Pullse || {};
(window as any).Pullse.initChatWidget = (options: PullseChatWidgetOptions) => {
  return new PullseChatWidgetLoader(options);
};

// Add version information
(window as any).Pullse.version = WIDGET_VERSION;

// Add update check functionality
(window as any).Pullse.checkForUpdates = async () => {
  const updateInfo = await checkForUpdates();
  if (updateInfo.hasUpdate) {
    console.info(`[Pullse] A new version is available: ${updateInfo.latestVersion}`);
    if (updateInfo.releaseNotes) {
      console.info(`[Pullse] Release notes: ${updateInfo.releaseNotes}`);
    }
  } else if (!updateInfo.error) {
    console.info(`[Pullse] You are using the latest version: ${updateInfo.currentVersion}`);
  }
  return updateInfo;
};

// Add event API to global Pullse object
(window as any).Pullse.on = (eventType: ChatEventType | 'all', callback: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return () => {};
  }
  return (window as any).__PULLSE_CHAT_INSTANCE__.on(eventType, callback);
};

(window as any).Pullse.off = (eventType: ChatEventType | 'all', callback?: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return;
  }
  (window as any).__PULLSE_CHAT_INSTANCE__.off(eventType, callback);
};

// Export for ESM environments
export default PullseChatWidgetLoader;
