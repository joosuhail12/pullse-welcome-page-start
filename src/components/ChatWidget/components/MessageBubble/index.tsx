
import React from 'react';
import { Message, AgentStatus, MessageReadStatus } from '../../types';
import MessageReadReceipt from '../MessageReadReceipt';
import MessageContent from './MessageContent';
import MessageAvatar from './MessageAvatar';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  showReadReceipt?: boolean;
  readStatus?: MessageReadStatus;
  readTimestamp?: Date;
  searchTerm?: string;
  isHighlighted?: boolean;
  agentAvatar?: string;
  userAvatar?: string;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  agentStatus?: AgentStatus;
  onReply?: (text: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onToggleHighlight?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLast = false, 
  showReadReceipt = false,
  readStatus,
  readTimestamp,
  searchTerm,
  isHighlighted,
  agentAvatar,
  userAvatar,
  showAvatar = true,
  isConsecutive = false,
  agentStatus,
  onReply,
  onReaction,
  onToggleHighlight
}) => {
  const isUserMessage = message.role === 'user' || message.sender === 'user';
  const msgType = isUserMessage ? 'user' : 'system';
  const hasError = message.status === 'error';
  const isImportant = message.metadata?.important === true;
  
  // Get agent or user name safely
  const getDisplayName = () => {
    if (typeof message.sender === 'object' && message.sender?.name) {
      return message.sender.name;
    }
    return isUserMessage ? 'You' : 'Agent';
  };
  
  return (
    <div 
      id={`message-${message.id}`}
      className={cn(
        "flex items-start my-2 px-2 group message-animation-enter",
        isUserMessage ? "justify-end" : "justify-start",
        isImportant && "important-message-container",
        hasError && "opacity-75",
        isConsecutive ? "mt-1" : "mt-3"
      )}
      data-status={message.status}
    >
      {/* Show avatar for system messages on the left */}
      {!isUserMessage && showAvatar && (
        <div className={cn(isConsecutive ? "opacity-0 invisible" : "")}>
          <MessageAvatar 
            isUserMessage={false}
            userAvatar={userAvatar}
            agentAvatar={agentAvatar}
            agentStatus={agentStatus}
          />
        </div>
      )}
      
      <div 
        className={cn(
          `chat-message-${msgType}`,
          message.quickReplies && message.quickReplies.length > 0 && "chat-message-actionable",
          isImportant && "important-message",
          hasError && "border-red-300 bg-red-50 text-red-500",
          isConsecutive && !isUserMessage ? "ml-10" : "",
          isConsecutive && isUserMessage ? "mr-10" : ""
        )}
      >
        {/* Sender name for grouped messages */}
        {!isConsecutive && !isUserMessage && (
          <div className="text-xs text-gray-500 mb-1 font-medium">
            {getDisplayName()}
          </div>
        )}
        
        {/* Message Content */}
        <MessageContent 
          message={message} 
          searchTerm={searchTerm}
          onToggleHighlight={onToggleHighlight}
        />
        
        {/* Show read receipt for user messages */}
        {isUserMessage && isLast && showReadReceipt && readStatus && (
          <MessageReadReceipt 
            status={readStatus}
            timestamp={readTimestamp}
          />
        )}
      </div>
      
      {/* Show avatar for user messages on the right */}
      {isUserMessage && showAvatar && (
        <div className={cn(isConsecutive ? "opacity-0 invisible" : "")}>
          <MessageAvatar 
            isUserMessage={true}
            userAvatar={userAvatar}
            agentAvatar={agentAvatar}
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
