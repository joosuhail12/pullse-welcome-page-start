
/**
 * Local storage utilities for the Chat Widget
 */
import { Conversation } from '../types';
import { getChatSessionId } from './cookies';
import { encryptData, decryptData } from './security';

const STORAGE_KEY = 'chat_widget_conversations';
const MAX_STORED_CONVERSATIONS = 30;
const MAX_CONVERSATION_AGE_DAYS = 30; // Retention period in days
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500; // milliseconds

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(operation: () => T, maxRetries = MAX_RETRY_ATTEMPTS): Promise<T> {
  let lastError: Error | null = null;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      return operation();
    } catch (error) {
      lastError = error as Error;
      retryCount++;
      
      if (retryCount >= maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = RETRY_DELAY * Math.pow(2, retryCount - 1) * (0.9 + Math.random() * 0.2);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Load all conversations from localStorage with decryption
 */
export function loadConversationsFromStorage(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    
    // Decrypt the data
    const decryptedData = decryptData(data);
    if (!decryptedData) {
      return [];
    }
    
    const parsedData = JSON.parse(decryptedData);
    const conversations = Array.isArray(parsedData) ? parsedData : [];
    
    // Fix timestamp format (convert string to Date)
    const formattedConversations = conversations.map(conversation => ({
      ...conversation,
      timestamp: new Date(conversation.timestamp),
      messages: conversation.messages?.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
    
    // Apply retention policy - filter out old conversations
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - MAX_CONVERSATION_AGE_DAYS);
    
    return formattedConversations.filter(conv => 
      new Date(conv.timestamp) > retentionDate
    );
  } catch (error) {
    console.error('Error loading conversations from storage', error);
    throw new Error('Failed to load conversations from storage');
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversationFromStorage(conversationId: string): Conversation | null {
  try {
    const conversations = loadConversationsFromStorage();
    return conversations.find(c => c.id === conversationId) || null;
  } catch (error) {
    console.error('Error getting conversation from storage', error);
    throw new Error('Failed to get conversation from storage');
  }
}

/**
 * Get conversations for the current session
 */
export function getSessionConversations(): Conversation[] {
  const sessionId = getChatSessionId();
  if (!sessionId) return [];
  
  try {
    const conversations = loadConversationsFromStorage();
    return conversations.filter(conversation => conversation.sessionId === sessionId);
  } catch (error) {
    console.error('Error getting session conversations', error);
    throw new Error('Failed to get session conversations');
  }
}

/**
 * Save a conversation to localStorage with encryption
 * Returns a Promise to allow for async handling
 */
export async function saveConversationToStorage(conversation: Conversation): Promise<void> {
  return withRetry(() => {
    try {
      // Add sessionId if not present
      const sessionId = getChatSessionId();
      const conversationWithSession = {
        ...conversation,
        sessionId: sessionId
      };
      
      // Get existing conversations
      let conversations = loadConversationsFromStorage();
      
      // Find if this conversation already exists
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        conversations[existingIndex] = conversationWithSession;
      } else {
        // Add new conversation to the beginning of the array
        conversations = [conversationWithSession, ...conversations];
        
        // Limit the number of stored conversations
        if (conversations.length > MAX_STORED_CONVERSATIONS) {
          conversations = conversations.slice(0, MAX_STORED_CONVERSATIONS);
        }
      }
      
      // Apply retention policy
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - MAX_CONVERSATION_AGE_DAYS);
      conversations = conversations.filter(conv => 
        new Date(conv.timestamp) > retentionDate
      );
      
      // Encrypt data before storing
      const encryptedData = encryptData(JSON.stringify(conversations));
      localStorage.setItem(STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving conversation to storage', error);
      throw new Error('Failed to save conversation to storage');
    }
  });
}

/**
 * Delete a conversation from localStorage
 * Returns a Promise to allow for async handling
 */
export async function deleteConversationFromStorage(conversationId: string): Promise<void> {
  return withRetry(() => {
    try {
      const conversations = loadConversationsFromStorage();
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      
      // Encrypt data before storing
      const encryptedData = encryptData(JSON.stringify(updatedConversations));
      localStorage.setItem(STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('Error deleting conversation from storage', error);
      throw new Error('Failed to delete conversation from storage');
    }
  });
}

/**
 * Clear all conversations from localStorage
 * Returns a Promise to allow for async handling
 */
export async function clearConversationsFromStorage(): Promise<void> {
  return withRetry(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversations from storage', error);
      throw new Error('Failed to clear conversations from storage');
    }
  });
}
