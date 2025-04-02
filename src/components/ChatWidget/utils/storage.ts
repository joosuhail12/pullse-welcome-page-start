
/**
 * Local storage utilities for the Chat Widget
 */
import { Conversation } from '../types';
import { getChatSessionId } from './cookies';

const STORAGE_KEY = 'chat_widget_conversations';
const MAX_STORED_CONVERSATIONS = 30;

/**
 * Load all conversations from localStorage
 */
export function loadConversationsFromStorage(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    
    const parsedData = JSON.parse(data);
    const conversations = Array.isArray(parsedData) ? parsedData : [];
    
    // Fix timestamp format (convert string to Date)
    return conversations.map(conversation => ({
      ...conversation,
      timestamp: new Date(conversation.timestamp),
      messages: conversation.messages?.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
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
 * Save a conversation to localStorage
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
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
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
