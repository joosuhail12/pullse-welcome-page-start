
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation, Ticket } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatForm from '../components/PreChatForm';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useInlineForm } from '../hooks/useInlineForm';
import { dispatchChatEvent } from '../utils/events';
import { ConnectionStatus } from '../utils/reconnectionManager';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  handleSelectTicket?: (ticket: Ticket) => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
  connectionStatus?: ConnectionStatus;
}

const ChatView = React.memo(({
  conversation,
  onBack,
  onUpdateConversation,
  config = defaultConfig,
  playMessageSound,
  handleSelectTicket,
  userFormData,
  setUserFormData,
  connectionStatus
}: ChatViewProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    showInlineForm,
    handleFormComplete
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
    loadPreviousMessages,
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound, handleSelectTicket);

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

  const highlightText = useCallback((text: string): string[] => {
    if (!searchTerm) return [text];

    return originalHighlightText(text, searchTerm)
      .map(part => part.text);
  }, [searchTerm, originalHighlightText]);

  const agentAvatar = useMemo(() => conversation.agentInfo?.avatar || config?.brandAssets?.avatarUrl,
    [conversation.agentInfo?.avatar, config?.brandAssets?.avatarUrl]);

  const userAvatar = undefined;
  const hasMoreMessages = messages.length >= 20;

  const inlineFormComponent = useMemo(() => {
    if (showInlineForm) {
      return <PreChatForm config={config} onFormComplete={handleFormComplete} />;
    }
    return null;
  }, [showInlineForm, config, handleFormComplete]);

  const chatViewStyle = useMemo(() => {
    return {
      ...(config?.colors?.primaryColor && {
        '--chat-header-bg': config.colors.primaryColor,
        '--chat-header-text': '#ffffff',
        '--user-bubble-bg': config.colors.userMessageBackgroundColor,
        '--user-bubble-text': '#ffffff',
        '--system-bubble-bg': config.colors.agentMessageBackgroundColor,
        '--system-bubble-text': '#1f2937',
        '--chat-bg': 'linear-gradient(to bottom, #F5F3FF, #E5DEFF)',
      } as React.CSSProperties)
    };
  }, [config?.colors?.primaryColor, config?.colors?.userMessageBackgroundColor, config?.colors?.agentMessageBackgroundColor]);

  return (
    <div
      style={{
        backgroundColor: config.colors?.backgroundColor || 'transparent'
      }}
      className={`flex flex-col h-full
              ${!config.colors?.backgroundColor && 'bg-gradient-to-br from-soft-purple-50 to-soft-purple-100'}`}
    >
      <ChatViewHeader
        conversation={conversation}
        onBack={onBack}
        config={config}
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        searchMessages={searchMessages}
        clearSearch={clearSearch}
        searchResultCount={messageIds.length}
        isSearching={isSearching}
        showSearchFeature={!!config?.features?.searchMessages}
      />

      <div className="flex-grow overflow-hidden flex flex-col">
        {showInlineForm ? (
          <div className="flex-grow flex flex-col justify-center items-center p-4 bg-gradient-to-br from-[#f8f7ff] to-[#f5f3ff]">
            <div className="w-full max-w-md">
              {inlineFormComponent}
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isTyping={isTyping || remoteIsTyping}
            setMessageText={setMessageText}
            readReceipts={readReceipts}
            onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
            searchResults={messageIds}
            highlightMessage={highlightText}
            searchTerm={searchTerm}
            agentAvatar={agentAvatar}
            userAvatar={userAvatar}
            onScrollTop={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            conversationId={conversation.id}
            agentStatus={conversation.agentInfo?.status}
            config={config}
          />
        )}
      </div>

      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
        disabled={showInlineForm}
      />
    </div>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;
