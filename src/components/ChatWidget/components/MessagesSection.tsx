
import React, { memo } from 'react';
import { Message } from '../types';
import MessageList from './MessageList';
import ChatBackground from './ChatBackground';

interface MessagesSectionProps {
  messages: Message[];
  isTyping: boolean;
  remoteIsTyping: boolean;
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
}

// Memoize the MessagesSection to prevent unnecessary re-renders
const MessagesSection = memo(({ 
  messages,
  isTyping,
  remoteIsTyping,
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
  isLoadingMore
}: MessagesSectionProps) => {
  console.log("MessagesSection rendering", { messageCount: messages.length });
  
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 bg-opacity-50 relative">
      <ChatBackground />
      <div className="relative z-10">
        <MessageList 
          messages={messages}
          isTyping={isTyping || remoteIsTyping}
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
      </div>
    </div>
  );
});

MessagesSection.displayName = 'MessagesSection';

export default MessagesSection;
