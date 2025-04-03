
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { ArrowDown } from 'lucide-react';
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

  useEffect(() => {
    if (!hasViewedMessages && messages.length > 0) {
      const lastReadIndex = messages.findIndex(m => m.unread);
      if (lastReadIndex > 0) {
        setUnreadDivider(messages[lastReadIndex].id);
      }
    }
  }, [messages, hasViewedMessages]);

  useEffect(() => {
    const statusUpdates: Record<string, NodeJS.Timeout[]> = {};
    
    messages.forEach(message => {
      if (message.sender === 'user' && !messageStatuses[message.id]) {
        setMessageStatuses(prev => ({...prev, [message.id]: 'sending'}));
        
        const sentTimeout = setTimeout(() => {
          setMessageStatuses(prev => ({...prev, [message.id]: 'sent'}));
        }, 800);
        
        const deliveredTimeout = setTimeout(() => {
          setMessageStatuses(prev => ({...prev, [message.id]: 'delivered'}));
        }, 1500);
        
        statusUpdates[message.id] = [sentTimeout, deliveredTimeout];
      }
      
      if (readReceipts[message.id]) {
        setMessageStatuses(prev => ({...prev, [message.id]: 'read'}));
        if (statusUpdates[message.id]) {
          statusUpdates[message.id].forEach(timeout => clearTimeout(timeout));
          delete statusUpdates[message.id];
        }
      }
    });
    
    return () => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'End') {
        scrollToBottom();
      }
      
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
          const messageStatus = messageStatuses[message.id] || message.status;
          
          const enrichedMessage = {
            ...message,
            status: messageStatus
          };
          
          const renderedItems = [];
          
          if (shouldShowDateDivider(index)) {
            renderedItems.push(
              <div key={`date-${message.id}`} className="date-separator">
                <div className="date">{formatMessageDate(message.timestamp)}</div>
              </div>
            );
          }
          
          if (unreadDivider === message.id) {
            renderedItems.push(
              <div key="unread-divider" className="w-full flex justify-center my-2">
                <div className="unread-divider">
                  Unread messages
                </div>
              </div>
            );
          }
          
          renderedItems.push(
            <div 
              key={message.id} 
              className={`w-full message-animation-enter ${
                isMessageHighlighted(message.id) ? 'bg-yellow-100 p-2 rounded-lg' : ''
              } ${
                isConsecutiveMessage(index) ? 'mt-1' : 'mt-4'
              } ${message.important ? 'important-message-container' : ''}`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: 0
              }}
              id={message.id}
            >
              {message.important && (
                <div className="absolute -left-1 top-0 h-full w-1 bg-vivid-purple rounded-full"></div>
              )}
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
              
              {inlineFormComponent && index === 0 && message.sender === 'system' && (
                <div className="mt-3 w-full">
                  {inlineFormComponent}
                </div>
              )}
            </div>
          );
          
          return renderedItems;
        })}
        
        {isTyping && (
          <div className="w-full flex justify-start animate-fade-in" style={{ animationDuration: '200ms' }}>
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
