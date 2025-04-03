
import React, { useMemo } from 'react';
import { Conversation, Message } from '../../types';
import { ChatWidgetConfig } from '../../config';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import ChatViewHeader from '../../components/ChatViewHeader';
import PreChatForm from '../../components/PreChatForm';

interface ChatViewPresentationProps {
  conversation: Conversation;
  chatViewStyle: React.CSSProperties;
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  isTyping: boolean;
  remoteIsTyping: boolean;
  handleSendMessage: () => void;
  handleUserTyping: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  readReceipts: Record<string, Date>;
  onBack: () => void;
  showSearch: boolean;
  toggleSearch: () => void;
  searchMessages: (term: string) => void;
  clearSearch: () => void;
  searchResultCount: number;
  isSearching: boolean;
  showSearchFeature: boolean;
  highlightText: (text: string, term: string) => { text: string; highlighted: boolean }[];
  messageIds: string[];
  searchTerm: string;
  agentAvatar?: string;
  userAvatar?: string;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  handleLoadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  showInlineForm: boolean;
  handleFormComplete: (formData: Record<string, string>) => void;
  config: ChatWidgetConfig;
}

/**
 * Presentational component that renders the UI for the chat view
 * This component doesn't contain any logic, it just renders the UI
 * based on the props it receives
 */
const ChatViewPresentation: React.FC<ChatViewPresentationProps> = React.memo(({ 
  conversation,
  chatViewStyle,
  messages,
  messageText,
  setMessageText,
  isTyping,
  remoteIsTyping,
  handleSendMessage,
  handleUserTyping,
  handleFileUpload,
  handleEndChat,
  readReceipts,
  onBack,
  showSearch,
  toggleSearch,
  searchMessages,
  clearSearch,
  searchResultCount,
  isSearching,
  showSearchFeature,
  highlightText,
  messageIds,
  searchTerm,
  agentAvatar,
  userAvatar,
  onMessageReaction,
  handleLoadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  showInlineForm,
  handleFormComplete,
  config
}) => {

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
  
  const chatHeaderComponent = useMemo(() => (
    <ChatViewHeader 
      conversation={conversation} 
      onBack={onBack}
      showSearch={showSearch}
      toggleSearch={toggleSearch}
      searchMessages={searchMessages}
      clearSearch={clearSearch}
      searchResultCount={searchResultCount}
      isSearching={isSearching}
      showSearchFeature={showSearchFeature}
    />
  ), [
    conversation, 
    onBack, 
    showSearch, 
    toggleSearch, 
    searchMessages, 
    clearSearch, 
    searchResultCount, 
    isSearching, 
    showSearchFeature
  ]);
  
  const messageInputComponent = useMemo(() => (
    <MessageInput
      messageText={messageText}
      setMessageText={setMessageText}
      handleSendMessage={handleSendMessage}
      handleFileUpload={handleFileUpload}
      handleEndChat={handleEndChat}
      hasUserSentMessage={isTyping}
      onTyping={handleUserTyping}
      disabled={showInlineForm}
    />
  ), [
    messageText, 
    setMessageText, 
    handleSendMessage, 
    handleFileUpload, 
    handleEndChat, 
    isTyping, 
    handleUserTyping, 
    showInlineForm
  ]);
  
  const messageListComponent = useMemo(() => {
    if (showInlineForm && !conversation.contactIdentified) {
      return null;
    }
    
    return (
      <MessageList 
        messages={messages}
        isTyping={isTyping || remoteIsTyping}
        setMessageText={setMessageText}
        readReceipts={readReceipts}
        onMessageReaction={onMessageReaction}
        searchResults={messageIds}
        highlightMessage={highlightText}
        searchTerm={searchTerm}
        agentAvatar={agentAvatar}
        userAvatar={userAvatar}
        onScrollTop={handleLoadMoreMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMore={isLoadingMore}
        conversationId={conversation.id}
      />
    );
  }, [
    messages,
    isTyping,
    remoteIsTyping,
    setMessageText,
    readReceipts,
    onMessageReaction,
    messageIds,
    highlightText,
    searchTerm,
    agentAvatar,
    userAvatar,
    handleLoadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
    showInlineForm,
    conversation.contactIdentified,
    conversation.id
  ]);

  return (
    <div 
      className="flex flex-col h-[600px] bg-gradient-to-br from-soft-purple-50 to-soft-purple-100 rounded-lg shadow-lg"
      style={chatViewStyle}
    >
      {chatHeaderComponent}
      {inlineFormComponent}
      {messageListComponent}
      {messageInputComponent}
    </div>
  );
});

ChatViewPresentation.displayName = 'ChatViewPresentation';

export default ChatViewPresentation;
