
/**
 * Pullse Chat Widget Embed Script
 * 
 * This script allows embedding the Pullse chat widget on any website
 * with customizable configuration options.
 */

import { PullseChatWidgetLoader, initializeWidget } from './embed/widget-loader';
import { PullseChatWidgetOptions, EventCallback } from './embed/types';
import { ChatEventType, ChatEventPayload } from './config';
import { WIDGET_VERSION, checkForUpdates } from './embed/api';
import { getEventManager, EventPriority, dispatchValidatedEvent } from './embed/enhancedEvents';
import { validateEventPayload } from './utils/eventValidation';
import { isTestMode, setTestMode } from './utils/testMode';

// Create global Pullse object
(window as any).Pullse = (window as any).Pullse || {};
(window as any).Pullse.initChatWidget = (options: PullseChatWidgetOptions) => {
  // Check for test mode flag
  if (options.testMode) {
    setTestMode(true);
    console.info('[Pullse] Running in test mode');
  }
  return initializeWidget(options);
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

// Add enhanced event API to global Pullse object
(window as any).Pullse.on = (eventType: ChatEventType | 'all', callback: EventCallback, options?: { priority?: boolean }) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return () => {};
  }
  
  // Use the new event system
  return getEventManager().on(eventType, (event: ChatEventPayload) => {
    // Validate event before passing to callback
    if (validateEventPayload(event)) {
      callback(event);
    } else {
      console.warn('Invalid event payload detected and blocked:', event);
    }
  });
};

(window as any).Pullse.off = (eventType: ChatEventType | 'all', callback?: EventCallback) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return;
  }
  getEventManager().off(eventType, callback);
};

// Add function to dispatch validated events
(window as any).Pullse.dispatchEvent = (eventType: ChatEventType, data?: any, priority?: EventPriority) => {
  if (!(window as any).__PULLSE_CHAT_INSTANCE__) {
    console.error('Pullse Chat Widget not initialized');
    return null;
  }
  return dispatchValidatedEvent(eventType, data, priority);
};

// Export for ESM environments
export default PullseChatWidgetLoader;
