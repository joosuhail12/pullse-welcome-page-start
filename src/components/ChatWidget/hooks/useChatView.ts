
import { useState, useCallback } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { useChatMessages } from './useChatMessages';
import { useMessageReactions } from './useMessageReactions';
import { useMessageSearch } from './useMessageSearch';
import { usePreChatForm } from './usePreChatForm';

interface UseChatViewProps {
  conversation: Conversation;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

export function useChatView({
  conversation,
  onUpdateConversation,
  config,
  playMessageSound,
  userFormData,
  setUserFormData
}: UseChatViewProps) {
  const [showSearch, setShowSearch] = useState(false);
  
  // Use the pre-chat form hook
  const { showPreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Chat messages hook
  const {
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts,
    loadPreviousMessages,
    isLoadingMore
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  // The issue might be here - preventing unnecessary re-renders
  const setMessages = useCallback((updatedMessages: React.SetStateAction<Message[]>) => {
    if (typeof updatedMessages === 'function') {
      // We won't directly call the function here which might cause infinite loops
      onUpdateConversation({
        ...conversation,
        messages: updatedMessages(conversation.messages || [])
      });
    } else {
      onUpdateConversation({
        ...conversation,
        messages: updatedMessages
      });
    }
  }, [conversation, onUpdateConversation]);

  // Message reactions hook
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    setMessages,
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  // Message search hook
  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useMessageSearch(messages);

  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
  }, []);

  // Handle loading previous messages for infinite scroll
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    try {
      await loadPreviousMessages();
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  }, [loadPreviousMessages]);

  // Handle form submission
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    // Update the parent form data if callback exists
    if (setUserFormData) {
      setUserFormData(formData);
    }
    
    // Flag the conversation as having identified the contact
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
    
    // Dispatch form completed event
    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, conversation, onUpdateConversation, config]);

  // Get avatar URLs from config
  const agentAvatar = conversation.agentInfo?.avatar || config?.branding?.avatarUrl;
  const userAvatar = undefined; // Could be set from user profile if available

  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Simplified check for more messages

  return {
    showSearch,
    toggleSearch,
    showPreChatForm,
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts,
    handleMessageReaction,
    searchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching,
    agentAvatar,
    userAvatar,
    handleLoadMoreMessages,
    handleFormComplete,
    hasMoreMessages,
    isLoadingMore
  };
}
