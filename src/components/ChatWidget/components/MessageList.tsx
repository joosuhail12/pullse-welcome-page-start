
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Check, CheckCheck } from 'lucide-react';
import { markConversationAsRead } from '../utils/storage';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  setMessageText: (text: string) => void;
  readReceipts?: Record<string, Date>;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  searchTerm?: string;
  searchResults?: string[];
  highlightMessage?: (text: string, searchTerm: string) => { text: string; highlighted: boolean }[];
  agentAvatar?: string;
  userAvatar?: string;
  onScrollTop?: () => void; // Callback for infinite scroll
  hasMoreMessages?: boolean; // Whether there are more messages to load
  isLoadingMore?: boolean; // Whether we're currently loading more messages
  inlineFormComponent?: React.ReactNode; // New prop for inline form component
  conversationId?: string; // Add conversation ID to mark as read
}

const MessageList = ({ 
  messages, 
  isTyping, 
  setMessageText, 
  readReceipts = {}, 
  onMessageReaction,
  searchTerm,
  searchResults,
  highlightMessage,
  agentAvatar,
  userAvatar,
  onScrollTop,
  hasMoreMessages = false,
  isLoadingMore = false,
  inlineFormComponent,
  conversationId
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hasViewedMessages, setHasViewedMessages] = useState(false);

  // Function to check if a message should be grouped with the previous one
  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    // Group messages if they are from the same sender and within 2 minutes of each other
    return currentMsg.sender === prevMsg.sender && 
           currentMsg.type !== 'status' &&
           prevMsg.type !== 'status' &&
           currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() < 2 * 60 * 1000;
  };

  // Function to highlight search results
  const isMessageHighlighted = (messageId: string) => {
    return searchResults?.includes(messageId) || false;
  };

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current;
    
    // Check if we're near the bottom to enable auto-scroll
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);

    // Check if we're at the top to load more messages (infinite scroll)
    if (scrollTop === 0 && lastScrollTop !== 0 && onScrollTop && hasMoreMessages && !isLoadingMore) {
      onScrollTop();
    }

    // Mark messages as viewed when scrolled
    if (!hasViewedMessages && conversationId) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }

    setLastScrollTop(scrollTop);
  }, [lastScrollTop, onScrollTop, hasMoreMessages, isLoadingMore, hasViewedMessages, conversationId]);

  // Mark messages as viewed when component mounts
  useEffect(() => {
    if (conversationId && !hasViewedMessages) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }
  }, [conversationId, hasViewedMessages]);

  // Get the viewport element from ScrollArea and attach scroll event
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;
        viewport.addEventListener('scroll', handleScroll);
      }
    }

    return () => {
      if (scrollViewportRef.current) {
        scrollViewportRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, autoScroll]);

  // Render read receipt indicator with improved styling
  const renderReadReceipt = (message: Message) => {
    if (message.sender !== 'user') return null;
    
    // Check if there's a read receipt for this message
    const hasReadReceipt = readReceipts[message.id] !== undefined;
    
    return (
      <div className="flex justify-end mt-1 text-xs text-gray-500">
        {message.status === 'read' || hasReadReceipt ? (
          <div className="flex items-center text-vivid-purple">
            <CheckCheck size={12} />
            <span className="ml-1 text-[10px]">Read</span>
          </div>
        ) : message.status === 'delivered' ? (
          <div className="flex items-center">
            <CheckCheck size={12} />
            <span className="ml-1 text-[10px]">Delivered</span>
          </div>
        ) : (
          <div className="flex items-center">
            <Check size={12} />
            <span className="ml-1 text-[10px]">Sent</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="flex-grow p-4 bg-chat-bg" ref={scrollAreaRef}>
      <div className="space-y-4">
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="w-full text-center py-2 text-sm text-gray-500">
            Loading previous messages...
          </div>
        )}
        
        {/* Show messages */}
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' 
                ? 'justify-end' 
                : message.sender === 'status' 
                  ? 'justify-center' 
                  : 'justify-start'
            } message-animation-enter ${isMessageHighlighted(message.id) ? 'bg-yellow-100 p-2 rounded-lg' : ''} ${
              isConsecutiveMessage(index) ? 'mt-1' : 'mt-4'
            }`}
            style={{ 
              animationDelay: `${index * 50}ms`,
              opacity: 0 // Start with opacity 0, animation will bring to 1
            }}
            id={message.id}
          >
            <div className="flex flex-col w-full">
              {message.sender !== 'status' && (
                <MessageBubble 
                  message={message} 
                  setMessageText={setMessageText} 
                  onReact={onMessageReaction}
                  highlightSearchTerm={highlightMessage}
                  searchTerm={searchTerm}
                  isConsecutive={isConsecutiveMessage(index)}
                  showAvatar={true}
                  avatarUrl={message.sender === 'system' ? agentAvatar : userAvatar}
                  agentStatus="online"
                />
              )}
              
              {message.sender === 'status' && (
                <div className="w-full flex justify-center">
                  <MessageBubble 
                    message={message}
                    highlightSearchTerm={highlightMessage}
                    searchTerm={searchTerm}
                  />
                </div>
              )}
              
              {/* Render inline form after the first system message if provided */}
              {inlineFormComponent && index === 0 && message.sender === 'system' && (
                <div className="mt-3 w-full">
                  {inlineFormComponent}
                </div>
              )}
              
              {/* Read receipt indicators for user messages */}
              {renderReadReceipt(message)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="animate-fade-in" style={{ animationDuration: '200ms' }}>
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default React.memo(MessageList);
