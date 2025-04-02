import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Check, CheckCheck } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  setMessageText: (text: string) => void;
  readReceipts?: Record<string, boolean>;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  searchTerm?: string;
  searchResults?: string[];
  highlightMessage?: (text: string, searchTerm: string) => { text: string; highlighted: boolean }[];
  agentAvatar?: string;
  userAvatar?: string;
  onScrollTop?: () => Promise<void>; // Callback for infinite scroll
  hasMoreMessages?: boolean; // Whether there are more messages to load
  isLoadingMore?: boolean; // Whether we're currently loading more messages
  inlineFormComponent?: React.ReactNode; // Prop for inline form component
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
  inlineFormComponent
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });
  const [messagesPerPage, setMessagesPerPage] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalMessages = messages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    return currentMsg.sender === prevMsg.sender && 
           currentMsg.type !== 'status' &&
           prevMsg.type !== 'status' &&
           currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() < 2 * 60 * 1000;
  };

  const isMessageHighlighted = (messageId: string) => {
    return searchResults?.includes(messageId) || false;
  };

  const getPaginatedMessages = useCallback(() => {
    const start = (currentPage - 1) * messagesPerPage;
    const end = Math.min(start + messagesPerPage, totalMessages);
    
    setVisibleRange({ start, end });
    
    return messages.slice(start, end);
  }, [currentPage, messagesPerPage, messages, totalMessages]);
  
  const currentMessages = getPaginatedMessages();

  const handleScroll = useCallback(() => {
    if (!scrollViewportRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollViewportRef.current;
    
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);

    if (scrollTop === 0 && lastScrollTop !== 0 && onScrollTop && hasMoreMessages && !isLoadingMore) {
      onScrollTop().then(() => {
        setCurrentPage(1);
      });
    }

    setLastScrollTop(scrollTop);
  }, [lastScrollTop, onScrollTop, hasMoreMessages, isLoadingMore]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setAutoScroll(false);
  };

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
    if ((autoScroll && messagesEndRef.current) || currentPage === totalPages) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentMessages, isTyping, autoScroll, currentPage, totalPages]);

  const renderReadReceipt = (message: Message) => {
    if (message.sender !== 'user') return null;
    
    return (
      <div className="flex justify-end mt-1 text-xs text-gray-500">
        {message.status === 'read' || readReceipts[message.id] ? (
          <div className="flex items-center text-vivid-purple">
            <CheckCheck size={12} className="text-vivid-purple" />
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="py-2">
        <PaginationContent>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          {totalPages > 5 && (
            <>
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  onClick={() => handlePageChange(totalPages)}
                  isActive={totalPages === currentPage}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {totalMessages > messagesPerPage && (
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-1 rounded-lg shadow-sm">
            {renderPagination()}
          </div>
        )}
        
        {isLoadingMore && (
          <div className="w-full text-center py-2 text-sm text-gray-500">
            <div className="animate-pulse flex justify-center">
              <div className="h-2 w-2 bg-gray-400 rounded-full mx-0.5"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full mx-0.5 animation-delay-200"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full mx-0.5 animation-delay-400"></div>
            </div>
            <div className="mt-1">Loading previous messages...</div>
          </div>
        )}
        
        {currentMessages.map((message, idx) => {
          const index = (currentPage - 1) * messagesPerPage + idx;
          
          return (
            <div 
              key={message.id} 
              className={`flex ${
                message.sender === 'user' 
                  ? 'justify-end' 
                  : message.sender === 'status' 
                    ? 'justify-center' 
                    : 'justify-start'
              } ${isMessageHighlighted(message.id) ? 'bg-yellow-100 p-2 rounded-lg' : ''} ${
                isConsecutiveMessage(index) ? 'mt-1' : 'mt-4'
              }`}
              style={{ 
                animationDelay: `${idx * 50}ms`,
                animationDuration: '300ms'
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
                  />
                )}
                
                {message.sender === 'status' && (
                  <div className="w-full flex justify-center animate-fade-in">
                    <MessageBubble 
                      message={message}
                      highlightSearchTerm={highlightMessage}
                      searchTerm={searchTerm}
                    />
                  </div>
                )}
                
                {inlineFormComponent && idx === 0 && message.sender === 'system' && (
                  <div className="mt-3 w-full animate-fade-in">
                    {inlineFormComponent}
                  </div>
                )}
                
                {renderReadReceipt(message)}
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="animate-fade-in" style={{ animationDuration: '200ms' }}>
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {totalMessages > messagesPerPage && (
          <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-sm py-1 rounded-lg shadow-sm mt-4">
            {renderPagination()}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
