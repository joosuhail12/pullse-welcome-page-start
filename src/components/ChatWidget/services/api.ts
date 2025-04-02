
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
    // In development/demo mode, we'll just use default config
    // since the API may not be available or may return HTML instead of JSON
    if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
      console.log(`Using default config for workspace ${workspaceId} in development mode`);
      return {
        ...defaultConfig,
        workspaceId
      };
    }
    
    const response = await fetch(`/api/chat-widget/config?workspaceId=${workspaceId}`);
    
    if (!response.ok) {
      // If we get an error response, fall back to default config
      console.error('Failed to fetch chat widget config:', response.statusText);
      return { ...defaultConfig, workspaceId };
    }
    
    // Check content-type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response when fetching chat widget config');
      return { ...defaultConfig, workspaceId };
    }
    
    const config = await response.json();
    return { ...config, workspaceId };
  } catch (error) {
    // If fetch fails, fall back to default config
    console.error('Error fetching chat widget config:', error);
    return { ...defaultConfig, workspaceId };
  }
};
