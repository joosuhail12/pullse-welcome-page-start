
import React from 'react';
import { Message, MessageType, MessageReadStatus } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PoweredByBar from './PoweredByBar';

interface ChatBodyProps {
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  isTyping: boolean;
  remoteIsTyping: boolean;
  handleSendMessage: () => void;
  handleUserTyping: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndChat: () => void;
  readReceipts: Record<string, { status: MessageReadStatus; timestamp?: Date }>;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  searchTerm: string;
  messageIds: string[];
  highlightText: (text: string, term: string) => { text: string; highlighted: boolean }[];
  agentAvatar?: string;
  userAvatar?: string;
  handleLoadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  showInlineForm: boolean;
  inlineFormComponent: React.ReactNode;
  conversationId: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
  onToggleHighlight?: (messageId: string) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({
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
  onMessageReaction,
  searchTerm,
  messageIds,
  highlightText,
  agentAvatar,
  userAvatar,
  handleLoadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  showInlineForm,
  inlineFormComponent,
  conversationId,
  agentStatus,
  onToggleHighlight
}) => {
  // Create a wrapper for highlightText to match MessageList's expected format
  const highlightWrapper = (text: string) => {
    if (!searchTerm) return [{ text, highlighted: false }];
    return highlightText(text, searchTerm);
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      {inlineFormComponent}
      
      {(!showInlineForm || conversationId) && (
        <div className="flex-grow flex flex-col">
          <MessageList 
            messages={messages}
            isTyping={isTyping || remoteIsTyping}
            setMessageText={setMessageText}
            readReceipts={readReceipts}
            onMessageReaction={onMessageReaction}
            searchResults={messageIds}
            highlightMessage={highlightWrapper}
            searchTerm={searchTerm}
            agentAvatar={agentAvatar}
            userAvatar={userAvatar}
            onScrollTop={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            conversationId={conversationId}
            agentStatus={agentStatus}
            onToggleHighlight={onToggleHighlight}
          />
        </div>
      )}
      
      <div className="flex-shrink-0">
        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          onSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          handleEndChat={handleEndChat}
          hasUserSentMessage={isTyping}
          onTyping={handleUserTyping}
          disabled={showInlineForm}
        />
        
        <PoweredByBar />
      </div>
    </div>
  );
};

export default ChatBody;
