
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  setMessageText: (text: string) => void;
}

const MessageList = ({ messages, isTyping, setMessageText }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping]);

  return (
    <ScrollArea className="flex-grow p-3" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' 
                ? 'justify-end' 
                : message.sender === 'status' 
                  ? 'justify-center' 
                  : 'justify-start'
            }`}
          >
            {message.sender !== 'status' && (
              <MessageBubble message={message} setMessageText={setMessageText} />
            )}
            
            {message.sender === 'status' && (
              <div className="w-full flex justify-center">
                <MessageBubble message={message} />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
