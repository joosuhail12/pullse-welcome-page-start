
import React, { useEffect, useState } from 'react';
import { Message, AgentStatus } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PoweredByBar from './PoweredByBar';
import { MessageReadStatus } from './MessageReadReceipt';
import StatusChangeNotification from './StatusChangeNotification';
import EstimatedResponseTime from './EstimatedResponseTime';

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
  agentStatus?: AgentStatus;
  onToggleHighlight?: (messageId: string) => void;
  typingDuration?: number; // Added typingDuration prop
  previousAgentStatus?: AgentStatus; // Added to track status changes
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
  agentStatus = 'online',
  onToggleHighlight,
  typingDuration = 0, // Default value for typingDuration
  previousAgentStatus
}) => {
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [calculatedTypingDuration, setCalculatedTypingDuration] = useState(typingDuration);
  const [lastStatusChange, setLastStatusChange] = useState<Date | null>(null);
  
  // Track how long typing has been active
  useEffect(() => {
    if (remoteIsTyping && !typingStartTime) {
      setTypingStartTime(Date.now());
    } else if (!remoteIsTyping && typingStartTime) {
      setTypingStartTime(null);
      setCalculatedTypingDuration(0);
    }
  }, [remoteIsTyping, typingStartTime]);
  
  // Update typing duration while typing is active
  useEffect(() => {
    if (!typingStartTime) return;
    
    const intervalId = setInterval(() => {
      setCalculatedTypingDuration(Date.now() - typingStartTime);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [typingStartTime]);

  // Track agent status changes
  useEffect(() => {
    if (previousAgentStatus && previousAgentStatus !== agentStatus) {
      setLastStatusChange(new Date());
    }
  }, [agentStatus, previousAgentStatus]);

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      {inlineFormComponent}
      
      {(!showInlineForm || conversationId) && (
        <div className="flex-grow flex flex-col">
          {/* Status indicators */}
          <div className="px-4 pt-2">
            {lastStatusChange && previousAgentStatus && (
              <div className="mb-2">
                <StatusChangeNotification
                  previousStatus={previousAgentStatus}
                  currentStatus={agentStatus}
                  timestamp={lastStatusChange}
                  autoHideDuration={10}
                />
              </div>
            )}
            
            {/* Estimated response time indicator */}
            <div className="flex justify-center mb-3">
              <EstimatedResponseTime agentStatus={agentStatus} />
            </div>
          </div>
        
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
            typingDuration={typingDuration || calculatedTypingDuration}
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
