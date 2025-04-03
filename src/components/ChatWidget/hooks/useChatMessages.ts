
import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ChatWidgetConfig } from '../config';
import { MessageReadStatus } from '../components/MessageReadReceipt';

export function useChatMessages(
  initialMessages: Message[] = [],
  config?: ChatWidgetConfig
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sending a message
  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    
    // Create a new message
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };
    
    // Add to messages
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Simulate typing indicator
    simulateTypingIndicator();
    
    // Return the new message ID
    return newMessage.id;
  }, []);

  // Clear typing indicator
  const clearTypingIndicator = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
  }, []);

  // Simulate typing indicator
  const simulateTypingIndicator = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear typing indicator after a delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      typingTimeoutRef.current = null;
      
      // For demo purposes, simulate a response
      const responseText = "Thanks for your message! This is a simulated response.";
      const responseMessage: Message = {
        id: uuidv4(),
        text: responseText,
        sender: 'system',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
    }, 2000);
  }, []);

  // Add a system message
  const addSystemMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'system',
      timestamp: new Date(),
      type: 'text',
      status: 'sent' as MessageReadStatus
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    return newMessage.id;
  }, []);

  // Update a message's status
  const updateMessageStatus = useCallback((messageId: string, status: MessageReadStatus) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    sendMessage,
    addSystemMessage,
    updateMessageStatus,
    clearTypingIndicator,
    messagesEndRef
  };
}

export default useChatMessages;
