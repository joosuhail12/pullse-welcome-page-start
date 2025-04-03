
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
    config?.preChatForm?.enabled && !conversation.contactIdentified && !userFormData
  );

  // Effect to update the showInlineForm state when userFormData changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified) {
      setShowInlineForm(false);
    }
  }, [userFormData, conversation.contactIdentified]);

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
    loadPreviousMessages
  } = useChatMessages(conversation, config, onUpdateConversation, playMessageSound);

  // Message reactions hook
  const {
    handleMessageReaction
  } = useMessageReactions(
    messages,
    message => setMessages(message),
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

  // Memoize setMessages function to prevent recreation on each render
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

  // Toggle search bar with memoized callback
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  }, [showSearch, clearSearch]);

  // Handle loading previous messages for infinite scroll
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    setIsLoadingMore(true);
    try {
      await loadPreviousMessages();
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadPreviousMessages]);

  // Handle form submission
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    setShowInlineForm(false);
    
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
  }, [setUserFormData, onUpdateConversation, conversation, config]);

  // Memoize avatar URLs from config
  const agentAvatar = useMemo(() => conversation.agentInfo?.avatar || config?.branding?.avatarUrl, 
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]);
    
  const userAvatar = undefined; // Could be set from user profile if available

  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Assuming we load 20 messages at a time

  // Memoize inline form component to prevent unnecessary renders
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

  // Memoize style properties
  const chatViewStyle = useMemo(() => {
    return {
      // Apply custom theme variables if available from config
      ...(config?.branding?.primaryColor && {
        '--chat-header-bg': config.branding.primaryColor,
        '--chat-header-text': '#ffffff',
        '--user-bubble-bg': config.branding.primaryColor,
        '--user-bubble-text': '#ffffff',
        '--system-bubble-bg': '#f3f4f6',
        '--system-bubble-text': '#1f2937',
        '--chat-bg': '#ffffff',
      } as React.CSSProperties)
    };
  }, [config?.branding?.primaryColor]);

  return (
    <div 
      className="flex flex-col h-[600px]"
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

// Add display name for dev tools
ChatView.displayName = 'ChatView';

export default ChatView;
