
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation } from '../../types';
import { ChatWidgetConfig, defaultConfig } from '../../config';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useMessageReactions } from '../../hooks/useMessageReactions';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import { useInlineForm } from '../../hooks/useInlineForm';
import { dispatchChatEvent } from '../../utils/events';
import ChatViewPresentation from './ChatViewPresentation';

interface ChatViewContainerProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

/**
 * Container component that handles all the state management and hooks
 * for the chat view. This component doesn't render any UI directly,
 * but passes all necessary props to the presentation component.
 */
const ChatViewContainer = ({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}: ChatViewContainerProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [ticketProgress, setTicketProgress] = useState(
    conversation.metadata?.ticketProgress || Math.floor(Math.random() * 100)
  );

  // Use the new inline form hook
  const {
    showInlineForm,
    handleFormComplete: processFormComplete
  } = useInlineForm(
    conversation,
    config,
    userFormData,
    setUserFormData,
    onUpdateConversation
  );

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
    loadPreviousMessages
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    message => setMessages(message),
    `conversation:${conversation.id}`,
    conversation.sessionId || '',
    config
  );

  const {
    searchTerm,
    setSearchTerm,
    searchMessages,
    clearSearch,
    highlightText,
    messageIds,
    isSearching
  } = useMessageSearch(messages);

  const setMessages = useCallback((updatedMessages: React.SetStateAction<typeof messages>) => {
    if (typeof updatedMessages === 'function') {
      const newMessages = updatedMessages(messages);
      onUpdateConversation({
        ...conversation,
        messages: newMessages
      });
    } else {
      onUpdateConversation({
        ...conversation,
        messages: updatedMessages
      });
    }
  }, [messages, conversation, onUpdateConversation]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  }, [showSearch, clearSearch]);

  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    setIsLoadingMore(true);
    try {
      await loadPreviousMessages();
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadPreviousMessages]);

  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    processFormComplete(formData);
    
    if (setUserFormData) {
      setUserFormData(formData);
    }
    
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
    
    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, onUpdateConversation, conversation, config, processFormComplete]);

  // Handler for toggling message importance
  const handleToggleMessageImportance = useCallback((messageId: string) => {
    setMessages(currentMessages => {
      return currentMessages.map(msg => 
        msg.id === messageId
          ? { ...msg, important: !msg.important }
          : msg
      );
    });

    // When a message is marked important, update ticket progress as well
    setTicketProgress(prevProgress => {
      // Randomly increment progress between 5-15% when message is marked important
      const increment = Math.floor(Math.random() * 10) + 5;
      return Math.min(prevProgress + increment, 100);
    });
  }, [setMessages]);

  const agentAvatar = useMemo(() => 
    conversation.agentInfo?.avatar || config?.branding?.avatarUrl, 
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]
  );
  
  const userAvatar = undefined;
  const hasMoreMessages = messages.length >= 20;

  // Styling based on branding config
  const chatViewStyle = useMemo(() => {
    return {
      ...(config?.branding?.primaryColor && {
        '--chat-header-bg': config.branding.primaryColor,
        '--chat-header-text': '#ffffff',
        '--user-bubble-bg': config.branding.primaryColor,
        '--user-bubble-text': '#ffffff',
        '--system-bubble-bg': '#F5F3FF',
        '--system-bubble-text': '#1f2937',
        '--chat-bg': 'linear-gradient(to bottom, #F5F3FF, #E5DEFF)',
      } as React.CSSProperties)
    };
  }, [config?.branding?.primaryColor]);

  return (
    <ChatViewPresentation 
      conversation={conversation}
      chatViewStyle={chatViewStyle}
      messages={messages}
      messageText={messageText}
      setMessageText={setMessageText}
      isTyping={isTyping}
      remoteIsTyping={remoteIsTyping}
      handleSendMessage={handleSendMessage}
      handleUserTyping={handleUserTyping}
      handleFileUpload={handleFileUpload}
      handleEndChat={handleEndChat}
      readReceipts={readReceipts}
      onBack={onBack}
      showSearch={showSearch}
      toggleSearch={toggleSearch}
      searchMessages={searchMessages}
      clearSearch={clearSearch}
      searchResultCount={messageIds.length}
      isSearching={isSearching}
      showSearchFeature={!!config?.features?.searchMessages}
      highlightText={highlightText}
      messageIds={messageIds}
      searchTerm={searchTerm}
      agentAvatar={agentAvatar}
      userAvatar={userAvatar}
      onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
      handleLoadMoreMessages={handleLoadMoreMessages}
      hasMoreMessages={hasMoreMessages}
      isLoadingMore={isLoadingMore}
      showInlineForm={showInlineForm}
      handleFormComplete={handleFormComplete}
      config={config}
      onToggleMessageImportance={handleToggleMessageImportance}
      ticketProgress={ticketProgress}
    />
  );
};

export default ChatViewContainer;
