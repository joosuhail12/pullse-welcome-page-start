
import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';
import { isTestMode, getSampleConversations, simulateAgentTypingInTestMode, simulateAgentResponseInTestMode } from '../utils/testMode';
import { v4 as uuidv4 } from 'uuid';
import { dispatchChatEvent } from '../utils/events';

interface ChatStateReturn {
  viewState: 'home' | 'messages' | 'chat';
  activeConversation: Conversation | null;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  handleStartChat: (formData?: Record<string, string>) => void;
  handleBackToMessages: () => void;
  handleChangeView: (view: 'home' | 'messages' | 'chat') => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (updatedConversation: Conversation) => void;
  userFormData: Record<string, string>;
  setUserFormData: (data: Record<string, string>) => void;
}

export const useChatState = (): ChatStateReturn => {
  const [viewState, setViewState] = useState<'home' | 'messages' | 'chat'>('home');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userFormData, setUserFormData] = useState<Record<string, string>>({});
  
  // Initialize with test data if in test mode
  useEffect(() => {
    if (isTestMode() && conversations.length === 0) {
      const sampleConversations = getSampleConversations();
      setConversations(sampleConversations);
    }
  }, [conversations.length]);
  
  const handleStartChat = useCallback((formData?: Record<string, string>) => {
    if (formData) {
      setUserFormData(formData);
    }
    
    // Different behavior based on test mode
    if (isTestMode()) {
      // In test mode, we create a new test conversation
      const newConversation: Conversation = {
        id: 'test-convo-new-' + Date.now(),
        title: 'New Conversation',
        preview: '',
        timestamp: new Date(),
        unreadCount: 0,
        status: 'active',
        messages: [],
        agentInfo: {
          id: 'test-agent',
          name: 'Test Agent',
          avatar: null,
          status: 'online'
        }
      };
      
      setConversations(prevConversations => [newConversation, ...prevConversations]);
      setActiveConversation(newConversation);
      setViewState('chat');
      
      // Simulate agent welcome message after a delay
      const typingTimer = simulateAgentTypingInTestMode(() => {
        const welcomeMessage = simulateAgentResponseInTestMode(
          "Hello! This is a test conversation. The widget is in test mode, so no real messages are being sent. How can I help you today?"
        );
        
        setActiveConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), welcomeMessage],
            preview: welcomeMessage.text
          };
        });
      });
      
      // Dispatch event for tracking
      dispatchChatEvent('contact:initiatedChat', {
        formData: formData || {},
        timestamp: new Date(),
        testMode: true
      });
      
      return;
    }
    
    // Normal production behavior
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      preview: '',
      timestamp: new Date(),
      unreadCount: 0,
      status: 'active',
      messages: [],
      agentInfo: {
        id: 'agent-1',
        name: 'Support Agent',
        avatar: null,
        status: 'online'
      }
    };
    
    setConversations(prevConversations => [newConversation, ...prevConversations]);
    setActiveConversation(newConversation);
    setViewState('chat');
    
    // Dispatch event for tracking
    dispatchChatEvent('contact:initiatedChat', {
      formData: formData || {},
      timestamp: new Date(),
      conversationId: newConversation.id
    });
  }, []);

  const handleBackToMessages = useCallback(() => {
    setViewState('messages');
    setActiveConversation(null);
  }, []);

  const handleChangeView = useCallback((view: 'home' | 'messages' | 'chat') => {
    setViewState(view);
    if (view !== 'chat') {
      setActiveConversation(null);
    }
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setViewState('chat');
    
    // Mark conversation as read when selected
    setConversations(prevConversations => 
      prevConversations.map(c => 
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  const handleUpdateConversation = useCallback((updatedConversation: Conversation) => {
    setActiveConversation(updatedConversation);
    
    setConversations(prevConversations => 
      prevConversations.map(conversation => 
        conversation.id === updatedConversation.id ? updatedConversation : conversation
      )
    );
  }, []);

  return {
    viewState,
    activeConversation,
    conversations,
    setConversations,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation,
    userFormData,
    setUserFormData
  };
};
