
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { ArrowDown, Star, StarOff } from 'lucide-react';
import { markConversationAsRead } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

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
  onScrollTop?: () => void;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  inlineFormComponent?: React.ReactNode;
  conversationId?: string;
  agentStatus?: 'online' | 'offline' | 'away' | 'busy';
  onToggleHighlight?: (messageId: string) => void;
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
  conversationId,
  agentStatus = 'online',
  onToggleHighlight
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hasViewedMessages, setHasViewedMessages] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState<Record<string, Message['status']>>({});
  const [unreadDivider, setUnreadDivider] = useState<string | null>(null);

  // Find the first unread message
  useEffect(() => {
    if (!hasViewedMessages && messages.length > 0) {
      const lastReadIndex = messages.findIndex(m => m.unread);
      if (lastReadIndex > 0) {
        setUnreadDivider(messages[lastReadIndex].id);
      }
    }
  }, [messages, hasViewedMessages]);

  // Simulate message status progression for improved UX
  useEffect(() => {
    const statusUpdates: Record<string, NodeJS.Timeout[]> = {};
    
    messages.forEach(message => {
      if (message.sender === 'user' && !messageStatuses[message.id]) {
        // Start with 'sending' status
        setMessageStatuses(prev => ({...prev, [message.id]: 'sending'}));
        
        // Create timeouts for status transitions
        const sentTimeout = setTimeout(() => {
          setMessageStatuses(prev => ({...prev, [message.id]: 'sent'}));
        }, 800);
        
        const deliveredTimeout = setTimeout(() => {
          setMessageStatuses(prev => ({...prev, [message.id]: 'delivered'}));
        }, 1500);
        
        statusUpdates[message.id] = [sentTimeout, deliveredTimeout];
      }
      
      // If there's a read receipt, set status to 'read'
      if (readReceipts[message.id]) {
        setMessageStatuses(prev => ({...prev, [message.id]: 'read'}));
        // Clear any existing timeouts
        if (statusUpdates[message.id]) {
          statusUpdates[message.id].forEach(timeout => clearTimeout(timeout));
          delete statusUpdates[message.id];
        }
      }
    });
    
    return () => {
      // Clear all timeouts on cleanup
      Object.values(statusUpdates).forEach(timeouts => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      });
    };
  }, [messages, readReceipts, messageStatuses]);

  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    return currentMsg.sender === prevMsg.sender && 
           currentMsg.type !== 'status' &&
           prevMsg.type !== 'status' &&
           isSameDay(currentMsg.timestamp, prevMsg.timestamp) &&
           currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() < 2 * 60 * 1000;
  };

  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    return !isSameDay(currentMsg.timestamp, prevMsg.timestamp);
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  const isMessageHighlighted = (messageId: string) => {
    return searchResults?.includes(messageId) || false;
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollButton(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current;
    
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
    
    // Show scroll button when not near bottom and have scrolled up
    setShowScrollButton(!isNearBottom && scrollHeight > clientHeight + 200);

    if (scrollTop === 0 && lastScrollTop !== 0 && onScrollTop && hasMoreMessages && !isLoadingMore) {
      onScrollTop();
    }

    if (!hasViewedMessages && conversationId) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }

    setLastScrollTop(scrollTop);
  }, [lastScrollTop, onScrollTop, hasMoreMessages, isLoadingMore, hasViewedMessages, conversationId]);

  useEffect(() => {
    if (conversationId && !hasViewedMessages) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }
  }, [conversationId, hasViewedMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
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

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, autoScroll]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+End to scroll to bottom
      if (e.altKey && e.key === 'End') {
        scrollToBottom();
      }
      
      // Alt+Home to scroll to top (load more messages)
      if (e.altKey && e.key === 'Home' && onScrollTop && hasMoreMessages && !isLoadingMore) {
        onScrollTop();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScrollTop, hasMoreMessages, isLoadingMore]);

  return (
    <ScrollArea 
      className="flex-grow p-4 bg-chat-bg" 
      ref={scrollAreaRef}
      aria-label="Message conversation history"
    >
      <div className="space-y-4">
        {isLoadingMore && (
          <div className="w-full text-center py-2 text-sm text-gray-500">
            <div className="inline-flex items-center gap-2">
              <div className="loading-pulse">Loading previous messages</div>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-vivid-purple animate-spin"></div>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => {
          // Get the enhanced status from our state, or fall back to the message's status
          const messageStatus = messageStatuses[message.id] || message.status;
          
          // Create a new message object with the updated status
          const enrichedMessage = {
            ...message,
            status: messageStatus
          };
          
          const renderedItems = [];
          
          // Add date divider if needed
          if (shouldShowDateDivider(index)) {
            renderedItems.push(
              <div key={`date-${message.id}`} className="date-separator">
                <div className="date">{formatMessageDate(message.timestamp)}</div>
              </div>
            );
          }
          
          // Add unread messages divider if this is the first unread message
          if (unreadDivider === message.id) {
            renderedItems.push(
              <div key="unread-divider" className="w-full flex justify-center my-2">
                <div className="bg-red-100 text-red-600 py-1.5 px-4 rounded-full text-xs font-medium shadow-sm animate-pulse">
                  Unread messages
                </div>
              </div>
            );
          }
          
          // Then add the message itself
          renderedItems.push(
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
              } ${message.important ? 'relative important-message-container' : ''}`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: 0
              }}
              id={message.id}
            >
              {message.important && (
                <div className="absolute -left-1 top-0 h-full w-1 bg-vivid-purple rounded-full"></div>
              )}
              <div className="flex flex-col w-full">
                {message.sender !== 'status' && (
                  <MessageBubble 
                    message={enrichedMessage}
                    setMessageText={setMessageText} 
                    onReact={onMessageReaction}
                    highlightSearchTerm={highlightMessage}
                    searchTerm={searchTerm}
                    isConsecutiveMessage={isConsecutiveMessage(index)}
                    showAvatar={true}
                    avatarUrl={message.sender === 'system' ? agentAvatar : userAvatar}
                    agentStatus={agentStatus}
                    onToggleHighlight={onToggleHighlight ? () => onToggleHighlight(message.id) : undefined}
                    isImportant={message.important}
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
                
                {inlineFormComponent && index === 0 && message.sender === 'system' && (
                  <div className="mt-3 w-full">
                    {inlineFormComponent}
                  </div>
                )}
              </div>
            </div>
          );
          
          return renderedItems;
        })}
        
        {isTyping && (
          <div className="animate-fade-in" style={{ animationDuration: '200ms' }}>
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
      
      {showScrollButton && (
        <Button 
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 rounded-full shadow-md bg-vivid-purple hover:bg-vivid-purple/80 text-white"
          size="sm"
          aria-label="Scroll to latest messages"
          title="Scroll to latest messages (Alt+End)"
        >
          <ArrowDown size={16} />
        </Button>
      )}
    </ScrollArea>
  );
};

export default React.memo(MessageList);
