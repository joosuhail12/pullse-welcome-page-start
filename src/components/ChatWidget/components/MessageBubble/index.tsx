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
    return <div className="flex justify-center my-4">
        <StatusMessage text={message.text} type="info" timestamp={message.createdAt} />
      </div>;
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
        return <FileMessage text={message.text} fileName={message.fileName} fileUrl={message.metadata?.fileUrl} renderText={text => highlightMessage ? highlightMessage(text).join('') : text} uploading={message.metadata?.uploading} metadata={message.metadata} />;
      case 'card':
        return <CardMessage cardData={message.cardData} metadata={message.metadata} />;
      case 'quick_reply':
        return <QuickReplyMessage message={message} quickReplies={message.quickReplies} renderText={text => highlightMessage ? highlightMessage(text).join('') : text} setMessageText={setMessageText} metadata={message.metadata} />;
      default:
        return <TextMessage text={message.text} renderText={text => highlightMessage ? highlightMessage(text).join('') : text} highlightText={searchTerm} />;
    }
  };
  return <div className={cn("group relative flex gap-4 px-6 py-5 transition-all duration-500", isUser ? "justify-end" : "justify-start", "hover:bg-gradient-to-r hover:from-transparent hover:via-gray-50/60 hover:to-transparent", "animate-subtle-fade-in")}>
      {/* Agent Avatar - Left side */}
      {isAgent && <div className="flex-shrink-0 relative transform transition-transform duration-300 group-hover:scale-105">
          <MessageAvatar src={agentAvatar} alt="Agent" isAgent={true} agentStatus={agentStatus} size="sm" />
        </div>}

      {/* Message Content */}
      <div className={cn("relative max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]", isUser ? "order-first" : "")}>
        {/* Message Bubble */}
        <div className={cn("relative px-5 py-4 rounded-3xl transition-all duration-500 group-hover:shadow-xl", "backdrop-blur-sm border transform group-hover:scale-[1.01]", isUser ? ["ml-auto rounded-br-md", "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700", "text-white border-blue-300/30", "shadow-lg shadow-blue-500/30", "hover:shadow-2xl hover:shadow-blue-500/40", "before:absolute before:inset-0 before:rounded-3xl before:rounded-br-md", "before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"] : ["mr-auto rounded-bl-md", "bg-white/95 border-gray-200/60", "text-gray-800 shadow-lg shadow-gray-500/15", "hover:bg-white hover:shadow-xl hover:shadow-gray-500/25", "hover:border-gray-300/80"])} style={{
        ...(isUser && config.colors?.userMessageBackgroundColor && {
          background: `linear-gradient(135deg, ${config.colors.userMessageBackgroundColor}, ${config.colors.userMessageBackgroundColor}dd, ${config.colors.userMessageBackgroundColor}aa)`
        }),
        ...(isAgent && config.colors?.agentMessageBackgroundColor && {
          backgroundColor: config.colors.agentMessageBackgroundColor
        })
      }} onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          {/* Message Content */}
          <div className="relative z-10">
            {renderMessageContent()}
          </div>

          {/* Reaction Button */}
          {onMessageReaction && showReactions && <div className="absolute -top-12 left-0 z-20">
              <MessageReactionButtons onReaction={handleReaction} onClose={() => setShowReactions(false)} />
            </div>}

          {/* Modern Message Tail with improved design */}
          
        </div>

        {/* Message Status */}
        <div className={cn("mt-3 px-3", isUser ? "text-right" : "text-left")}>
          <MessageStatus status={readReceipt?.status} timestamp={message.createdAt} isFileMessage={message.type === 'file'} fileUploading={message.metadata?.uploading} />
        </div>

        {/* Message Reactions Display */}
        {message.reactions && message.reactions.length > 0 && <div className={cn("flex flex-wrap gap-2 mt-4", isUser ? "justify-end" : "justify-start")}>
            {message.reactions.map((reaction, index) => <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100/95 hover:bg-gray-200/95 text-xs font-medium transition-all duration-300 cursor-pointer transform hover:scale-110 border border-gray-200/60 shadow-sm hover:shadow-md">
                {reaction}
              </span>)}
          </div>}
      </div>

      {/* User Avatar - Right side */}
      {isUser && <div className="flex-shrink-0 relative transform transition-transform duration-300 group-hover:scale-105">
          <MessageAvatar src={userAvatar} alt="You" isAgent={false} size="sm" />
        </div>}
    </div>;
};
export default MessageBubble;