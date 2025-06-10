
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation, Ticket } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatForm from '../components/PreChatForm';
import ConversationRating from '../components/ConversationRating';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useInlineForm } from '../hooks/useInlineForm';
import { dispatchChatEvent } from '../utils/events';
import { ConnectionStatus } from '../utils/reconnectionManager';
import { getAccessToken, getWorkspaceIdAndApiKey } from '../utils/storage';

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
  isDemo?: boolean;
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
  connectionStatus,
  isDemo = false
}: ChatViewProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Check if conversation rating should be shown
  const showRating = useMemo(() => {
    return (
      config?.interfaceSettings?.enableConversationRating === true &&
      (conversation.status === 'ended' || conversation.status === 'closed') &&
      !conversation.rating
    );
  }, [config?.interfaceSettings?.enableConversationRating, conversation.status, conversation.rating]);

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
    // remoteIsTyping,
    // readReceipts,
    loadPreviousMessages
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound, handleSelectTicket, isDemo);

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

  const handleSubmitRating = async (rating: number) => {
    console.log('User submitted rating:', rating);
    // For now, just logging the rating as per requirements
    // In the future, this would call an API to save the rating
    const { apiKey } = getWorkspaceIdAndApiKey();
    const accessToken = getAccessToken();
    try {
      const response = await fetch("https://dev-socket.pullseai.com/api/widgets/updateTicketRating/" + apiKey, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken ? `Bearer ${accessToken}` : ''
        },
        body: JSON.stringify({
          rating: rating,
          ticketId: conversation.ticketId
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        console.log('Rating updated successfully');
      } else {
        console.error('Failed to update rating');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }

    // Update the conversation to include the rating so it doesn't show again
    onUpdateConversation({
      ...conversation,
      rating
    });
  };

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

      <div style={{
        overflowY: 'scroll',
        overflowX: 'hidden'
      }} className="flex-grow flex flex-col">
        {showInlineForm && !isDemo ? (
          <div className="flex-grow flex flex-col justify-center items-center p-4 bg-gradient-to-br from-[#f8f7ff] to-[#f5f3ff]">
            <div className="w-full max-w-md">
              {inlineFormComponent}
            </div>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              isTyping={isTyping}
              setMessageText={setMessageText}
              onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
              searchResults={messageIds}
              highlightMessage={highlightText}
              searchTerm={searchTerm}
              agentAvatar={agentAvatar}
              userAvatar={userAvatar}
              handleSendMessage={handleSendMessage}
              onScrollTop={handleLoadMoreMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMore={isLoadingMore}
              conversationId={conversation.id}
              agentStatus={conversation.agentInfo?.status}
              config={config}
              isDemo={isDemo}
            />

            {/* Rating component - shown only when conditions are met */}
            {showRating && (
              <div className="mx-4 my-2">
                <ConversationRating onSubmitRating={handleSubmitRating} config={config} />
              </div>
            )}
          </>
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
        disabled={showInlineForm || conversation.status === 'ended' || conversation.status === 'closed'}
      />
    </div>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;