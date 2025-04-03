import React from 'react';
import { Message } from '../../types';
import { sanitizeInput } from '../../utils/validation';
import MessageAvatar from './MessageAvatar';
import MessageReactionButtons from './MessageReactionButtons';
import FileMessage from '../MessageTypes/FileMessage';
import CardMessage from '../MessageTypes/CardMessage';
import QuickReplyMessage from '../MessageTypes/QuickReplyMessage';
import StatusMessage from '../MessageTypes/StatusMessage';
import TextMessage from '../MessageTypes/TextMessage';

interface MessageBubbleProps {
  message: Message;
  setMessageText?: (text: string) => void;
  onReact?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  highlightSearchTerm?: (text: string, term: string) => { text: string; highlighted: boolean }[];
  searchTerm?: string;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  avatarUrl?: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
}

const MessageBubble = ({ 
  message, 
  setMessageText, 
  onReact,
  highlightSearchTerm,
  searchTerm,
  showAvatar = true,
  isConsecutive = false,
  avatarUrl,
  agentStatus
}: MessageBubbleProps) => {
  const sanitizedText = message.text ? sanitizeInput(message.text) : '';
  
  const handleReaction = (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    if (onReact) {
      onReact(messageId, reaction);
    }
  };

  const hasActionableContent = 
    message.type === 'quick_reply' && message.quickReplies && message.quickReplies.length > 0 ||
    message.type === 'card' && message.cardData && message.cardData.buttons && message.cardData.buttons.length > 0;

  const renderText = (text: string) => {
    if (highlightSearchTerm && searchTerm) {
      const parts = highlightSearchTerm(text, searchTerm);
      return (
        <>
          {parts.map((part, i) => 
            part.highlighted 
              ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part.text}</mark> 
              : <React.Fragment key={i}>{part.text}</React.Fragment>
          )}
        </>
      );
    }
    return text;
  };
  
  const renderMessage = () => {
    switch (message.type) {
      case 'file':
        return <FileMessage 
          text={sanitizedText} 
          fileName={message.fileName}
          renderText={renderText}
        />;
      
      case 'card':
        if (!message.cardData) return <TextMessage text={sanitizedText} renderText={renderText} />;
        return <CardMessage cardData={message.cardData} />;
      
      case 'quick_reply':
        return <QuickReplyMessage 
          text={sanitizedText} 
          quickReplies={message.quickReplies} 
          renderText={renderText}
          setMessageText={setMessageText}
        />;
      
      case 'status':
        return <StatusMessage text={sanitizedText} renderText={renderText} />;
      
      case 'text':
      default:
        return <TextMessage text={sanitizedText} renderText={renderText} />;
    }
  };

  const renderReactionButtons = () => {
    if (message.sender === 'system' && onReact) {
      return (
        <MessageReactionButtons 
          messageId={message.id}
          currentReaction={message.reaction}
          onReact={handleReaction}
        />
      );
    }
    return null;
  };

  const renderAvatar = () => {
    if (!showAvatar || message.sender === 'status' || isConsecutive) return null;
    return (
      <MessageAvatar 
        sender={message.sender} 
        avatarUrl={avatarUrl} 
        isRight={message.sender === 'user'}
        status={message.sender === 'system' ? agentStatus : undefined}
      />
    );
  };

  if (message.sender === 'status') {
    return (
      <div className="w-full flex justify-center">
        {renderMessage()}
      </div>
    );
  }

  const bubbleClasses = isConsecutive
    ? message.sender === 'user'
      ? 'chat-message-user rounded-tr-sm ml-10'
      : 'chat-message-system rounded-tl-sm mr-10'
    : message.sender === 'user'
      ? 'chat-message-user'
      : 'chat-message-system';
      
  const actionableClass = hasActionableContent ? 'chat-message-actionable' : '';

  return (
    <div className="flex items-start">
      {message.sender === 'system' && renderAvatar()}
      <div className={`max-w-[80%] ${bubbleClasses} ${actionableClass}`}>
        {renderMessage()}
        <div className="flex justify-between items-center">
          <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          {renderReactionButtons()}
        </div>
      </div>
      {message.sender === 'user' && renderAvatar()}
    </div>
  );
};

export default MessageBubble;
