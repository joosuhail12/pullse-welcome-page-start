import React, { useState, lazy, Suspense } from 'react';
import { MessageType, UserType, AgentStatus } from '../../types';
import TextMessage from '../MessageTypes/TextMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import MessageStatus from './MessageStatus';
import MessageAvatar from './MessageAvatar';
import MessageReactionButtons from './MessageReactionButtons';
import MessageReadReceipt, { MessageReadStatus } from '../MessageReadReceipt';
import { cn } from '@/lib/utils';
import { Paperclip, ThumbsUp, ThumbsDown } from 'lucide-react';
import { sanitizeInput } from '../../utils/validation';
import { ChatWidgetConfig } from '../../config';

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
    type?: MessageType;
    sender: UserType;
    senderType?: 'user' | 'agent' | 'system';
    messageType?: 'text' | 'data_collection' | 'action_buttons' | 'csat' | 'mention' | 'note';
    messageConfig?: string[];
    createdAt: Date;
    metadata?: Record<string, any>;
    reactions?: string[];
    fileName?: string;
    cardData?: {
      title: string;
      description: string;
      imageUrl?: string;
      buttons?: Array<{ text: string; action: string }>;
    };
    quickReplies?: Array<{ text: string; action: string }>;
    reaction?: 'thumbsUp' | 'thumbsDown' | null;
  };
  highlightText?: string;
  isHighlighted?: boolean;
  userAvatar?: string;
  agentAvatar?: string;
  onReply?: (text: string, messageId?: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  agentStatus?: AgentStatus;
  readStatus?: MessageReadStatus;
  readTimestamp?: Date;
  searchTerm?: string;
  onToggleHighlight?: () => void;
  highlightSearchTerm?: (text: string, term: string) => { text: string; highlighted: boolean }[];
  showAvatar?: boolean;
  isConsecutive?: boolean;
  config: ChatWidgetConfig;
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
  readTimestamp,
  searchTerm,
  onToggleHighlight,
  showAvatar = true,
  isConsecutive = false,
  config
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

  const isUserMessage = message.sender === 'user';
  const isBotMessage = message.sender === 'bot' || message.sender === 'agent';
  const isSystemMessage = message.sender === 'system';

  const getStatusBasedClasses = () => {
    if (!isBotMessage || !agentStatus) return '';

    switch (agentStatus) {
      case 'online':
        return 'border-l-4 border-l-green-500';
      case 'busy':
        return 'border-l-4 border-l-amber-500';
      case 'away':
        return 'border-l-4 border-l-yellow-400';
      case 'offline':
        return 'border-l-4 border-l-gray-400';
      default:
        return '';
    }
  };

  const getConsecutiveClasses = () => {
    if (!isConsecutive) return '';

    if (isUserMessage) {
      return 'rounded-t-md rounded-bl-md rounded-br-sm mt-1';
    } else if (isBotMessage) {
      return 'rounded-t-md rounded-br-md rounded-bl-sm mt-1';
    }

    return '';
  };


  const messageTypeClass = isUserMessage
    ? `chat-message-user text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm`
    : isBotMessage
      ? `chat-message-system text-system-bubble-text rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-gray-100 ${getStatusBasedClasses()}`
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

  const sanitizedText = message.text ? sanitizeInput(message.text) : '';

  const renderText = (text: string) => {
    if (searchTerm && searchTerm.length > 0) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, i) =>
            regex.test(part)
              ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
              : <React.Fragment key={i}>{part}</React.Fragment>
          )}
        </>
      );
    } else if (highlightText) {
      return <TextMessage text={text} highlightText={highlightText} />;
    }
    return text;
  };

  const renderMessageContent = () => {
    const type = message.messageType || message.type;
    switch (type) {
      case 'text':
        return <p style={
          {
            width: '70%',
            textAlign: 'left',
            paddingRight: '10px',
            color: config.colors?.textColor
          }
        }
          className="leading-relaxed">{renderText(sanitizedText)}</p>;
      case 'card':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata && <CardMessage metadata={message.metadata} />}
          </Suspense>
        );
      case 'file':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {message.metadata ?
              <FileMessage metadata={message.metadata} /> :
              <div className="flex flex-col">
                {renderText(sanitizedText)}
                <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
                  <Paperclip size={16} className="mr-2" />
                  <span className="text-sm text-blue-600 underline">
                    {message.fileName ? sanitizeInput(message.fileName) : 'File'}
                  </span>
                </div>
              </div>
            }
          </Suspense>
        );
      case 'action_buttons':
        return (
          <Suspense fallback={<LazyLoadFallback />}>
            {
              <QuickReplyMessage
                message={message}
                quickReplies={message.messageConfig}
                onReply={(text) => onReply && onReply(text, message.id)}
              />
            }
          </Suspense>
        );
      case 'status':
        return <StatusMessage text={message.text} />;
      default:
        return <p style={
          {
            color: config.colors?.textColor
          }
        }
          className="leading-relaxed">{renderText(sanitizedText)}</p>;
    }
  };

  const renderReactionButtons = () => {
    if (message.sender === 'system' && onReaction) {
      return (
        <div className="flex gap-2 mt-1.5">
          <button
            className={`p-1 rounded ${message.reaction === 'thumbsUp' ? 'bg-green-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleReaction('thumbsUp')}
            aria-label="Thumbs up"
          >
            <ThumbsUp size={14} className={message.reaction === 'thumbsUp' ? 'text-green-600' : 'text-gray-500'} />
          </button>
          <button
            className={`p-1 rounded ${message.reaction === 'thumbsDown' ? 'bg-red-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleReaction('thumbsDown')}
            aria-label="Thumbs down"
          >
            <ThumbsDown size={14} className={message.reaction === 'thumbsDown' ? 'text-red-600' : 'text-gray-500'} />
          </button>
        </div>
      );
    }
    return null;
  };

  if (message.sender === 'status') {
    return (
      <div className="w-full flex justify-center my-2">
        <div className="bg-gray-100 py-1.5 px-4 rounded-full text-xs text-gray-500 text-center shadow-sm">
          {renderText(sanitizedText)}
        </div>
      </div>
    );
  }

  const avatarSpacing = '' // showAvatar ? '' : isUserMessage ? `mr-${isConsecutive ? '4' : '8'}` : `ml-${isConsecutive ? '4' : '8'}`;

  return (
    <div
      className={cn(
        'group flex items-end relative animate-fade-in',
        messageContainerClass,
        isConsecutive ? 'mb-1' : 'mb-4'
      )}
      onContextMenu={handleLongPress}
    >
      {!isSystemMessage && showAvatar && (
        <MessageAvatar
          isUserMessage={isUserMessage}
          userAvatar={userAvatar}
          agentAvatar={agentAvatar}
          agentStatus={agentStatus}
          userName={message.metadata?.userName || ''}
          agentName={message.metadata?.agentName || ''}
        />
      )}

      {!isSystemMessage && !showAvatar && (
        <div className="w-8 flex-shrink-0"></div>
      )}

      <div
        className={cn(
          'relative max-w-[90%] sm:max-w-md px-4 py-3 flex flex-row justify-between',
          messageTypeClass,
          isHighlighted && 'bg-yellow-100 border-yellow-300',
          isSystemMessage && 'py-2 px-3',
          avatarSpacing
        )}
        onClick={onToggleHighlight}
        style={
          {
            backgroundColor: isUserMessage ? config.colors?.userMessageBackgroundColor || 'transparent' : config.colors?.agentMessageBackgroundColor || 'transparent'
          }
        }
      >
        {renderMessageContent()}

        {<MessageStatus timestamp={message.createdAt} />}

        {/* {isUserMessage && !isConsecutive && (
          <div className="absolute -bottom-4 right-1">
            <MessageReadReceipt
              status={readStatus}
              timestamp={readTimestamp}
            />
          </div>
        )} */}

        {renderReactionButtons()}
      </div>

      {showReactions && onReaction && (
        <MessageReactionButtons
          onReaction={handleReaction}
          onClose={() => setShowReactions(false)}
        />
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
