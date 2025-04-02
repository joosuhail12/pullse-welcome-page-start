
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  const [isProcessingForm, setIsProcessingForm] = useState(false);
  const formSubmissionRef = useRef(false);
  
  // Use the pre-chat form hook with stable references
  const { showPreChatForm, hidePreChatForm } = usePreChatForm({ 
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
    handleSendMessage: originalHandleSendMessage,
    handleUserTyping: originalHandleUserTyping,
    handleFileUpload: originalHandleFileUpload,
    handleEndChat: originalHandleEndChat,
    remoteIsTyping,
    readReceipts,
    loadPreviousMessages,
    isLoadingMore
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  // Memoize the conversation messages reference to prevent unnecessary renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Create a stable memoized function for updating messages
  const setMessages = useCallback((updatedMessages: React.SetStateAction<Message[]>) => {
    onUpdateConversation({
      ...conversation,
      messages: typeof updatedMessages === 'function' 
        ? updatedMessages(conversation.messages || []) 
        : updatedMessages
    });
  }, [conversation, onUpdateConversation]);

  // Memoize the message actions to prevent recreating them on each render
  const handleSendMessage = useCallback(() => {
    originalHandleSendMessage();
  }, [originalHandleSendMessage]);
  
  const handleUserTyping = useCallback(() => {
    originalHandleUserTyping();
  }, [originalHandleUserTyping]);
  
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    originalHandleFileUpload(e);
  }, [originalHandleFileUpload]);
  
  const handleEndChat = useCallback(() => {
    originalHandleEndChat();
  }, [originalHandleEndChat]);

  // Message reactions hook
  const {
    handleMessageReaction
  } = useMessageReactions(
    memoizedMessages,
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
  } = useMessageSearch(memoizedMessages);

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

  // Handle form submission with improved state management
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    console.log("Form submission in useChatView with data:", formData);
    
    // Use ref to check if submission is already in progress
    if (formSubmissionRef.current || isProcessingForm) {
      console.log("Form submission already in progress, ignoring duplicate submission");
      return;
    }
    
    // Set both state and ref to prevent multiple submissions
    formSubmissionRef.current = true;
    setIsProcessingForm(true);
    
    // First hide the form to prevent rendering issues
    hidePreChatForm();
    
    // Use setTimeout to batch state updates
    setTimeout(() => {
      if (setUserFormData) {
        setUserFormData(formData);
      }
      
      onUpdateConversation({
        ...conversation,
        contactIdentified: true
      });
      
      if (config) {
        dispatchChatEvent('contact:formCompleted', { formData }, config);
      }
      
      // Reset processing flags after a delay
      setTimeout(() => {
        setIsProcessingForm(false);
        formSubmissionRef.current = false;
      }, 500);
    }, 0);
  }, [conversation, config, hidePreChatForm, isProcessingForm, onUpdateConversation, setUserFormData]);

  // Get avatar URLs from config
  const agentAvatar = useMemo(() => 
    conversation.agentInfo?.avatar || config?.branding?.avatarUrl,
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]
  );
  
  const userAvatar = undefined; // Could be set from user profile if available

  // Determine if there could be more messages to load
  const hasMoreMessages = useMemo(() => 
    memoizedMessages.length >= 20, 
    [memoizedMessages.length]
  ); // Simplified check for more messages

  return {
    showSearch,
    toggleSearch,
    showPreChatForm,
    messages: memoizedMessages,
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
    isLoadingMore,
    isProcessingForm
  };
}
