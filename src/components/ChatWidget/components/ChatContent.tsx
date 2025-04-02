
import React from 'react';
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

const ChatContent: React.FC<ChatContentProps> = ({
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
  return (
    <>
      {showPreChatForm ? (
        <PreChatFormSection 
          config={config} 
          onFormComplete={handleFormComplete} 
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
      />
    </>
  );
};

export default ChatContent;
