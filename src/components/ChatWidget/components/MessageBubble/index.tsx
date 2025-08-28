import React, { useState } from 'react';
import { Message, AgentStatus } from '../../types';
import { MessageReadStatus } from '../MessageReadReceipt';
import MessageAvatar from './MessageAvatar';
import MessageStatus from './MessageStatus';
import MessageReactionButtons from './MessageReactionButtons';
import TextMessage from '../MessageTypes/TextMessage';
import FileMessage from '../MessageTypes/FileMessage';
import CardMessage from '../MessageTypes/CardMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import QuickReplyMessage from '../MessageTypes/QuickReplyMessage';
import DataCollectionMessage from '../MessageTypes/DataCollectionMessage';
import CSATMessage from '../MessageTypes/CSATMessage';
import AIMessage from '../MessageTypes/AIMessage';
import WorkflowMessage from '../MessageTypes/WorkflowMessage';
import SystemNotification from '../MessageTypes/SystemNotification';
import { ChatWidgetConfig } from '../../config';
import { cn } from '@/lib/utils';
import { UserActionData } from '../../types';
import { Separator } from '@/components/ui/separator';

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
  handleUserAction?: (action: "csat" | "action_button" | "data_collection", data: Partial<UserActionData>, conversationId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  readReceipt,
  onMessageReaction,
  searchTerm,
  highlightMessage,
  agentAvatar,
  userAvatar,
  agentStatus,
  config,
  handleUserAction
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const isUser = message.sender === 'customer' || message.senderType === 'customer';
  const isAgent = message.sender === 'agent' || message.senderType === 'agent';
  const isSystem = message.sender === 'system' || message.senderType === 'system';
  const isAI = message.sender === 'ai' || message.senderType === 'ai' || message.messageType === 'ai';
  const isWorkflow = message.sender === 'workflow' || message.senderType === 'workflow' || message.messageType === 'workflow';
  const isSystemNotice = message.sender === 'system-notice' || message.senderType === 'system-notice';

  const handleReaction = (emoji: string) => {
    if (onMessageReaction) {
      onMessageReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    switch (message.messageType || message.type) {
      case 'ai':
        return (
          <AIMessage
            text={message.text}
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text}
            timestamp={message.createdAt}
            isTyping={message.metadata?.isTyping}
          />
        );
      case 'workflow':
        return (
          <WorkflowMessage
            text={message.text}
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text}
            timestamp={message.createdAt}
            workflowName={message.metadata?.workflowName}
            status={message.metadata?.status}
          />
        );
      case 'system_status':
      case 'note':
        return (
          <SystemNotification
            text={message.text}
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text}
            type={message.metadata?.notificationType || 'info'}
            timestamp={message.createdAt}
          />
        );
      case 'data_collection':
        return (
          <DataCollectionMessage
            isRequired={message.messageConfig?.required}
            fields={message.messageConfig?.fields || []}
            onSubmit={handleUserAction}
            allowUserAction={message.allowUserAction}
            messageId={message.id}
          />
        );
      case 'csat':
        return (
          <CSATMessage
            scale={message.messageConfig?.scale}
            question={message.messageConfig?.question}
            onSubmit={handleUserAction}
            allowUserAction={message.allowUserAction}
            messageId={message.id}
          />
        );
      case 'action_buttons':
        return (
          <QuickReplyMessage
            options={message.messageConfig?.buttonLabels}
            onSubmit={handleUserAction}
            allowUserAction={message.allowUserAction}
            messageId={message.id}
          />
        );
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
      default:
        return (
          <TextMessage
            text={message.text}
            renderText={text => highlightMessage ? highlightMessage(text).join('') : text}
            highlightText={searchTerm}
            attachmentType={message?.attachmentType}
            attachmentUrl={message?.attachmentUrl}
            textColor={config.colors?.textColor}
          />
        );
    }
  };

  if (isSystemNotice) {
    console.log(message);
    return (
      <div className={`flex items-center justify-center my-6`}>
        <Separator className="flex-grow-0 flex-shrink bg-gray-200 w-16" />
        <div className="mx-4 px-6 py-2 bg-gray-50 rounded-full flex items-center text-xs text-gray-600 shadow-sm border border-gray-100 min-w-0 flex-shrink-0">
          {message.text}
        </div>
        <Separator className="flex-grow-0 flex-shrink bg-gray-200 w-16" />
      </div>
    );
  }

  // For data collection, CSAT, and action buttons messages, render without bubble
  const isSpecialMessage = message.messageType === 'data_collection' ||
    message.type === 'data_collection' ||
    message.messageType === 'csat' ||
    message.messageType === 'action_buttons';

  if (isSpecialMessage) {
    return (
      <div
        className={cn(
          "group relative flex gap-2 px-1 py-3 transition-all duration-300",
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
              senderType={"agent"}
              name={`${message.senderName ?? "Agent"}`}
            />
          </div>
        )}

        {/* Message Content - No bubble wrapper */}
        <div className={cn(
          "relative max-w-[98%] sm:max-w-[90%] lg:max-w-[85%]",
          isUser ? "order-first" : ""
        )}>
          {renderMessageContent()}
        </div>

        {/* User Avatar - Right side */}
        {isUser && (
          <div className="flex-shrink-0 relative">
            <MessageAvatar
              avatar={userAvatar}
              alt="You"
              isAgent={false}
              size="sm"
              senderType={"customer"}
              name={`${message.senderName ?? "New Customer"}`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex gap-2 px-1 py-3 transition-all duration-300",
        isUser ? "justify-end" : "justify-start",
        "hover:bg-gradient-to-r hover:from-transparent hover:via-gray-50/40 hover:to-transparent",
        "animate-subtle-fade-in"
      )}
      role="article"
      aria-label={`Message from ${isUser ? 'you' : isSystem ? 'system' : isAI ? 'AI' : isWorkflow ? 'workflow' : 'agent'}`}
    >
      {/* Agent/System/AI/Workflow Avatar - Left side */}
      {(isAgent || isAI || isWorkflow || isSystem) && (
        <div className="flex-shrink-0 relative">
          <MessageAvatar
            src={agentAvatar}
            alt={isAI ? "AI" : isWorkflow ? "Workflow" : isSystem ? "System" : "Agent"}
            isAgent={true}
            agentStatus={agentStatus}
            size="sm"
            senderType={message.senderType}
          />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "relative max-w-[90%] sm:max-w-[80%] lg:max-w-[75%]",
        isUser ? "order-first" : ""
      )}>
        {/* Message Bubble */}
        <div
          className={cn(
            "relative transition-all duration-300 px-4 py-3 rounded-2xl border shadow-sm backdrop-blur-sm",
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
            ...((isAgent || isAI || isWorkflow || isSystem) && config.colors?.agentMessageBackgroundColor && {
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
        {/* <div className={cn(
          "mt-2 px-2",
          isUser ? "text-right" : "text-left"
        )}>
          <MessageStatus
            status={readReceipt?.status}
            timestamp={message.createdAt}
            isFileMessage={message.type === 'file'}
            fileUploading={message.metadata?.uploading}
          />
        </div> */}

        {/* Message Status */}

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
            avatar={userAvatar}
            alt="You"
            isAgent={false}
            size="sm"
            senderType={"customer"}
            name={`${message.senderName ?? "New Customer"}`}
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
