
import React, { useState, lazy, Suspense } from 'react';
import { Message, MessageType, UserType, AgentStatus } from '../../types';
import TextMessage from '../MessageTypes/TextMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import MessageStatus from './MessageStatus';
import MessageAvatar from './MessageAvatar';
import MessageReactionButtons from './MessageReactionButtons';
import MessageReadReceipt, { MessageReadStatus } from '../MessageReadReceipt';
import { cn } from '@/lib/utils';

const CardMessage = lazy(() => import('../MessageTypes/CardMessage'));
const FileMessage = lazy(() => import('../MessageTypes/FileMessage'));
const QuickReplyMessage = lazy(() => import('../MessageTypes/QuickReplyMessage'));

const LazyLoadFallback = () => (
  <div className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
);

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    type: MessageType;
    sender: UserType;
    timestamp: Date;
    metadata?: Record<string, any>;
    reaction?: 'thumbsUp' | 'thumbsDown' | null;
    reactions?: string[];
    cardData?: {
      title?: string;
      description?: string;
      imageUrl?: string;
      buttons?: Array<{
        text: string;
        url?: string;
        action?: string;
      }>;
    };
    quickReplies?: string[];
  };
  highlightText?: string;
  isHighlighted?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  onReply?: (text: string) => void;
  onReaction?: (messageId: string, emoji: 'thumbsUp' | 'thumbsDown') => void;
  agentStatus?: AgentStatus;
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

  const handleReaction = (emoji: 'thumbsUp' | 'thumbsDown') => {
    if (onReaction) {
      onReaction(message.id, emoji);
      setShowReactions(false);
    }
  };

  const isUserMessage = message.sender === 'user';
  const isBotMessage = message.sender === 'bot' || message.sender === 'agent' || message.sender === 'system';
  const isSystemMessage = message.sender === 'status';

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
    if (onReaction) {
      e.preventDefault();
      toggleReactions();
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return <TextMessage text={message.text} highlightText={highlightText} />;
      case 'card':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            <CardMessage 
              title={message.cardData?.title}
              description={message.cardData?.description}
              imageUrl={message.cardData?.imageUrl}
              metadata={message.metadata}
              buttonText={message.cardData?.buttons?.[0]?.text}
              buttonUrl={message.cardData?.buttons?.[0]?.url}
            />
          </Suspense>
        );
      case 'file':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            <FileMessage 
              fileName={message.fileName}
              fileUrl={message.fileUrl}
              fileType={message.metadata?.fileType}
              fileSize={message.metadata?.fileSize}
              metadata={message.metadata}
            />
          </Suspense>
        );
      case 'quick_reply':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            <QuickReplyMessage
              options={message.quickReplies}
              onReply={(text) => onReply && onReply(text)}
              metadata={message.metadata}
            />
          </Suspense>
        );
      case 'status':
        return <StatusMessage text={message.text} />;
      default:
        return <TextMessage text={message.text} highlightText={highlightText} />;
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
          avatarUrl={isUserMessage ? userAvatar : agentAvatar}
          status={isUserMessage ? undefined : agentStatus}
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
        
        {isUserMessage && (
          <div className="absolute -bottom-4 right-1">
            <MessageReadReceipt 
              status={readStatus} 
              timestamp={readTimestamp} 
            />
          </div>
        )}

        {message.reaction && !showReactions && (
          <div className="absolute -bottom-6 left-0">
            <div className={`p-1 rounded-full ${
              message.reaction === 'thumbsUp' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {message.reaction === 'thumbsUp' ? (
                <span className="flex items-center">
                  <span className="text-green-600 text-xs mr-1">👍</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="text-red-600 text-xs mr-1">👎</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {showReactions && onReaction && (
        <MessageReactionButtons
          onReaction={handleReaction}
          onClose={() => setShowReactions(false)}
          currentReaction={message.reaction}
          animate={true}
        />
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
