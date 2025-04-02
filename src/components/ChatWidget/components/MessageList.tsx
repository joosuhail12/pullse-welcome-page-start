
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  setMessageText: (text: string) => void;
  readReceipts?: Record<string, boolean>;
  onMessageReaction?: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => void;
  searchTerm?: string;
  searchResults?: string[];
  highlightMessage?: (text: string, searchTerm: string) => { text: string; highlighted: boolean }[];
}

const MessageList = ({ 
  messages, 
  isTyping, 
  setMessageText, 
  readReceipts = {}, 
  onMessageReaction,
  searchTerm,
  searchResults,
  highlightMessage
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping]);

  // Function to highlight search results
  const isMessageHighlighted = (messageId: string) => {
    return searchResults?.includes(messageId) || false;
  };

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      <div className="space-y-5">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' 
                ? 'justify-end' 
                : message.sender === 'status' 
                  ? 'justify-center' 
                  : 'justify-start'
            } animate-fade-in ${isMessageHighlighted(message.id) ? 'bg-yellow-100 p-2 rounded-lg' : ''}`}
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationDuration: '300ms',
              opacity: 0 // Start with opacity 0, animation will bring to 1
            }}
            id={message.id}
          >
            <div className="flex flex-col">
              {message.sender !== 'status' && (
                <MessageBubble 
                  message={message} 
                  setMessageText={setMessageText} 
                  onReact={onMessageReaction}
                  highlightSearchTerm={highlightMessage}
                  searchTerm={searchTerm}
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
              
              {/* Read receipt indicators for user messages */}
              {message.sender === 'user' && (
                <div className="flex justify-end mt-1 text-xs text-gray-500">
                  {message.status === 'read' || readReceipts[message.id] ? (
                    <div className="flex items-center">
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
              )}
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

export default MessageList;
