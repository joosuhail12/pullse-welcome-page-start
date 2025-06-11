
import React, { useState } from 'react';
import { Message, AgentStatus } from '../../types';
import { MessageReadStatus } from '../MessageReadReceipt';
import MessageAvatar from './MessageAvatar';
import MessageStatus from './MessageStatus';
import MessageReactionButtons from './MessageReactionButtons';
import TextMessage from '../MessageTypes/TextMessage';
import FileMessage from '../MessageTypes/FileMessage';
import CardMessage from '../MessageTypes/CardMessage';
import QuickReplyMessage from '../MessageTypes/QuickReplyMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import { ChatWidgetConfig } from '../../config';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
  setMessageText?: (text: string) => void;
  readReceipt?: {
    status: MessageReadStatus;
    timestamp?: Date;
  };
  onMessageReaction?: (messageId: string, reaction: string) => void;
  searchTerm?: string;
  highlightMessage?: (text: string) => string[];
  agentAvatar?: string;
  userAvatar?: string;
  conversationId: string;
  agentStatus?: AgentStatus;
  onToggleHighlight?: (messageId: string) => void;
  typingDuration?: number;
  config: ChatWidgetConfig;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isTyping = false,
  setMessageText,
  readReceipt,
  onMessageReaction,
  searchTerm,
  highlightMessage,
  agentAvatar,
  userAvatar,
  conversationId,
  agentStatus,
  onToggleHighlight,
  typingDuration = 0,
  config
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.sender === 'user' || message.senderType === 'user';
  const isAgent = message.sender === 'agent' || message.senderType === 'agent';
  const isSystem = message.sender === 'system' || message.senderType === 'system';

  // Handle system/status messages separately
  if (isSystem || message.type === 'system' || message.messageType === 'note') {
    return (
      <div className="flex justify-center my-4">
        <StatusMessage text={message.text} type="info" timestamp={message.createdAt} />
      </div>
    );
  }

  const handleReaction = (emoji: string) => {
    if (onMessageReaction) {
      onMessageReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'file':
        return (
          <FileMessage 
            text={message.text} 
            fileName={message.fileName} 
            fileUrl={message.metadata?.fileUrl} 
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text} 
            uploading={message.metadata?.uploading} 
            metadata={message.metadata} 
          />
        );
      case 'card':
        return <CardMessage cardData={message.cardData} metadata={message.metadata} />;
      case 'quick_reply':
        return (
          <QuickReplyMessage 
            message={message} 
            quickReplies={message.quickReplies} 
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text} 
            setMessageText={setMessageText} 
            metadata={message.metadata} 
          />
        );
      default:
        return (
          <TextMessage 
            text={message.text} 
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text} 
            highlightText={searchTerm} 
          />
        );
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex gap-3 px-4 py-4 transition-all duration-300",
        isUser ? "justify-end" : "justify-start",
        "hover:bg-gradient-to-r hover:from-transparent hover:via-gray-50/40 hover:to-transparent",
        "animate-subtle-fade-in"
      )}
      role="article"
      aria-label={`Message from ${isUser ? 'you' : 'agent'}`}
    >
      {/* Agent Avatar - Left side */}
      {isAgent && (
        <div className="flex-shrink-0 relative">
          <MessageAvatar 
            src={agentAvatar} 
            alt="Agent" 
            isAgent={true} 
            agentStatus={agentStatus} 
            size="sm" 
          />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]",
        isUser ? "order-first" : ""
      )}>
        {/* Message Bubble */}
        <div 
          className={cn(
            "relative px-4 py-3 rounded-2xl transition-all duration-300",
            "border shadow-sm backdrop-blur-sm",
            "focus-within:ring-2 focus-within:ring-offset-1",
            isUser ? [
              "ml-auto rounded-br-sm",
              "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
              "text-white border-blue-500/30",
              "shadow-md shadow-blue-600/25",
              "hover:shadow-lg hover:shadow-blue-600/30",
              "focus-within:ring-blue-300"
            ] : [
              "mr-auto rounded-bl-sm",
              "bg-white border-gray-200/80",
              "text-gray-900 shadow-sm shadow-gray-500/10",
              "hover:bg-gray-50/90 hover:shadow-md hover:shadow-gray-500/15",
              "hover:border-gray-300/90",
              "focus-within:ring-gray-300"
            ]
          )}
          style={{
            ...(isUser && config.colors?.userMessageBackgroundColor && {
              background: `linear-gradient(135deg, ${config.colors.userMessageBackgroundColor}, ${config.colors.userMessageBackgroundColor}dd)`
            }),
            ...(isAgent && config.colors?.agentMessageBackgroundColor && {
              backgroundColor: config.colors.agentMessageBackgroundColor
            })
          }}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          tabIndex={0}
          role="group"
          aria-label="Message content"
        >
          {/* Message Content */}
          <div className="relative z-10">
            {renderMessageContent()}
          </div>

          {/* Reaction Button */}
          {onMessageReaction && showReactions && (
            <div className="absolute -top-12 left-0 z-20">
              <MessageReactionButtons 
                onReaction={handleReaction} 
                onClose={() => setShowReactions(false)} 
              />
            </div>
          )}
        </div>

        {/* Message Status */}
        <div className={cn(
          "mt-2 px-2",
          isUser ? "text-right" : "text-left"
        )}>
          <MessageStatus 
            status={readReceipt?.status} 
            timestamp={message.createdAt} 
            isFileMessage={message.type === 'file'} 
            fileUploading={message.metadata?.uploading} 
          />
        </div>

        {/* Message Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn(
            "flex flex-wrap gap-2 mt-3",
            isUser ? "justify-end" : "justify-start"
          )}>
            {message.reactions.map((reaction, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-3 py-1.5 rounded-full 
                         bg-gray-100/95 hover:bg-gray-200/95 
                         text-xs font-medium transition-all duration-200 
                         cursor-pointer transform hover:scale-105 
                         border border-gray-200/60 shadow-sm hover:shadow-md
                         focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                tabIndex={0}
                role="button"
                aria-label={`Reaction: ${reaction}`}
              >
                {reaction}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar - Right side */}
      {isUser && (
        <div className="flex-shrink-0 relative">
          <MessageAvatar 
            src={userAvatar} 
            alt="You" 
            isAgent={false} 
            size="sm" 
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
