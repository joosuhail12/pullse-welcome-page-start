
import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import { MessageReadStatus } from './MessageReadReceipt';
import MessageAvatar from './MessageBubble/MessageAvatar';
import { AgentStatus } from '../types';
import DateSeparator from './DateSeparator';
import { isSameDay } from 'date-fns';

interface MessageListProps {
  messages: any[];
  isTyping?: boolean;
  setMessageText?: (text: string) => void;
  readReceipts?: Record<string, { status: MessageReadStatus; timestamp?: Date }>;
  onMessageReaction?: (messageId: string, emoji: string) => void;
  searchResults?: string[];
  highlightMessage?: (text: string) => string[];
  searchTerm?: string;
  agentAvatar?: string;
  userAvatar?: string;
  onScrollTop?: () => Promise<void>;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  conversationId?: string;
  agentStatus?: AgentStatus;
  onToggleHighlight?: (messageId: string) => void;
  typingDuration?: number;
  config: ChatWidgetConfig;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping = false,
  setMessageText,
  readReceipts = {},
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
  agentStatus = 'online',
  onToggleHighlight,
  typingDuration = 0,
  config
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [isScrolledToSearchResult, setIsScrolledToSearchResult] = useState(false);

  const isAutoScrollingRef = useRef(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (messages.length && !searchResults.length && isAtBottom && !isAutoScrollingRef.current) {
      scrollToBottom();
    }
  }, [messages, isTyping, searchResults.length]);

  useEffect(() => {
    if (searchResults.length && !isScrolledToSearchResult) {
      const firstResultId = searchResults[0];
      const messageElement = document.getElementById(`message-${firstResultId}`);

      if (messageElement) {
        isAutoScrollingRef.current = true;
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          isAutoScrollingRef.current = false;
          setIsScrolledToSearchResult(true);
        }, 500);
      }
    } else if (!searchResults.length) {
      setIsScrolledToSearchResult(false);
    }
  }, [searchResults, isScrolledToSearchResult]);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      const isScrollingUp = scrollTop < lastScrollTop.current;
      lastScrollTop.current = scrollTop;

      const isCloseToBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setIsAtBottom(isCloseToBottom);

      setShowScrollButton(!isCloseToBottom && isScrollingUp);

      if (scrollTop === 0 && onScrollTop && hasMoreMessages && !isLoadingMore) {
        onScrollTop();
      }
    };

    if (!hasInitiallyScrolled && messages.length > 0) {
      scrollToBottom();
      setHasInitiallyScrolled(true);
    }

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [messages, hasInitiallyScrolled, onScrollTop, hasMoreMessages, isLoadingMore]);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      isAutoScrollingRef.current = true;
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        isAutoScrollingRef.current = false;
        setShowScrollButton(false);
      }, 500);
    }
  };

  const getReadReceipt = (messageId: string) => {
    return readReceipts[messageId] || { status: 'sent' as MessageReadStatus };
  };

  // Process messages to add date separators and identify consecutive messages
  const processedMessages = React.useMemo(() => {
    if (!messages.length) return [];

    const result: Array<{
      type: 'message' | 'date';
      message?: any;
      date?: Date;
      isConsecutive: boolean;
      showAvatar: boolean;
    }> = [];

    let lastDate: Date | null = null;
    let lastSender: string | null = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);

      // Add date separator if it's a different day
      if (!lastDate || !isSameDay(messageDate, lastDate)) {
        result.push({
          type: 'date',
          date: messageDate,
          isConsecutive: false,
          showAvatar: true
        });
        lastDate = messageDate;
        lastSender = null; // Reset sender after date change
      }

      // Check if this is a consecutive message from the same sender
      const isConsecutiveMessage = message.sender === lastSender && message.sender !== 'system';

      // Always show avatar for the first message of a group and for system messages
      const showAvatar = !isConsecutiveMessage || message.sender === 'system';

      result.push({
        type: 'message',
        message,
        isConsecutive: isConsecutiveMessage,
        showAvatar
      });

      lastSender = message.sender;
    });

    return result;
  }, [messages]);

  return (
    <div className="relative h-full">
      <ScrollArea className="h-full px-4 pt-2 pb-4" ref={scrollAreaRef}>
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-vivid-purple" />
            </div>
          </div>
        )}

        {hasMoreMessages && !isLoadingMore && (
          <div className="text-center text-xs text-gray-500 py-2">
            <button
              onClick={onScrollTop}
              className="px-2 py-1 rounded hover:bg-gray-100 text-vivid-purple"
            >
              Load more messages
            </button>
          </div>
        )}

        {processedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <DateSeparator
                key={`date-${index}`}
                date={item.date!}
              />
            );
          }

          const message = item.message!;
          const isLastMessage = index === processedMessages.length - 1;
          const isHighlighted = searchResults.includes(message.id);
          const readReceipt = getReadReceipt(message.id);

          return (
            <div
              key={message.id}
              ref={isLastMessage ? lastMessageRef : undefined}
              id={`message-${message.id}`}
              className={item.isConsecutive ? 'mt-1' : 'mt-4'} // Less margin for consecutive messages
            >
              <MessageBubble
                message={message}
                searchTerm={searchTerm}
                isHighlighted={isHighlighted}
                userAvatar={userAvatar}
                agentAvatar={agentAvatar}
                onReply={setMessageText}
                onReaction={onMessageReaction}
                agentStatus={message.sender === 'agent' ? agentStatus : undefined}
                readStatus={readReceipt.status}
                readTimestamp={readReceipt.timestamp}
                onToggleHighlight={onToggleHighlight ? () => onToggleHighlight(message.id) : undefined}
                showAvatar={item.showAvatar}
                isConsecutive={item.isConsecutive}
                config={config}
              />
            </div>
          );
        })}
        {/* TODO: Fix the typing indicator */}
        {/* {isTyping && (
          <div className="flex items-end mb-4">
            <MessageAvatar
              isUserMessage={false}
              userAvatar={userAvatar}
              agentAvatar={agentAvatar}
              agentStatus={agentStatus}
            />
            <TypingIndicator typingDuration={typingDuration} />
          </div>
        )} */}
      </ScrollArea>

      {showScrollButton && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 h-8 w-8 rounded-full p-0 shadow-md"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageList;
