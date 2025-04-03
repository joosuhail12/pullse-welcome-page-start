
import React from 'react';
import { Message, AgentStatus } from '../types';
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
  readReceipts: Record<string, Date>;
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
  agentStatus?: AgentStatus;
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
            highlightMessage={highlightText}
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
          handleSendMessage={handleSendMessage}
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
