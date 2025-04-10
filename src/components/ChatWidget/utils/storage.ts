// Add this to your existing storage.ts file

/**
 * Gets the workspace ID and API key from localStorage
 */
export function getWorkspaceIdAndApiKey() {
  try {
    return {
      workspaceId: localStorage.getItem('pullse_workspace_id') || '',
      apiKey: localStorage.getItem('pullse_api_key') || '85c7756b-f333-4ec9-a440-c4d1850482c3'
    };
  } catch (e) {
    console.error('Error getting workspace ID and API key from localStorage', e);
    return { workspaceId: '', apiKey: '85c7756b-f333-4ec9-a440-c4d1850482c3' };
  }
}

/**
 * Sets the workspace ID and API key in localStorage
 */
export function setWorkspaceIdAndApiKey(workspaceId: string, apiKey: string) {
  try {
    localStorage.setItem('pullse_workspace_id', workspaceId);
    localStorage.setItem('pullse_api_key', apiKey);
  } catch (e) {
    console.error('Error setting workspace ID and API key in localStorage', e);
  }
}

/**
 * Gets the access token from localStorage
 */
export function getAccessToken() {
  try {
    return localStorage.getItem('pullse_access_token') || '';
  } catch (e) {
    console.error('Error getting access token from localStorage', e);
    return '';
  }
}

/**
 * Sets the access token in localStorage
 */
export function setAccessToken(token: string) {
  try {
    localStorage.setItem('pullse_access_token', token);
  } catch (e) {
    console.error('Error setting access token in localStorage', e);
  }
}

/**
 * Sets contact details in localStorage
 */
export function setContactDetailsInLocalStorage(contactDetails: any) {
  try {
    localStorage.setItem('pullse_contact_details', JSON.stringify(contactDetails));
  } catch (e) {
    console.error('Error setting contact details in localStorage', e);
  }
}

/**
 * Gets contact details from localStorage
 */
export function getContactDetailsFromLocalStorage() {
  try {
    const contactDetails = localStorage.getItem('pullse_contact_details');
    return contactDetails ? JSON.parse(contactDetails) : null;
  } catch (e) {
    console.error('Error getting contact details from localStorage', e);
    return null;
  }
}

/**
 * Checks if the user is logged in based on contact details in localStorage
 */
export function isUserLoggedIn() {
  return !!getContactDetailsFromLocalStorage();
}

/**
 * Sets form data in localStorage
 */
export function setUserFormDataInLocalStorage(formData: Record<string, string>) {
  try {
    localStorage.setItem('pullse_user_form_data', JSON.stringify(formData));
  } catch (e) {
    console.error('Error setting user form data in localStorage', e);
  }
}

/**
 * Gets form data from localStorage
 */
export function getUserFormDataFromLocalStorage() {
  try {
    const formData = localStorage.getItem('pullse_user_form_data');
    return formData ? JSON.parse(formData) : null;
  } catch (e) {
    console.error('Error getting user form data from localStorage', e);
    return null;
  }
}

/**
 * Save conversation to local storage
 * @param conversation The conversation to save
 */
export function saveConversationToStorage(conversation: any) {
  try {
    let conversations = loadConversationsFromStorage() || [];
    // Check if the conversation already exists
    const existingIndex = conversations.findIndex((c: any) => c.id === conversation.id);

    if (existingIndex !== -1) {
      // Update existing conversation
      conversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      conversations.push(conversation);
    }

    localStorage.setItem('pullse_conversations', JSON.stringify(conversations));
  } catch (e) {
    console.error('Error saving conversation to localStorage', e);
  }
}

/**
 * Load conversations from local storage
 * @returns Array of conversations or null if an error occurs
 */
export function loadConversationsFromStorage() {
  try {
    const conversations = localStorage.getItem('pullse_conversations');
    return conversations ? JSON.parse(conversations) : [];
  } catch (e) {
    console.error('Error loading conversations from localStorage', e);
    return null;
  }
}

/**
 * Clear conversations from local storage
 */
export function clearConversationsFromStorage() {
  try {
    localStorage.removeItem('pullse_conversations');
  } catch (e) {
    console.error('Error clearing conversations from localStorage', e);
  }
}
