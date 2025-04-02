
import React, { memo, useCallback } from 'react';
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import MessageInputSection from './MessageInputSection';
import PreChatFormSection from './PreChatFormSection';
import MessagesSection from './MessagesSection';

interface ChatContentProps {
  showPreChatForm: boolean;
  messages: Message[];
  isTyping: boolean;
  remoteIsTyping: boolean;
  messageText: string;
  setMessageText: (text: string) => void;
  readReceipts?: Record<string, boolean>;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  searchTerm?: string;
  searchResults?: string[];
  highlightMessage?: (text: string, searchTerm: string) => { text: string; highlighted: boolean }[];
  agentAvatar?: string;
  userAvatar?: string;
  onScrollTop?: () => Promise<void>;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  handleSendMessage: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  hasUserSentMessage: boolean;
  handleUserTyping: () => void;
  handleFormComplete: (formData: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

// Using memo to prevent unnecessary re-renders
const ChatContent = memo<ChatContentProps>(({
  showPreChatForm,
  messages,
  isTyping,
  remoteIsTyping,
  messageText,
  setMessageText,
  readReceipts,
  onMessageReaction,
  searchTerm,
  searchResults,
  highlightMessage,
  agentAvatar,
  userAvatar,
  onScrollTop,
  hasMoreMessages,
  isLoadingMore,
  handleSendMessage,
  handleFileUpload,
  handleEndChat,
  hasUserSentMessage,
  handleUserTyping,
  handleFormComplete,
  config
}: ChatContentProps) => {
  console.log("ChatContent rendering", { 
    messageCount: messages.length, 
    showPreChatForm
  });
  
  // Memoize the form completion handler to prevent unnecessary re-renders
  const memoizedHandleFormComplete = useCallback((formData: Record<string, string>) => {
    console.log("Form complete handler called with data:", formData);
    handleFormComplete(formData);
  }, [handleFormComplete]);
  
  return (
    <>
      {showPreChatForm ? (
        <PreChatFormSection 
          config={config} 
          onFormComplete={memoizedHandleFormComplete} 
        />
      ) : (
        <MessagesSection 
          messages={messages}
          isTyping={isTyping}
          remoteIsTyping={remoteIsTyping}
          setMessageText={setMessageText}
          readReceipts={readReceipts}
          onMessageReaction={onMessageReaction}
          searchResults={searchResults}
          highlightMessage={highlightMessage}
          searchTerm={searchTerm}
          agentAvatar={agentAvatar}
          userAvatar={userAvatar}
          onScrollTop={onScrollTop}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMore}
        />
      )}
      
      <MessageInputSection
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
        onTyping={handleUserTyping}
        disabled={showPreChatForm}
        config={config}
      />
    </>
  );
});

// Adding display name for debugging purposes
ChatContent.displayName = 'ChatContent';

export default ChatContent;
