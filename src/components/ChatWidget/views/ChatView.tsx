
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Send, Paperclip, Smile, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'status';
  timestamp: Date;
  type?: 'text' | 'file' | 'card' | 'quick_reply' | 'status';
  fileUrl?: string;
  fileName?: string;
  cardData?: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons?: Array<{ text: string; action: string }>;
  };
  quickReplies?: Array<{ text: string; action: string }>;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  agentInfo?: {
    name: string;
    avatar?: string;
  };
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
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const simulateAgentTyping = () => {
      if (!hasUserSentMessage) return;
      
      const randomTimeout = Math.floor(Math.random() * 10000) + 5000;
      const typingTimeout = setTimeout(() => {
        setIsTyping(true);
        
        const typingDuration = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          setIsTyping(false);
          
          const responseDelay = Math.floor(Math.random() * 400) + 200;
          setTimeout(() => {
            const responses = [
              "Thank you for your message. Is there anything else I can help with?",
              "I appreciate your inquiry. Let me know if you need further assistance.",
              "I've made a note of your request. Is there any other information you'd like to provide?",
              "Thanks for sharing that information. Do you have any other questions?"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const systemMessage: Message = {
              id: `msg-${Date.now()}-system`,
              text: randomResponse,
              sender: 'system',
              timestamp: new Date(),
              type: 'text'
            };
            
            setMessages(prev => [...prev, systemMessage]);
          }, responseDelay);
        }, typingDuration);
      }, randomTimeout);
      
      return () => clearTimeout(typingTimeout);
    };
    
    const typingInterval = setInterval(simulateAgentTyping, 15000);
    return () => clearInterval(typingInterval);
  }, [hasUserSentMessage]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages([...messages, userMessage]);
    setMessageText('');
    
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const systemMessage: Message = {
        id: `msg-${Date.now()}-system`,
        text: 'Thank you for your message. How else can I assist you today?',
        sender: 'system',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }, Math.floor(Math.random() * 400) + 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessageText(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    const fileMessage: Message = {
      id: `msg-${Date.now()}-user-file`,
      text: `Uploaded: ${file.name}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file)
    };
    
    setMessages([...messages, fileMessage]);
    
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }
    
    e.target.value = '';
    
    setTimeout(() => {
      const systemMessage: Message = {
        id: `msg-${Date.now()}-system`,
        text: `I've received your file ${file.name}. Is there anything specific you'd like me to help with regarding this file?`,
        sender: 'system',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }, 1000);
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'file':
        return (
          <div className="flex flex-col">
            <p>{message.text}</p>
            <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center">
              <Paperclip size={16} className="mr-2" />
              <span className="text-sm text-blue-600 underline">{message.fileName}</span>
            </div>
          </div>
        );
      
      case 'card':
        if (!message.cardData) return <p>{message.text}</p>;
        
        return (
          <Card className="w-full max-w-xs mt-2">
            {message.cardData.imageUrl && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={message.cardData.imageUrl} 
                  alt={message.cardData.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-3">
              <h4 className="font-semibold">{message.cardData.title}</h4>
              <p className="text-sm text-gray-600">{message.cardData.description}</p>
              
              {message.cardData.buttons && message.cardData.buttons.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {message.cardData.buttons.map((button, i) => (
                    <Button 
                      key={i} 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'quick_reply':
        return (
          <div className="flex flex-col">
            <p>{message.text}</p>
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.quickReplies.map((reply, i) => (
                  <Button 
                    key={i} 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs py-1 h-auto"
                    onClick={() => {
                      setMessageText(reply.text);
                    }}
                  >
                    {reply.text}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'status':
        return (
          <div className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-500 text-center">
            {message.text}
          </div>
        );
      
      case 'text':
      default:
        return <p>{message.text}</p>;
    }
  };

  const handleEndChat = () => {
    const statusMessage: Message = {
      id: `msg-${Date.now()}-status`,
      text: 'Chat ended',
      sender: 'status',
      timestamp: new Date(),
      type: 'status'
    };
    
    setMessages(prev => [...prev, statusMessage]);
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
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            {conversation.agentInfo?.avatar ? (
              <AvatarImage src={conversation.agentInfo.avatar} alt="Agent" />
            ) : (
              <AvatarFallback className="bg-vivid-purple text-white">
                {conversation.agentInfo?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-2">
            <h3 className="text-sm font-medium">
              {conversation.agentInfo?.name || 'Agent'}
            </h3>
          </div>
        </div>
      </div>
      
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
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-vivid-purple text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {renderMessage(message)}
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
              
              {message.sender === 'status' && (
                <div className="w-full flex justify-center">
                  {renderMessage(message)}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-3">
        <div className="flex flex-col">
          <div className="flex items-center">
            <label htmlFor="file-upload" className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
              <Paperclip size={18} className="text-gray-500" />
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
            
            <div className="relative flex-grow mx-2">
              <Textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-grow min-h-[40px] max-h-[120px] p-2 border rounded-md focus:outline-none resize-none pr-10"
                rows={1}
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <Smile size={18} className="text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-auto p-0 border-none">
                  <div className="emoji-picker-container">
                    <Picker 
                      data={data} 
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="h-auto rounded-md bg-vivid-purple hover:bg-vivid-purple/90 p-2"
            >
              <Send size={18} />
            </Button>
          </div>
          
          {hasUserSentMessage && (
            <div className="flex justify-center mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEndChat}
                className="text-xs text-gray-500"
              >
                <X size={14} className="mr-1" /> End chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
