
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Check, CheckCheck } from 'lucide-react';
import { markConversationAsRead } from '../utils/storage';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

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

// Threshold in pixels to trigger loading more messages
const LOAD_MORE_THRESHOLD = 100;
// Estimated row height for virtual list
const ESTIMATED_ROW_HEIGHT = 80;

const MessageList = React.memo(({ 
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
  const listRef = useRef<List>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hasViewedMessages, setHasViewedMessages] = useState(false);

  // Function to check if a message should be grouped with the previous one
  const isConsecutiveMessage = useCallback((index: number) => {
    if (index === 0) return false;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    
    // Group messages if they are from the same sender and within 2 minutes of each other
    return currentMsg.sender === prevMsg.sender && 
           currentMsg.type !== 'status' &&
           prevMsg.type !== 'status' &&
           currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() < 2 * 60 * 1000;
  }, [messages]);

  // Function to highlight search results
  const isMessageHighlighted = useCallback((messageId: string) => {
    return searchResults?.includes(messageId) || false;
  }, [searchResults]);

  // Handle scroll events
  const handleScroll = useCallback(({ scrollOffset, scrollDirection }: { scrollOffset: number, scrollDirection: "forward" | "backward" }) => {
    // Check if we're near the bottom to enable auto-scroll
    const isNearBottom = scrollDirection === "forward";
    setAutoScroll(isNearBottom);

    // Check if we're at the top to load more messages (infinite scroll)
    if (scrollOffset < LOAD_MORE_THRESHOLD && lastScrollTop > LOAD_MORE_THRESHOLD && onScrollTop && hasMoreMessages && !isLoadingMore) {
      onScrollTop();
    }

    // Mark messages as viewed when scrolled
    if (!hasViewedMessages && conversationId) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }

    setLastScrollTop(scrollOffset);
  }, [lastScrollTop, onScrollTop, hasMoreMessages, isLoadingMore, hasViewedMessages, conversationId]);

  // Mark messages as viewed when component mounts
  useEffect(() => {
    if (conversationId && !hasViewedMessages) {
      setHasViewedMessages(true);
      markConversationAsRead(conversationId)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }
  }, [conversationId, hasViewedMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && listRef.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToItem(messages.length - 1, "end");
      }, 100);
    }
  }, [messages, isTyping, autoScroll]);

  // Render read receipt indicator with improved styling
  const renderReadReceipt = useCallback((message: Message) => {
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
  }, [readReceipts]);

  // Row renderer for virtualized list
  const rowRenderer = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    // Check if this is a special row for loading indicator
    if (index === 0 && isLoadingMore) {
      return (
        <div style={style} className="w-full text-center py-2 text-sm text-gray-500">
          Loading previous messages...
        </div>
      );
    }
    
    // Adjust index if loading indicator is present
    const messageIndex = isLoadingMore ? index - 1 : index;
    
    // Return placeholder for loading indicator row
    if (messageIndex < 0) return <div style={style}></div>;
    
    // Return empty space for typing indicator row
    if (messageIndex === messages.length) {
      return (
        <div style={style}>
          {isTyping && (
            <div className="animate-fade-in" style={{ animationDuration: '200ms' }}>
              <TypingIndicator />
            </div>
          )}
        </div>
      );
    }
    
    // Return empty row for end padding
    if (messageIndex > messages.length) return <div style={style}></div>;
    
    // Get the actual message
    const message = messages[messageIndex];
    
    return (
      <div 
        style={{
          ...style,
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: isConsecutiveMessage(messageIndex) ? '4px' : '16px'
        }} 
        key={message.id} 
        className={`flex ${
          message.sender === 'user' 
            ? 'justify-end' 
            : message.sender === 'status' 
              ? 'justify-center' 
              : 'justify-start'
        } animate-fade-in ${isMessageHighlighted(message.id) ? 'bg-yellow-100 rounded-lg' : ''}`}
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
              isConsecutive={isConsecutiveMessage(messageIndex)}
              showAvatar={true}
              avatarUrl={message.sender === 'system' ? agentAvatar : userAvatar}
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
          {inlineFormComponent && messageIndex === 0 && message.sender === 'system' && (
            <div className="mt-3 w-full">
              {inlineFormComponent}
            </div>
          )}
          
          {/* Read receipt indicators for user messages */}
          {renderReadReceipt(message)}
        </div>
      </div>
    );
  }, [
    messages, 
    isTyping, 
    setMessageText, 
    onMessageReaction, 
    highlightMessage, 
    searchTerm, 
    isConsecutiveMessage, 
    isMessageHighlighted, 
    agentAvatar, 
    userAvatar,
    inlineFormComponent,
    renderReadReceipt,
    isLoadingMore
  ]);

  // Calculate the total number of items to render
  const itemCount = messages.length + (isTyping ? 1 : 0) + (isLoadingMore ? 1 : 0);

  // Check if there are messages to show
  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 bg-chat-bg h-full text-gray-500">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 bg-chat-bg h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={ESTIMATED_ROW_HEIGHT}
            onScroll={handleScroll}
            overscanCount={5} // Render extra items for smoother scrolling
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            style={{ overflow: 'auto' }}
          >
            {rowRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
