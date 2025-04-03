
import React from 'react';
import { Message, AgentStatus } from '../../types';
import MessageReadReceipt from '../MessageReadReceipt';
import MessageContent from './MessageContent';
import MessageAvatar from './MessageAvatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  showReadReceipt?: boolean;
  readStatus?: { status: 'sent' | 'delivered' | 'read'; timestamp?: Date };
  highlightText?: (text: string) => string[];
  searchTerm?: string;
  agentAvatar?: string;
  userAvatar?: string;
  showEnhancedUI?: boolean;
  agentStatus?: AgentStatus;
  onToggleHighlight?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLast, 
  showReadReceipt = false,
  readStatus,
  highlightText,
  searchTerm,
  agentAvatar,
  userAvatar,
  showEnhancedUI = true,
  agentStatus,
  onToggleHighlight
}) => {
  const isUserMessage = message.role === 'user';
  const msgType = isUserMessage ? 'user' : 'system';
  const hasError = message.status === 'error';
  const isImportant = message.metadata?.important === true;
  
  return (
    <div 
      id={`message-${message.id}`}
      className={cn(
        "flex items-start my-1.5 px-2 group message-animation-enter",
        isImportant && "important-message-container",
        hasError && "opacity-75"
      )}
      data-status={message.status}
    >
      {/* Show avatar for system messages on the left */}
      {!isUserMessage && (
        <MessageAvatar 
          isUserMessage={false}
          agentAvatar={agentAvatar}
          agentStatus={agentStatus}
          agentName={message.sender?.name || 'Agent'}
        />
      )}
      
      <div 
        className={cn(
          `chat-message-${msgType}`,
          message.quickReplies && message.quickReplies.length > 0 && "chat-message-actionable",
          isImportant && "important-message",
          hasError && "border-red-300 bg-red-50 text-red-500"
        )}
      >
        {/* Message Content */}
        <MessageContent 
          message={message} 
          highlightText={highlightText}
          searchTerm={searchTerm}
          isLast={isLast}
          onToggleHighlight={onToggleHighlight}
        />
        
        {/* Show read receipt for user messages */}
        {isUserMessage && isLast && showReadReceipt && readStatus && (
          <MessageReadReceipt 
            status={readStatus.status} 
            timestamp={readStatus.timestamp}
            showEnhancedUI={showEnhancedUI}
          />
        )}
      </div>
      
      {/* Show avatar for user messages on the right */}
      {isUserMessage && (
        <MessageAvatar 
          isUserMessage={true}
          userAvatar={userAvatar}
          userName={message.sender?.name || 'You'}
        />
      )}
    </div>
  );
};

export default MessageBubble;
