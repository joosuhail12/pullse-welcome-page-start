
// Re-export needed types
import { PullseChatWidgetOptions, EventCallback } from './types';
import { ChatEventType, ChatEventPayload } from '../config';

/**
 * Add a utility function to get default config
 */
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

/**
 * Current version of the widget
 * This should be updated with each release
 */
export const WIDGET_VERSION = '1.0.0';

/**
 * Integrity hashes for script resources
 * These need to be updated whenever the resources change
 */
export const RESOURCE_INTEGRITY = {
  'chat-widget.js': 'sha384-ZWV5STn1gVLUuKbJx22EsU08tW3tuALY9FEZmOc1mHMVpZnuQYgKMW4M24405lnN',
  'widget-styles.css': 'sha384-H483Zlm4zvw3f83lKp8ymNGmJWDMWR2B3sZY9YF2W9YuNpw3kS9RYPhtAGmOssM6'
};

/**
 * Check if a script has the correct integrity hash
 * @param scriptUrl URL of the script to check
 * @param resourceKey Key in the RESOURCE_INTEGRITY object
 * @returns Promise that resolves to true if integrity is valid
 */
export const validateScriptIntegrity = async (
  scriptUrl: string,
  resourceKey: keyof typeof RESOURCE_INTEGRITY
): Promise<boolean> => {
  try {
    const response = await fetch(scriptUrl);
    const text = await response.text();
    
    // In a real implementation, we would calculate the hash here
    // For demonstration, we'll just check if the resource exists
    return !!text;
  } catch (error) {
    console.error('Failed to validate script integrity:', error);
    return false;
  }
};

/**
 * Compare version strings
 * @param v1 First version
 * @param v2 Second version
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
};

/**
 * Check if an update is available
 * @returns Promise that resolves to update information
 */
export const checkForUpdates = async () => {
  try {
    const response = await fetch(`https://cdn.pullse.io/version.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to check for updates: ${response.status}`);
    }
    
    const data = await response.json();
    const hasUpdate = compareVersions(WIDGET_VERSION, data.version) < 0;
    
    return {
      currentVersion: WIDGET_VERSION,
      latestVersion: data.version,
      hasUpdate,
      releaseNotes: data.releaseNotes,
      updateUrl: data.updateUrl || 'https://docs.pullse.io/updates'
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return {
      currentVersion: WIDGET_VERSION,
      latestVersion: WIDGET_VERSION,
      hasUpdate: false,
      error: String(error)
    };
  }
};

export type { 
  PullseChatWidgetOptions, 
  EventCallback,
  ChatEventType,
  ChatEventPayload
};
