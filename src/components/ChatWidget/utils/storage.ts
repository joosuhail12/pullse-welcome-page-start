
import { Conversation } from '../types';
import { getChatSessionId } from './cookies';

export const saveConversationToStorage = (conversation: Conversation) => {
  try {
    // Get existing conversations
    const storedConversationsStr = localStorage.getItem('chat-conversations') || '[]';
    const storedConversations = JSON.parse(storedConversationsStr);
    
    // Check if conversation already exists
    const existingIndex = storedConversations.findIndex(
      (conv: any) => conv.id === conversation.id
    );
    
    if (existingIndex >= 0) {
      // Update existing conversation
      storedConversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      storedConversations.push(conversation);
    }
    
    // Save back to storage
    localStorage.setItem('chat-conversations', JSON.stringify(storedConversations));
  } catch (error) {
    console.error('Failed to save conversation to localStorage', error);
  }
};

export const loadConversationsFromStorage = (): Conversation[] => {
  try {
    const storedConversations = localStorage.getItem('chat-conversations');
    if (!storedConversations) return [];
    
    // Parse and convert string timestamps back to Date objects
    return JSON.parse(storedConversations).map((conv: any) => ({
      ...conv,
      timestamp: new Date(conv.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load conversations from localStorage', error);
    return [];
  }
};

/**
 * Gets the current session conversation, if any
 * @returns The session conversation or null if not found
 */
export const getSessionConversation = (): Conversation | null => {
  try {
    const sessionId = getChatSessionId();
    if (!sessionId) return null;
    
    const conversations = loadConversationsFromStorage();
    return conversations.find(conv => conv.sessionId === sessionId) || null;
  } catch (error) {
    console.error('Failed to get session conversation:', error);
    return null;
  }
};

/**
 * Creates or updates a session-based conversation
 * @param sessionId The session ID
 * @param updates Optional updates to apply to the conversation
 * @returns The created or updated conversation
 */
export const createOrUpdateSessionConversation = (
  sessionId: string, 
  updates?: Partial<Conversation>
): Conversation => {
  try {
    // Check if a conversation for this session already exists
    const conversations = loadConversationsFromStorage();
    const existingConversation = conversations.find(conv => conv.sessionId === sessionId);
    
    if (existingConversation) {
      // Update existing conversation
      const updatedConversation = {
        ...existingConversation,
        ...updates,
        sessionId,
        timestamp: new Date() // Update timestamp
      };
      saveConversationToStorage(updatedConversation);
      return updatedConversation;
    }
    
    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      sessionId,
      agentInfo: {
        name: 'Support Agent',
        avatar: undefined
      },
      ...(updates || {})
    };
    
    saveConversationToStorage(newConversation);
    return newConversation;
  } catch (error) {
    console.error('Failed to create or update session conversation:', error);
    throw error;
  }
};
