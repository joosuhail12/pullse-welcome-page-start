
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import ChatViewHeader from '../components/ChatViewHeader';
import PreChatForm from '../components/PreChatForm';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { dispatchChatEvent } from '../utils/events';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

const ChatView = React.memo(({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}: ChatViewProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(
    config?.preChatForm?.enabled && !userFormData && !conversation.contactIdentified
  );

  useEffect(() => {
    if (userFormData || conversation.contactIdentified) {
      setShowInlineForm(false);
    }
  }, [userFormData, conversation.contactIdentified]);

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
    setShowInlineForm(false);
    
    if (setUserFormData) {
      setUserFormData(formData);
    }
    
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
    
    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, onUpdateConversation, conversation, config]);

  const agentAvatar = useMemo(() => conversation.agentInfo?.avatar || config?.branding?.avatarUrl, 
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]);
    
  const userAvatar = undefined;

  const hasMoreMessages = messages.length >= 20;

  const inlineFormComponent = useMemo(() => {
    if (showInlineForm) {
      return (
        <div className="mb-4">
          <PreChatForm config={config} onFormComplete={handleFormComplete} />
        </div>
      );
    }
    return null;
  }, [showInlineForm, config, handleFormComplete]);

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
    <div 
      className="flex flex-col h-full bg-gradient-to-br from-soft-purple-50 to-soft-purple-100"
      style={chatViewStyle}
    >
      <ChatViewHeader 
        conversation={conversation} 
        onBack={onBack}
        showSearch={showSearch}
        toggleSearch={toggleSearch}
        searchMessages={searchMessages}
        clearSearch={clearSearch}
        searchResultCount={messageIds.length}
        isSearching={isSearching}
        showSearchFeature={!!config?.features?.searchMessages}
      />
      
      {inlineFormComponent}
      
      {(!showInlineForm || userFormData || conversation.contactIdentified) && (
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
        />
      )}
      
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
