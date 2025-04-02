
import { Conversation } from '../types';

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
