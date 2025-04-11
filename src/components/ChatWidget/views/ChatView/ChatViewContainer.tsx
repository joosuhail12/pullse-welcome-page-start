
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation, FormDataStructure } from '../../types';
import { ChatWidgetConfig, defaultConfig } from '../../config';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useMessageReactions } from '../../hooks/useMessageReactions';
import { useMessageSearch } from '../../hooks/useMessageSearch';
import { useInlineForm } from '../../hooks/useInlineForm';
import { dispatchChatEvent } from '../../utils/events';
import ChatViewPresentation from './ChatViewPresentation';
import { MessageReadStatus } from '../../components/MessageReadReceipt';
import { ConnectionStatus } from '../../utils/reconnectionManager';

interface ChatViewContainerProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
  connectionStatus?: ConnectionStatus;
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
  setUserFormData,
  connectionStatus
}: ChatViewContainerProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [ticketProgress, setTicketProgress] = useState(
    conversation.metadata?.ticketProgress || Math.floor(Math.random() * 100)
  );
  const [showInlineForm, setShowInlineForm] = useState(false);

  // Use the new inline form hook
  const {
    showInlineForm: inlineFormVisible,
    handleFormComplete: inlineFormComplete
  } = useInlineForm(
    conversation,
    config,
    userFormData,
    setUserFormData,
    onUpdateConversation
  );

  useEffect(() => {
    setShowInlineForm(inlineFormVisible);
  }, [inlineFormVisible]);

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
    highlightText: originalHighlightText,
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

  const handleFormComplete = useCallback((formData: FormDataStructure) => {
    setShowInlineForm(false);

    if (setUserFormData) {
      const stringFormData: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        stringFormData[key] = String(value);
      });
      
      setUserFormData(stringFormData);
    }

    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });

    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, onUpdateConversation, conversation, config]);

  const handleToggleMessageImportance = useCallback((messageId: string) => {
    setMessages(currentMessages => {
      return currentMessages.map(msg =>
        msg.id === messageId
          ? { ...msg, important: !msg.important }
          : msg
      );
    });

    setTicketProgress(prevProgress => {
      const increment = Math.floor(Math.random() * 10) + 5;
      return Math.min(prevProgress + increment, 100);
    });
  }, [setMessages]);

  const agentAvatar = useMemo(() =>
    conversation.agentInfo?.avatar || config?.brandAssets?.avatarUrl,
    [conversation.agentInfo?.avatar, config?.brandAssets?.avatarUrl]
  );

  const userAvatar = undefined;
  const hasMoreMessages = messages.length >= 20;

  const chatViewStyle = useMemo(() => {
    return {
      ...(config?.colors?.primaryColor && {
        '--chat-header-bg': config.colors.primaryColor,
        '--chat-header-text': '#ffffff',
        '--user-bubble-bg': config.colors.primaryColor,
        '--user-bubble-text': '#ffffff',
        '--system-bubble-bg': '#F5F3FF',
        '--system-bubble-text': '#1f2937',
        '--chat-bg': 'linear-gradient(to bottom, #F5F3FF, #E5DEFF)',
      } as React.CSSProperties)
    };
  }, [config?.colors?.primaryColor]);

  const highlightText = useCallback((text: string, term: string) => {
    if (!term) return [{ text, highlighted: false }];

    const parts: { text: string; highlighted: boolean }[] = [];
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let lastIndex = 0;

    let index = lowerText.indexOf(lowerTerm);
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, index),
          highlighted: false
        });
      }

      parts.push({
        text: text.substring(index, index + term.length),
        highlighted: true
      });

      lastIndex = index + term.length;
      index = lowerText.indexOf(lowerTerm, lastIndex);
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false
      });
    }

    return parts;
  }, []);

  const formattedReadReceipts = useMemo(() => {
    if (!readReceipts) return {};

    const result: Record<string, { status: MessageReadStatus; timestamp?: Date }> = {};
    Object.entries(readReceipts).forEach(([id, receipt]) => {
      result[id] = {
        status: (receipt?.status as MessageReadStatus) || 'sent',
        timestamp: receipt?.timestamp
      };
    });
    return result;
  }, [readReceipts]);

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
      readReceipts={formattedReadReceipts}
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
      connectionStatus={connectionStatus}
    />
  );
};

export default ChatViewContainer;
