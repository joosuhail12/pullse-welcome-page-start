
import React, { useState, useEffect } from 'react';
import { Message, Conversation } from '../types';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
}

const ChatView = ({ conversation, onBack, onUpdateConversation }: ChatViewProps) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || [
      {
        id: 'msg-1',
        text: 'Hello! How can I help you today?',
        sender: 'system',
        timestamp: new Date(),
        type: 'text'
      }
    ]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      const updatedConversation = {
        ...conversation,
        messages: messages,
        lastMessage: messages[messages.length - 1].text,
        timestamp: messages[messages.length - 1].timestamp
      };
      onUpdateConversation(updatedConversation);
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
      <ChatHeader conversation={conversation} onBack={onBack} />
      <MessageList 
        messages={messages}
        isTyping={isTyping}
        setMessageText={setMessageText}
      />
      <MessageInput
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        handleFileUpload={handleFileUpload}
        handleEndChat={handleEndChat}
        hasUserSentMessage={hasUserSentMessage}
      />
    </div>
  );
};

export default ChatView;
