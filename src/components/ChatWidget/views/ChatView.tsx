
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
}

const ChatView = ({ conversation, onBack }: ChatViewProps) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      text: 'Hello! How can I help you today?',
      sender: 'system',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setMessageText('');
    
    // Simulate response (in a real app, this would call an API)
    setTimeout(() => {
      const systemMessage: Message = {
        id: `msg-${Date.now()}-system`,
        text: 'Thank you for your message. Our team will get back to you shortly.',
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="border-b p-3 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2 p-1 h-8 w-8"
        >
          <ChevronLeft size={16} />
        </Button>
        <h3 className="text-lg font-medium">{conversation.title}</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-3 space-y-3">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-vivid-purple text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
              <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-3">
        <div className="flex">
          <textarea 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow min-h-[40px] max-h-[120px] p-2 border rounded-l-md focus:outline-none resize-none"
            rows={1}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="h-auto rounded-l-none bg-vivid-purple hover:bg-vivid-purple/90"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
