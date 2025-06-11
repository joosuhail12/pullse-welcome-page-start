
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
  readReceipt?: { status: MessageReadStatus; timestamp?: Date };
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
      <div className="flex justify-center my-3">
        <StatusMessage 
          text={message.text} 
          type="info"
          timestamp={message.createdAt}
        />
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
            renderText={(text) => highlightMessage ? highlightMessage(text).join('') : text}
            uploading={message.metadata?.uploading}
            metadata={message.metadata}
          />
        );
      case 'card':
        return (
          <CardMessage 
            cardData={message.cardData}
            metadata={message.metadata}
          />
        );
      case 'quick_reply':
        return (
          <QuickReplyMessage
            message={message}
            quickReplies={message.quickReplies}
            renderText={(text) => highlightMessage ? highlightMessage(text).join('') : text}
            setMessageText={setMessageText}
            metadata={message.metadata}
          />
        );
      default:
        return (
          <TextMessage
            text={message.text}
            renderText={(text) => highlightMessage ? highlightMessage(text).join('') : text}
            highlightText={searchTerm}
          />
        );
    }
  };

  return (
    <div className={cn(
      "group relative flex gap-3 px-4 py-4 transition-all duration-300",
      isUser ? "justify-end" : "justify-start",
      "hover:bg-gradient-to-r hover:from-transparent hover:via-gray-50/40 hover:to-transparent"
    )}>
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
        "relative max-w-[80%] sm:max-w-[70%] lg:max-w-[65%]",
        isUser ? "order-first" : ""
      )}>
        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-4 py-3 rounded-3xl transition-all duration-300 group-hover:shadow-lg",
            "backdrop-blur-sm border",
            isUser ? [
              "ml-auto rounded-br-lg",
              "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
              "text-white border-blue-400/20",
              "shadow-lg shadow-blue-500/25",
              "hover:shadow-xl hover:shadow-blue-500/30"
            ] : [
              "mr-auto rounded-bl-lg",
              "bg-white/95 border-gray-200/80",
              "text-gray-800 shadow-md shadow-gray-500/10",
              "hover:bg-white hover:shadow-lg hover:shadow-gray-500/15"
            ]
          )}
          style={{
            ...(isUser && config.colors?.userMessageBackgroundColor && {
              background: `linear-gradient(135deg, ${config.colors.userMessageBackgroundColor}, ${config.colors.userMessageBackgroundColor}dd, ${config.colors.userMessageBackgroundColor}aa)`
            }),
            ...(isAgent && config.colors?.agentMessageBackgroundColor && {
              backgroundColor: config.colors.agentMessageBackgroundColor
            })
          }}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Message Content */}
          <div className="relative z-10">
            {renderMessageContent()}
          </div>

          {/* Reaction Button */}
          {onMessageReaction && showReactions && (
            <MessageReactionButtons
              onReaction={handleReaction}
              onClose={() => setShowReactions(false)}
            />
          )}

          {/* Modern Message Tail */}
          <div className={cn(
            "absolute w-4 h-4",
            isUser ? [
              "-right-1.5 bottom-3",
              "bg-gradient-to-br from-blue-500 to-indigo-600",
              "clip-path-[polygon(0%_0%,_100%_100%,_0%_100%)]"
            ] : [
              "-left-1.5 bottom-3",
              "bg-white/95 border-l border-b border-gray-200/80",
              "clip-path-[polygon(0%_0%,_100%_0%,_100%_100%)]"
            ],
            "rotate-45 transform"
          )} />
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
            "flex flex-wrap gap-1.5 mt-3",
            isUser ? "justify-end" : "justify-start"
          )}>
            {message.reactions.map((reaction, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100/90 hover:bg-gray-200/90 text-xs font-medium transition-all duration-200 cursor-pointer transform hover:scale-105 border border-gray-200/50"
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
