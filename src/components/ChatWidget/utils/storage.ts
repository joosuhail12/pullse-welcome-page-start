
/**
 * Utility functions for managing storage and cookies
 */

/**
 * Get workspace id and api key from localStorage
 */
export function getWorkspaceIdAndApiKey(): { workspaceId: string | null; apiKey: string | null } {
  try {
    const workspaceId = localStorage.getItem('pullse_workspace_id');
    const apiKey = localStorage.getItem('pullse_api_key');
    return { workspaceId, apiKey };
  } catch (error) {
    console.error('Error getting workspace id and api key from localStorage:', error);
    return { workspaceId: null, apiKey: null };
  }
}

/**
 * Set workspace id and api key in localStorage
 */
export function setWorkspaceIdAndApiKey(workspaceId: string, apiKey: string): void {
  try {
    localStorage.setItem('pullse_workspace_id', workspaceId);
    localStorage.setItem('pullse_api_key', apiKey);
  } catch (error) {
    console.error('Error setting workspace id and api key in localStorage:', error);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem('pullse_access_token');
  } catch (error) {
    console.error('Error getting access token from localStorage:', error);
    return null;
  }
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(accessToken: string): void {
  try {
    localStorage.setItem('pullse_access_token', accessToken);
  } catch (error) {
    console.error('Error setting access token in localStorage:', error);
  }
}

/**
 * Get chat session id from cookies
 */
export function getChatSessionId(): string | null {
  const name = 'pullse_chat_session_id=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

/**
 * Set chat session id in cookies
 */
export function setChatSessionId(sessionId: string): void {
  document.cookie = `pullse_chat_session_id=${sessionId};path=/`;
}

/**
 * Save conversation to localStorage
 */
export function saveConversationToStorage(conversation: any): void {
  try {
    const conversations = JSON.parse(localStorage.getItem('pullse_conversations') || '[]');
    
    // Check if conversation already exists
    const existingIndex = conversations.findIndex((c: any) => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      // Update existing conversation
      conversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      conversations.push(conversation);
    }
    
    localStorage.setItem('pullse_conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
  }
}

/**
 * Load conversations from localStorage
 */
export function loadConversationsFromStorage(): any[] {
  try {
    const conversations = localStorage.getItem('pullse_conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
    return [];
  }
}

/**
 * Mark a conversation as read
 */
export function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    // Get all conversations from storage
    const conversations = JSON.parse(localStorage.getItem('pullse_conversations') || '[]');
    
    // Find the conversation with the matching ID and update it
    const updatedConversations = conversations.map((conv: any) => {
      if (conv.id === conversationId) {
        return { ...conv, unread: false };
      }
      return conv;
    });
    
    // Save the updated conversations back to storage
    localStorage.setItem('pullse_conversations', JSON.stringify(updatedConversations));
    
    // For future API integration
    return Promise.resolve();
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return Promise.reject(error);
  }
}

/**
 * Clear all data from localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem('pullse_workspace_id');
    localStorage.removeItem('pullse_api_key');
    localStorage.removeItem('pullse_access_token');
    localStorage.removeItem('pullse_conversations');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get user form data from localStorage
 */
export function getUserFormDataFromLocalStorage(): Record<string, string> | undefined {
  try {
    const formData = localStorage.getItem('pullse_user_form_data');
    if (formData) {
      return JSON.parse(formData);
    }
    return undefined;
  } catch (error) {
    console.error('Error getting user form data from localStorage:', error);
    return undefined;
  }
}

/**
 * Store user form data in localStorage
 */
export function setUserFormDataInLocalStorage(formData: Record<string, string>): void {
  try {
    localStorage.setItem('pullse_user_form_data', JSON.stringify(formData));
  } catch (error) {
    console.error('Error setting user form data in localStorage:', error);
  }
}

/**
 * Check if user is authenticated by checking if form data exists
 */
export function isUserAuthenticated(): boolean {
  return getUserFormDataFromLocalStorage() !== undefined;
}
