
/**
 * Offline storage utilities for message drafts and offline functionality
 */
import { Message } from '../types';
import { encrypt, decrypt } from './security';

// Keys for storing data
const DRAFT_MESSAGES_KEY = 'chat_widget_draft_messages';
const PENDING_MESSAGES_KEY = 'chat_widget_pending_messages';

interface DraftMessage {
  conversationId: string;
  text: string;
  timestamp: Date;
}

interface PendingMessage {
  conversationId: string;
  message: Message;
  retryCount: number;
  lastAttempt: Date;
}

/**
 * Save a draft message to local storage
 */
export const saveDraftMessage = (conversationId: string, text: string): void => {
  try {
    if (!text || !conversationId) return;
    
    const draft: DraftMessage = {
      conversationId,
      text,
      timestamp: new Date()
    };
    
    // Get existing drafts
    const existingDrafts = getDraftMessages();
    
    // Update or add the draft
    const updatedDrafts = {
      ...existingDrafts,
      [conversationId]: draft
    };
    
    // Encrypt and store
    const encryptedData = encrypt(JSON.stringify(updatedDrafts));
    localStorage.setItem(DRAFT_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to save draft message:', error);
  }
};

/**
 * Get all draft messages
 */
export const getDraftMessages = (): Record<string, DraftMessage> => {
  try {
    const encryptedData = localStorage.getItem(DRAFT_MESSAGES_KEY);
    if (!encryptedData) return {};
    
    const decryptedData = decrypt(encryptedData);
    if (!decryptedData) return {};
    
    const drafts = JSON.parse(decryptedData);
    
    // Convert string timestamps back to Date objects
    Object.keys(drafts).forEach(id => {
      drafts[id].timestamp = new Date(drafts[id].timestamp);
    });
    
    return drafts;
  } catch (error) {
    console.error('Failed to retrieve draft messages:', error);
    return {};
  }
};

/**
 * Get a draft message for a specific conversation
 */
export const getDraftMessage = (conversationId: string): string => {
  try {
    const drafts = getDraftMessages();
    return drafts[conversationId]?.text || '';
  } catch (error) {
    console.error('Failed to get draft message:', error);
    return '';
  }
};

/**
 * Delete a draft message
 */
export const deleteDraftMessage = (conversationId: string): void => {
  try {
    const drafts = getDraftMessages();
    if (!drafts[conversationId]) return;
    
    delete drafts[conversationId];
    
    // Encrypt and store
    const encryptedData = encrypt(JSON.stringify(drafts));
    localStorage.setItem(DRAFT_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to delete draft message:', error);
  }
};

/**
 * Add a message to the pending queue
 */
export const addPendingMessage = (conversationId: string, message: Message): void => {
  try {
    const pendingMessage: PendingMessage = {
      conversationId,
      message,
      retryCount: 0,
      lastAttempt: new Date()
    };
    
    const existingMessages = getPendingMessages();
    
    // Generate a unique key for the message
    const key = `${conversationId}-${message.id}`;
    
    // Add the pending message
    existingMessages[key] = pendingMessage;
    
    // Save to local storage
    const encryptedData = encrypt(JSON.stringify(existingMessages));
    localStorage.setItem(PENDING_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to add pending message:', error);
  }
};

/**
 * Get all pending messages
 */
export const getPendingMessages = (): Record<string, PendingMessage> => {
  try {
    const encryptedData = localStorage.getItem(PENDING_MESSAGES_KEY);
    if (!encryptedData) return {};
    
    const decryptedData = decrypt(encryptedData);
    if (!decryptedData) return {};
    
    const messages = JSON.parse(decryptedData);
    
    // Convert string timestamps back to Date objects
    Object.keys(messages).forEach(key => {
      messages[key].lastAttempt = new Date(messages[key].lastAttempt);
      messages[key].message.timestamp = new Date(messages[key].message.timestamp);
    });
    
    return messages;
  } catch (error) {
    console.error('Failed to retrieve pending messages:', error);
    return {};
  }
};

/**
 * Update a pending message's retry count
 */
export const updatePendingMessage = (key: string, retryCount: number): void => {
  try {
    const messages = getPendingMessages();
    if (!messages[key]) return;
    
    // Update the retry count and timestamp
    messages[key].retryCount = retryCount;
    messages[key].lastAttempt = new Date();
    
    // Save to local storage
    const encryptedData = encrypt(JSON.stringify(messages));
    localStorage.setItem(PENDING_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to update pending message:', error);
  }
};

/**
 * Remove a pending message (once successfully sent)
 */
export const removePendingMessage = (key: string): void => {
  try {
    const messages = getPendingMessages();
    if (!messages[key]) return;
    
    // Remove the message
    delete messages[key];
    
    // Save to local storage
    const encryptedData = encrypt(JSON.stringify(messages));
    localStorage.setItem(PENDING_MESSAGES_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to remove pending message:', error);
  }
};

/**
 * Clear all pending messages
 */
export const clearPendingMessages = (): void => {
  try {
    localStorage.removeItem(PENDING_MESSAGES_KEY);
  } catch (error) {
    console.error('Failed to clear pending messages:', error);
  }
};
