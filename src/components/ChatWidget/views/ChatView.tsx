
import React, { useCallback, useMemo, useState } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import MessageInputSection from '../components/MessageInputSection';
import ChatViewHeader from '../components/ChatViewHeader';
import MessagesSection from '../components/MessagesSection';
import { useChatMessages } from '../hooks/useChatMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { useMessageSearch } from '../hooks/useMessageSearch';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}) => {
  const [showSearch, setShowSearch] = useState(false);

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
  }, [conversation, messages, onUpdateConversation]);

  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    // Only clear search when closing the search bar
    if (showSearch) {
      clearSearch();
    }
  }, [showSearch, clearSearch]);

  // Handle loading previous messages for infinite scroll
  const handleLoadMoreMessages = useCallback(async () => {
    if (!loadPreviousMessages) return;
    
    try {
      await loadPreviousMessages();
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  }, [loadPreviousMessages]);

  // Get avatar URLs from config
  const agentAvatar = useMemo(() => 
    conversation.agentInfo?.avatar || config?.branding?.avatarUrl,
    [conversation.agentInfo?.avatar, config?.branding?.avatarUrl]
  );
  
  // Determine if there could be more messages to load
  const hasMoreMessages = messages.length >= 20; // Simplified check for more messages

  return (
    <div 
      className="flex flex-col h-[600px] bg-gradient-to-b from-gray-50 to-white"
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
      
      <MessagesSection 
        messages={messages}
        isTyping={isTyping}
        remoteIsTyping={remoteIsTyping}
        setMessageText={setMessageText}
        readReceipts={readReceipts}
        onMessageReaction={config?.features?.messageReactions ? handleMessageReaction : undefined}
        searchResults={messageIds}
        highlightMessage={highlightText}
        searchTerm={searchTerm}
        agentAvatar={agentAvatar}
        userAvatar={undefined}
        onScrollTop={handleLoadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMore={isLoadingMore}
      />
      
      <MessageInputSection
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
        disabled={false}
      />
    </div>
  );
};

export default React.memo(ChatView);
