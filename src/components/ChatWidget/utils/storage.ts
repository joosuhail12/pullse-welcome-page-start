
/**
 * Local storage utilities for the Chat Widget
 */
import { Conversation, Message } from '../types';
import { getChatSessionId } from './cookies';
import { encryptData, decryptData } from './security';

const STORAGE_KEY = 'chat_widget_conversations';
const OFFLINE_MESSAGES_KEY = 'chat_widget_offline_messages';
const MAX_STORED_CONVERSATIONS = 30;
const MAX_CONVERSATION_AGE_DAYS = 30; // Retention period in days

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
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversationFromStorage(conversationId: string): Conversation | null {
  const conversations = loadConversationsFromStorage();
  return conversations.find(c => c.id === conversationId) || null;
}

/**
 * Get conversations for the current session
 */
export function getSessionConversations(): Conversation[] {
  const sessionId = getChatSessionId();
  if (!sessionId) return [];
  
  const conversations = loadConversationsFromStorage();
  return conversations.filter(conversation => conversation.sessionId === sessionId);
}

/**
 * Save a conversation to localStorage with encryption
 */
export function saveConversationToStorage(conversation: Conversation): void {
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
  }
}

/**
 * Delete a conversation from localStorage
 */
export function deleteConversationFromStorage(conversationId: string): void {
  try {
    const conversations = loadConversationsFromStorage();
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    
    // Encrypt data before storing
    const encryptedData = encryptData(JSON.stringify(updatedConversations));
    localStorage.setItem(STORAGE_KEY, encryptedData);
  } catch (error) {
    console.error('Error deleting conversation from storage', error);
  }
}

/**
 * Clear all conversations from localStorage
 */
export function clearConversationsFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing conversations from storage', error);
  }
}

/**
 * Save offline message to persistent storage
 * This is separate from the offline queue to ensure messages persist across sessions
 */
export function saveOfflineMessage(conversationId: string, message: Message): void {
  try {
    let offlineMessages = getOfflineMessages();
    
    if (!offlineMessages[conversationId]) {
      offlineMessages[conversationId] = [];
    }
    
    // Add message
    offlineMessages[conversationId].push(message);
    
    // Save to localStorage
    const encryptedData = encryptData(JSON.stringify(offlineMessages));
    localStorage.setItem(OFFLINE_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Error saving offline message', error);
  }
}

/**
 * Get all offline messages
 */
export function getOfflineMessages(): Record<string, Message[]> {
  try {
    const data = localStorage.getItem(OFFLINE_MESSAGES_KEY);
    if (!data) {
      return {};
    }
    
    const decryptedData = decryptData(data);
    if (!decryptedData) {
      return {};
    }
    
    const parsedData = JSON.parse(decryptedData);
    
    // Convert string timestamps back to Date objects
    const result: Record<string, Message[]> = {};
    
    for (const [conversationId, messages] of Object.entries(parsedData)) {
      result[conversationId] = (messages as Message[]).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    
    return result;
  } catch (error) {
    console.error('Error loading offline messages', error);
    return {};
  }
}

/**
 * Mark offline messages as sent for a conversation
 */
export function markOfflineMessagesAsSent(conversationId: string): void {
  try {
    const offlineMessages = getOfflineMessages();
    
    if (offlineMessages[conversationId]) {
      delete offlineMessages[conversationId];
      
      // Save updated data
      const encryptedData = encryptData(JSON.stringify(offlineMessages));
      localStorage.setItem(OFFLINE_MESSAGES_KEY, encryptedData);
    }
  } catch (error) {
    console.error('Error marking offline messages as sent', error);
  }
}
