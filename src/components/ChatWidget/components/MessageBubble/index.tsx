
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
      <div className="flex justify-center my-2">
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
      "group relative flex gap-3 px-4 py-3 transition-all duration-200",
      isUser ? "justify-end" : "justify-start",
      "hover:bg-gray-50/30"
    )}>
      {/* Agent Avatar - Left side */}
      {isAgent && (
        <div className="flex-shrink-0">
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
        "relative max-w-[75%] sm:max-w-[65%]",
        isUser ? "order-first" : ""
      )}>
        {/* Message Bubble */}
        <div
          className={cn(
            "relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200",
            "group-hover:shadow-md",
            isUser ? [
              "ml-auto rounded-br-md",
              "bg-gradient-to-br from-blue-500 to-blue-600",
              "text-white",
              "shadow-blue-500/20"
            ] : [
              "mr-auto rounded-bl-md",
              "bg-white border border-gray-200/60",
              "text-gray-800",
              "shadow-gray-500/10"
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

          {/* Message Tail */}
          <div className={cn(
            "absolute w-3 h-3 rotate-45",
            isUser ? [
              "-right-1 bottom-2",
              "bg-gradient-to-br from-blue-500 to-blue-600"
            ] : [
              "-left-1 bottom-2",
              "bg-white border-l border-b border-gray-200/60"
            ]
          )} />
        </div>

        {/* Message Status */}
        <div className={cn(
          "mt-1 px-1",
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
            "flex flex-wrap gap-1 mt-2",
            isUser ? "justify-end" : "justify-start"
          )}>
            {message.reactions.map((reaction, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {reaction}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar - Right side */}
      {isUser && (
        <div className="flex-shrink-0">
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
