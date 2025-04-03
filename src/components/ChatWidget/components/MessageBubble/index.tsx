
import React, { useState } from 'react';
import { MessageType, UserType } from '../../types';
import TextMessage from '../MessageTypes/TextMessage';
import CardMessage from '../MessageTypes/CardMessage';
import FileMessage from '../MessageTypes/FileMessage';
import QuickReplyMessage from '../MessageTypes/QuickReplyMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import MessageStatus from './MessageStatus';
import MessageAvatar from './MessageAvatar';
import MessageReactionButtons from './MessageReactionButtons';
import MessageReadReceipt, { MessageReadStatus } from '../MessageReadReceipt';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    type: MessageType;
    sender: UserType;
    timestamp: Date;
    metadata?: Record<string, any>;
    reactions?: string[];
  };
  highlightText?: string;
  isHighlighted?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  onReply?: (text: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  agentStatus?: 'online' | 'away' | 'offline';
  readStatus?: MessageReadStatus;
  readTimestamp?: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  highlightText,
  isHighlighted,
  userAvatar,
  agentAvatar,
  onReply,
  onReaction,
  agentStatus,
  readStatus = 'sent',
  readTimestamp
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const toggleReactions = () => {
    if (onReaction) {
      setShowReactions(!showReactions);
    }
  };

  const handleReaction = (emoji: string) => {
    if (onReaction) {
      onReaction(message.id, emoji);
      setShowReactions(false);
    }
  };

  // Determine if the message is from the user or the agent
  const isUserMessage = message.sender === 'user';
  const isBotMessage = message.sender === 'bot' || message.sender === 'agent';
  const isSystemMessage = message.sender === 'system';

  const messageTypeClass = isUserMessage
    ? 'bg-vivid-purple text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
    : isBotMessage
    ? 'bg-system-bubble-bg text-system-bubble-text rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-gray-100'
    : 'bg-gray-100 text-gray-600 rounded-xl border border-gray-200';

  const messageContainerClass = isUserMessage
    ? 'ml-auto flex-row-reverse'
    : isBotMessage
    ? 'mr-auto'
    : 'mx-auto max-w-[85%] text-center';

  const handleLongPress = (e: React.MouseEvent) => {
    // Activate reactions on long press
    if (onReaction) {
      e.preventDefault();
      toggleReactions();
    }
  };

  return (
    <div
      className={cn(
        'group flex items-end mb-4 relative animate-fade-in',
        messageContainerClass
      )}
      onContextMenu={handleLongPress}
    >
      {!isSystemMessage && (
        <MessageAvatar
          isUserMessage={isUserMessage}
          userAvatar={userAvatar}
          agentAvatar={agentAvatar}
          agentStatus={agentStatus}
        />
      )}

      <div
        className={cn(
          'relative max-w-[80%] sm:max-w-md px-4 py-3',
          messageTypeClass,
          isHighlighted && 'bg-yellow-100 border-yellow-300',
          isSystemMessage && 'py-2 px-3'
        )}
      >
        {message.type === 'text' && (
          <TextMessage text={message.text} highlightText={highlightText} />
        )}
        {message.type === 'card' && message.metadata && (
          <CardMessage metadata={message.metadata} />
        )}
        {message.type === 'file' && message.metadata && (
          <FileMessage metadata={message.metadata} />
        )}
        {message.type === 'quick_reply' && message.metadata && (
          <QuickReplyMessage
            metadata={message.metadata}
            onReply={(text) => onReply && onReply(text)}
          />
        )}
        {message.type === 'status' && <StatusMessage text={message.text} />}

        <MessageStatus timestamp={message.timestamp} />
        
        {/* Read receipts - Only show for user messages */}
        {isUserMessage && (
          <div className="absolute -bottom-4 right-1">
            <MessageReadReceipt 
              status={readStatus} 
              timestamp={readTimestamp} 
            />
          </div>
        )}
      </div>

      {showReactions && onReaction && (
        <MessageReactionButtons
          onReaction={handleReaction}
          onClose={() => setShowReactions(false)}
        />
      )}
    </div>
  );
};

export default MessageBubble;
