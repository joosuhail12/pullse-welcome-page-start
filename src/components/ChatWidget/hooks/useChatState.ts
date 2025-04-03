
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
  updatedAt: new Date(),
  lastMessage: '',
  timestamp: new Date()
};

export const useChatState = (initialConversation?: Conversation) => {
  const [viewState, setViewState] = useState<'home' | 'messages' | 'chat'>('home');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    initialConversation || null
  );
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversation ? [initialConversation] : []
  );
  const [userFormData, setUserFormData] = useState<Record<string, string>>({});
  
  // Add a message to the conversation
  const addMessage = useCallback((message: Message) => {
    setActiveConversation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: new Date(),
        lastMessage: message.text,
        timestamp: new Date()
      };
    });
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
      } : undefined
    };
    
    setActiveConversation(newConversation);
    setConversations(prev => [...prev, newConversation]);
    return newConversation;
  }, []);
  
  // Update the conversation
  const updateConversation = useCallback((updates: Partial<Conversation>) => {
    setActiveConversation((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date()
      };
      
      // Also update in conversations array
      setConversations(convs => 
        convs.map(c => c.id === prev.id ? updated : c)
      );
      
      return updated;
    });
  }, []);
  
  // End the conversation
  const endConversation = useCallback(() => {
    updateConversation({ status: 'ended' });
  }, [updateConversation]);

  // Handle changing view
  const handleChangeView = useCallback((view: 'home' | 'messages' | 'chat') => {
    setViewState(view);
  }, []);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
  }, []);

  // Handle updating a conversation
  const handleUpdateConversation = useCallback((updatedConversation: Conversation) => {
    updateConversation(updatedConversation);
  }, [updateConversation]);

  // Handle back to messages
  const handleBackToMessages = useCallback(() => {
    setViewState('messages');
  }, []);

  // Handle starting a chat
  const handleStartChat = useCallback((formData?: Record<string, string>) => {
    if (formData) {
      setUserFormData(formData);
    }
    
    const newConversation = createNewConversation('New Support Chat', {
      name: 'Support Agent',
      avatar: undefined
    });
    
    setActiveConversation(newConversation);
    setViewState('chat');
    
    return newConversation;
  }, [createNewConversation]);

  return {
    conversation: activeConversation || { ...emptyConversation, id: uuidv4() },
    viewState,
    activeConversation,
    conversations,
    userFormData,
    setUserFormData,
    addMessage,
    createNewConversation,
    updateConversation,
    endConversation,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation,
    handleBackToMessages,
    handleStartChat
  };
};

export default useChatState;
