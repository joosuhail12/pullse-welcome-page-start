
import React, { useRef, useEffect, useState } from 'react';
import { Message, MessageReadStatus } from '../types';
import { Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  setMessageText?: (text: string) => void;
  readReceipts?: Record<string, { status: MessageReadStatus; timestamp?: Date }>;
  onMessageReaction?: (messageId: string, reaction: string) => void;
  searchResults?: string[];
  highlightMessage?: (text: string) => Array<{ text: string; highlighted: boolean }>;
  searchTerm?: string;
  agentAvatar?: string;
  userAvatar?: string;
  onScrollTop?: () => Promise<void>;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  conversationId?: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
  onToggleHighlight?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  setMessageText,
  readReceipts,
  onMessageReaction,
  searchResults = [],
  highlightMessage,
  searchTerm = '',
  agentAvatar,
  userAvatar,
  onScrollTop,
  hasMoreMessages = false,
  isLoadingMore = false,
  conversationId,
  agentStatus,
  onToggleHighlight
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);
  const [hasScrolledToHighlightedMessage, setHasScrolledToHighlightedMessage] = useState(false);
  
  // Check if a message is consecutive (same sender as previous)
  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    return messages[index].sender === messages[index - 1].sender;
  };
  
  // Scroll to the latest message when messages change or typing status changes
  useEffect(() => {
    // If the user manually scrolled up, don't auto-scroll on new messages
    if (autoScroll && prevMessagesLength !== messages.length) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    
    setPrevMessagesLength(messages.length);
  }, [messages, isTyping, autoScroll, prevMessagesLength]);
  
  // Handle scroll event to check if user has scrolled up
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // If scrolled to the bottom, enable auto-scroll
    if (scrollTop >= scrollHeight - clientHeight - 10) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
    
    // If scrolled to the top, trigger loading more messages
    if (scrollTop === 0 && hasMoreMessages && onScrollTop && !isLoadingMore) {
      await onScrollTop();
    }
  };
  
  // Scroll to highlighted message if there's one
  useEffect(() => {
    if (searchResults.length > 0 && !hasScrolledToHighlightedMessage) {
      const firstHighlightedEl = document.getElementById(`message-${searchResults[0]}`);
      if (firstHighlightedEl) {
        firstHighlightedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHasScrolledToHighlightedMessage(true);
      }
    }
  }, [searchResults, hasScrolledToHighlightedMessage]);
  
  // Reset the scroll flag when search changes
  useEffect(() => {
    setHasScrolledToHighlightedMessage(false);
  }, [searchTerm]);
  
  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-bg"
      ref={containerRef}
      onScroll={handleScroll}
    >
      {hasMoreMessages && (
        <div className="flex justify-center py-2">
          {isLoadingMore ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs text-gray-500">Loading more messages...</span>
            </div>
          ) : (
            <button 
              onClick={onScrollTop} 
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Load Previous Messages
            </button>
          )}
        </div>
      )}
      
      {messages.map((message, index) => {
        const isHighlighted = searchResults.includes(message.id);
        const isConsecutive = isConsecutiveMessage(index);
        
        // Get read status for this message
        const readStatus = (readReceipts && readReceipts[message.id])
          ? readReceipts[message.id].status
          : 'sent';
          
        const readTimestamp = (readReceipts && readReceipts[message.id])
          ? readReceipts[message.id].timestamp
          : undefined;
          
        return (
          <div 
            key={message.id}
            id={`message-${message.id}`}
            onClick={() => onToggleHighlight && onToggleHighlight(message.id)}
          >
            <MessageBubble
              message={message}
              highlightText={highlightMessage}
              isHighlighted={isHighlighted}
              userAvatar={userAvatar}
              agentAvatar={agentAvatar}
              onReply={(text) => setMessageText && setMessageText(text)}
              onReaction={onMessageReaction}
              agentStatus={agentStatus}
              readStatus={readStatus}
              readTimestamp={readTimestamp}
            />
          </div>
        );
      })}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end">
          <div className="max-w-[80%] bg-gray-100 rounded-xl p-3 text-gray-600 ml-2">
            <div className="flex space-x-1 items-center h-6">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
