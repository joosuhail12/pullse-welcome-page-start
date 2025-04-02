
/**
 * Chat Widget API Service
 * Provides methods to interact with the chat widget API
 */
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getChatSessionId, setChatSessionId } from '../utils/cookies';

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
    
    // Check if we have a session ID
    const sessionId = getChatSessionId();
    let url = `/api/chat-widget/config?workspaceId=${workspaceId}`;
    
    // Append session ID if available
    if (sessionId) {
      url += `&sessionId=${sessionId}`;
    }
    
    const response = await fetch(url);
    
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
    
    // Check if response contains a sessionId and store it
    if (config.sessionId && !sessionId) {
      setChatSessionId(config.sessionId);
    }
    
    return { ...config, workspaceId };
  } catch (error) {
    // If fetch fails, fall back to default config
    console.error('Error fetching chat widget config:', error);
    return { ...defaultConfig, workspaceId };
  }
};

/**
 * Send a message to the chat API
 * @param message The message to send
 * @param workspaceId The workspace ID
 * @returns Promise resolving to the API response
 */
export const sendChatMessage = async (message: string, workspaceId: string): Promise<any> => {
  try {
    const sessionId = getChatSessionId();
    const payload = {
      message,
      workspaceId,
      sessionId
    };
    
    const response = await fetch('/api/chat-widget/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Store session ID from response if available
    if (data.sessionId && !sessionId) {
      setChatSessionId(data.sessionId);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
