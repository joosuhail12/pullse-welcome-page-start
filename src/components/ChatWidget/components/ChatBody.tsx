
import React, { useEffect, useState } from 'react';
import { Message } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PoweredByBar from './PoweredByBar';
import { MessageReadStatus } from './MessageReadReceipt';

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
  onMessageReaction?: (messageId: string, reaction: string) => void;
  searchTerm: string;
  messageIds: string[];
  highlightMessage: (text: string) => string[];
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
  highlightMessage,
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
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingDuration, setTypingDuration] = useState(0);
  
  // Track how long typing has been active
  useEffect(() => {
    if (remoteIsTyping && !typingStartTime) {
      setTypingStartTime(Date.now());
    } else if (!remoteIsTyping && typingStartTime) {
      setTypingStartTime(null);
      setTypingDuration(0);
    }
  }, [remoteIsTyping, typingStartTime]);
  
  // Update typing duration while typing is active
  useEffect(() => {
    if (!typingStartTime) return;
    
    const intervalId = setInterval(() => {
      setTypingDuration(Date.now() - typingStartTime);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [typingStartTime]);

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
            highlightMessage={highlightMessage}
            searchTerm={searchTerm}
            agentAvatar={agentAvatar}
            userAvatar={userAvatar}
            onScrollTop={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            conversationId={conversationId}
            agentStatus={agentStatus}
            onToggleHighlight={onToggleHighlight}
            typingDuration={typingDuration}
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
