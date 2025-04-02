
/**
 * Chat Widget API Service
 * Provides methods to interact with the chat widget API
 */
import { ChatWidgetConfig, defaultConfig } from '../config';

/**
 * Fetch chat widget configuration from the API
 * @param workspaceId The workspace ID to fetch configuration for
 * @returns Promise resolving to the chat widget configuration
 */
export const fetchChatWidgetConfig = async (workspaceId: string): Promise<ChatWidgetConfig> => {
  try {
    const response = await fetch(`/api/chat-widget/config?workspaceId=${workspaceId}`);
    
    if (!response.ok) {
      // If we get an error response, fall back to default config
      console.error('Failed to fetch chat widget config:', response.statusText);
      return defaultConfig;
    }
    
    const config = await response.json();
    return config;
  } catch (error) {
    // If fetch fails, fall back to default config
    console.error('Error fetching chat widget config:', error);
    return defaultConfig;
  }
};
