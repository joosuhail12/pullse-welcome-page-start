
import React, { memo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import ChatViewHeader from '../components/ChatViewHeader';
import ChatContent from '../components/ChatContent';
import { useChatView } from '../hooks/useChatView';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

const ChatView = memo(({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData
}: ChatViewProps) => {
  // Use our custom hook to handle all the chat view logic
  const {
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
    isLoadingMore,
    isProcessingForm
  } = useChatView({
    conversation,
    onUpdateConversation,
    config,
    playMessageSound,
    userFormData,
    setUserFormData
  });

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
      
      <ChatContent 
        showPreChatForm={showPreChatForm}
        messages={messages}
        isTyping={isTyping}
        remoteIsTyping={remoteIsTyping}
        messageText={messageText}
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
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        handleUserTyping={handleUserTyping}
        handleFormComplete={handleFormComplete}
        config={config}
        isProcessingForm={isProcessingForm}
      />
    </div>
  );
});

// Adding display name for debugging purposes
ChatView.displayName = 'ChatView';

export default ChatView;
