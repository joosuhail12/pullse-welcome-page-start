
import React, { useState, lazy, Suspense } from 'react';
import { MessageType, UserType, MessageReadStatus } from '../../types';
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

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    type?: MessageType;
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
  agentStatus?: 'online' | 'away' | 'offline' | 'busy';
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

  // Render message content based on type
  const renderMessageContent = () => {
    const type = message.type || 'text';
    
    switch (type) {
      case 'text':
        return <TextMessage 
                 text={message.text} 
                 highlightText={highlightText} 
               />;
      case 'card':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && <CardMessage 
                                   title={message.metadata.title || ""}
                                   description={message.metadata.description || ""}
                                   imageUrl={message.metadata.imageUrl}
                                   buttons={message.metadata.buttons}
                                   metadata={message.metadata}
                                 />}
          </Suspense>
        );
      case 'file':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && <FileMessage 
                                   fileName={message.metadata.fileName || "File"}
                                   fileUrl={message.metadata.fileUrl || "#"}
                                   fileType={message.metadata.fileType || "application/octet-stream"}
                                   fileSize={message.metadata.fileSize || 0}
                                   metadata={message.metadata}
                                 />}
          </Suspense>
        );
      case 'quick_reply':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && (
              <QuickReplyMessage
                options={message.metadata.options || []}
                onSelect={(text) => onReply && onReply(text)}
                metadata={message.metadata}
                onReply={(text) => onReply && onReply(text)}
              />
            )}
          </Suspense>
        );
      case 'status':
        return <StatusMessage 
                text={message.text} 
                renderText={(text) => <span>{text}</span>}
               />;
      default:
        return <TextMessage 
                 text={message.text} 
                 highlightText={highlightText} 
               />;
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
          sender={message.sender}
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
          messageId={message.id}
          onReact={onReaction}
          onReaction={handleReaction}
          onClose={() => setShowReactions(false)}
        />
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
