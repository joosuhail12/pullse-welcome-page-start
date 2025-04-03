import React, { useState, lazy, Suspense } from 'react';
import { Message, MessageReadStatus } from '../../types';
import TextMessage from '../MessageTypes/TextMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import MessageStatus from './MessageStatus';
import MessageAvatar from './MessageAvatar';
import MessageReactionButtons from './MessageReactionButtons';
import MessageReadReceipt from '../MessageReadReceipt';
import { cn } from '@/lib/utils';

// Lazy load less commonly used message types
const CardMessage = lazy(() => import('../MessageTypes/CardMessage'));
const FileMessage = lazy(() => import('../MessageTypes/FileMessage'));
const QuickReplyMessage = lazy(() => import('../MessageTypes/QuickReplyMessage'));

// Loading fallback for lazy components
const LazyLoadFallback = () => (
  <div className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
);

export interface MessageBubbleProps {
  message: Message;
  highlightText?: (text: string) => Array<{ text: string; highlighted: boolean }>;
  isHighlighted?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  onReply?: (text: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
  readStatus?: MessageReadStatus;
  readTimestamp?: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
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
  const isStatusMessage = message.type === 'status';

  const messageTypeClass = isUserMessage
    ? 'bg-vivid-purple text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
    : isBotMessage
    ? 'bg-system-bubble-bg text-system-bubble-text rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-gray-100'
    : isStatusMessage
    ? 'bg-gray-100 text-gray-600 rounded-xl border border-gray-200'
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

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <TextMessage text={message.text} />;
      case 'card':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && <CardMessage data={message.metadata} />}
          </Suspense>
        );
      case 'file':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && <FileMessage data={message.metadata} />}
          </Suspense>
        );
      case 'quick_reply':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && (
              <QuickReplyMessage
                data={message.metadata}
                onSelect={(text) => onReply && onReply(text)}
              />
            )}
          </Suspense>
        );
      case 'status':
        return <StatusMessage text={message.text} />;
      default:
        return <TextMessage text={message.text} />;
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
      {!isStatusMessage && (
        <MessageAvatar
          sender={message.sender}
          avatarUrl={isUserMessage ? userAvatar : agentAvatar}
        />
      )}

      <div
        className={cn(
          'relative max-w-[80%] sm:max-w-md px-4 py-3',
          messageTypeClass,
          isHighlighted && 'bg-yellow-100 border-yellow-300',
          isStatusMessage && 'py-2 px-3'
        )}
      >
        {renderMessageContent()}
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
          onReact={handleReaction}
          onClose={() => setShowReactions(false)}
        />
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
