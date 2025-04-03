
import React from 'react';
import { Message } from '../../types';
import MessageActions from './MessageActions';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  message: Message;
  highlightText?: (text: string) => string[];
  searchTerm?: string;
  isLast?: boolean;
  className?: string;
  onToggleHighlight?: (messageId: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  message,
  highlightText,
  searchTerm,
  isLast,
  className,
  onToggleHighlight
}) => {
  const isImage = message.type === 'image';
  const isFile = message.type === 'file';
  const isUserMessage = message.role === 'user' || message.sender === 'user';

  // Process message text for highlighting if search is active
  const processMessageText = (text: string) => {
    if (searchTerm && highlightText) {
      const parts = highlightText(text);
      
      return parts.map((part, index) => {
        const isHighlighted = searchTerm && part.toLowerCase().includes(searchTerm.toLowerCase());
        return (
          <span 
            key={index} 
            className={cn(isHighlighted ? 'bg-yellow-200 text-gray-900 rounded px-0.5' : '')}
          >
            {part}
          </span>
        );
      });
    }
    
    return text;
  };

  const messageContentClass = cn(
    "message-text break-words whitespace-pre-line",
    isUserMessage ? "text-white" : "text-gray-800",
    className
  );

  return (
    <div className="flex-grow">
      {/* Regular text message */}
      {!isImage && !isFile && (
        <div className={messageContentClass}>
          {processMessageText(message.text)}
        </div>
      )}
      
      {/* Image message */}
      {isImage && message.mediaUrl && (
        <div className="mt-2 rounded overflow-hidden">
          <img 
            src={message.mediaUrl} 
            alt={message.text || "Image message"} 
            className="max-w-full h-auto max-h-96 object-contain rounded"
            loading="lazy"
          />
        </div>
      )}
      
      {/* File message */}
      {isFile && message.mediaUrl && (
        <div className="flex items-center space-x-2 bg-white/90 rounded-md p-2 mt-1">
          <div className="bg-gray-100 p-2 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 2V9H20" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700 truncate">
              {message.text || "File attachment"}
            </span>
            <span className="text-xs text-gray-500">
              {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}
            </span>
          </div>
          <a 
            href={message.mediaUrl} 
            download 
            className="bg-vivid-purple/10 hover:bg-vivid-purple/20 text-vivid-purple rounded-md px-3 py-1 text-sm flex-shrink-0 transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Download
          </a>
        </div>
      )}
      
      {/* Message Actions (e.g., reactions, copy, etc.) */}
      <MessageActions 
        message={message}
        isLast={isLast}
        onToggleHighlight={onToggleHighlight}
      />
    </div>
  );
};

export default MessageContent;
