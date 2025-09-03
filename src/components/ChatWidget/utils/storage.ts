
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
 * Get chat session id from localStorage
 */
export function getChatSessionId(): string | null {
  try {
    return localStorage.getItem('pullse_session_id');
  } catch (error) {
    console.error('Error getting session ID from localStorage:', error);
    return null;
  }
}

/**
 * Set chat session id in localStorage
 */
export function setChatSessionId(sessionId: string): void {
  try {
    localStorage.setItem('pullse_session_id', sessionId);
  } catch (error) {
    console.error('Error setting session ID in localStorage:', error);
  }
}


/* Store user contactId in localStorage */
export function setUserContactId(contactId: string): void {
  try {
    localStorage.setItem('pullse_user_contact_id', contactId);
  } catch (error) {
    console.error('Error setting user contact id in localStorage:', error);
  }
}

/* Get user contactId from localStorage */
export function getUserContactId(): string | null {
  try {
    return localStorage.getItem('pullse_user_contact_id');
  } catch (error) {
    console.error('Error getting user contact id from localStorage:', error);
    return null;
  }
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
 * Clear user form data from localStorage
 */
export function clearUserFormDataFromLocalStorage(): void {
  try {
    localStorage.removeItem('pullse_user_form_data');
  } catch (error) {
    console.error('Error clearing user form data from localStorage:', error);
  }
}

/**
 * Check if user is authenticated by checking if form data exists
 */
export function isUserAuthenticated(): boolean {
  return getUserFormDataFromLocalStorage() !== undefined;
}

export function removeAccessToken(): void {
  try {
    localStorage.removeItem('pullse_access_token');
  } catch (error) {
    console.error('Error removing access token from localStorage:', error);
  }
}

export function removeChatSessionId(): void {
  try {
    localStorage.removeItem('pullse_session_id');
  } catch (error) {
    console.error('Error removing chat session id from localStorage:', error);
  }
}