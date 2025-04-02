
import { useState, useEffect } from 'react';
import { Conversation } from '../types';
import { saveConversationToStorage, loadConversationsFromStorage } from '../utils/storage';

type ViewState = 'home' | 'messages' | 'chat';

export function useChatState() {
  const [viewState, setViewState] = useState<ViewState>('messages'); // Default to messages view
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(undefined);
  
  // Load any existing conversations when component mounts
  useEffect(() => {
    loadConversationsFromStorage();
  }, []);

  const handleStartChat = (formData?: Record<string, string>) => {
    // Store form data when provided
    if (formData) {
      setUserFormData(formData);
    }
    
    // Create a new conversation
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: formData?.name ? `Chat with ${formData.name}` : 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      agentInfo: {
        name: 'Support Agent',
        avatar: undefined // You could set a default avatar URL here
      }
    };
    
    setActiveConversation(newConversation);
    setViewState('chat');
    
    // Save the new conversation to localStorage
    saveConversationToStorage(newConversation);
  };

  const handleBackToMessages = () => {
    // Update the conversation in localStorage before going back
    if (activeConversation) {
      saveConversationToStorage(activeConversation);
    }
    setViewState('messages');
  };

  const handleChangeView = (view: ViewState) => {
    if (view !== 'chat') {
      setViewState(view);
    }
  };

  // Handler for when a conversation is selected from the messages view
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
  };

  // Update conversation with new message
  const handleUpdateConversation = (updatedConversation: Conversation) => {
    setActiveConversation(updatedConversation);
    // Save the updated conversation to localStorage
    saveConversationToStorage(updatedConversation);
  };

  return {
    viewState,
    activeConversation,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation,
    userFormData,
  };
}
