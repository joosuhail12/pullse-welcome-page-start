
import { useState, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

const emptyConversation: Conversation = {
  id: '',
  title: 'New Conversation',
  messages: [],
  status: 'active',
  unreadCount: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const useChatState = (initialConversation?: Conversation) => {
  const [conversation, setConversation] = useState<Conversation>(
    initialConversation || { ...emptyConversation, id: uuidv4() }
  );
  
  // Add a message to the conversation
  const addMessage = useCallback((message: Message) => {
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: new Date()
    }));
  }, []);
  
  // Create a new conversation
  const createNewConversation = useCallback((title: string = 'New Conversation', agent?: { name: string, avatar: any }) => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      status: 'active',
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: '',
      timestamp: new Date(),
      agentInfo: agent ? {
        name: agent.name,
        avatar: agent.avatar
      } : undefined,
      contactIdentified: false
    };
    
    setConversation(newConversation);
    return newConversation;
  }, []);
  
  // Update the conversation
  const updateConversation = useCallback((updates: Partial<Conversation>) => {
    setConversation((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  }, []);
  
  // End the conversation
  const endConversation = useCallback(() => {
    setConversation((prev) => ({
      ...prev,
      status: 'ended',
      updatedAt: new Date()
    }));
  }, []);

  return {
    conversation,
    addMessage,
    createNewConversation,
    updateConversation,
    endConversation
  };
};
