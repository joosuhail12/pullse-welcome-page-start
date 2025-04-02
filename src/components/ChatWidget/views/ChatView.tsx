
import React, { useState, useCallback, useEffect } from 'react';
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

const ChatView = ({ 
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
  
  // Check if pre-chat form should be shown based on config and conversation state
  const [showPreChatForm, setShowPreChatForm] = useState(
    config?.preChatForm?.enabled && !conversation.contactIdentified && !userFormData
  );

  // Effect to update the showPreChatForm state when userFormData changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified) {
      setShowPreChatForm(false);
    } else if (config?.preChatForm?.enabled && !conversation.contactIdentified) {
      // Ensure form shows when conditions are met
      setShowPreChatForm(true);
    }
  }, [userFormData, conversation.contactIdentified, config?.preChatForm?.enabled]);

  // Debug log for form visibility state
  useEffect(() => {
    console.log('Pre-chat form visibility:', { 
      showPreChatForm,
      formEnabled: config?.preChatForm?.enabled,
      contactIdentified: conversation.contactIdentified,
      hasUserFormData: !!userFormData
    });
  }, [showPreChatForm, config?.preChatForm?.enabled, conversation.contactIdentified, userFormData]);

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

  // Function to share messages state with parent components
  const setMessages = (updatedMessages: React.SetStateAction<typeof messages>) => {
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
  };

  // Toggle search bar
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      clearSearch();
    }
  };

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
  const handleFormComplete = (formData: Record<string, string>) => {
    setShowPreChatForm(false);
    
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
  };

  // Get avatar URLs from config
  const agentAvatar = conversation.agentInfo?.avatar || config?.branding?.avatarUrl;
  const userAvatar = undefined; // Could be set from user profile if available

  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Assuming we load 20 messages at a time

  return (
    <div 
      className="flex flex-col h-[600px]"
      style={{
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
      }}
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
      
      <div className="flex-1 overflow-y-auto p-4">
        {showPreChatForm ? (
          <div className="mb-4">
            <PreChatForm 
              config={config} 
              onFormComplete={handleFormComplete} 
            />
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
        disabled={showPreChatForm}
      />
    </div>
  );
};

export default ChatView;
