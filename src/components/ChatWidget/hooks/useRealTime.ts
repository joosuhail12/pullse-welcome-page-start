
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageStatus, ReadReceipt, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { simulateAgentTyping } from '../utils/simulateAgentTyping';
import { markMessageAsRead } from '../utils/messageHandlers';

// Real-time message and status handling for chat
export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: Conversation,
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, ReadReceipt>>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestMessageRef = useRef<string | null>(null);
  const sessionId = getChatSessionId();
  const isTicketConversation = conversation.id.includes('ticket-');

  // Handle agent typing events
  useEffect(() => {
    if (!hasUserSentMessage) return;

    // Only simulate agent typing for non-ticket conversations in non-realtime mode
    if (!isTicketConversation && (!config?.realtime || config.realtime === false)) {
      // Only trigger typing if there are no messages or the last message is from the user
      const lastMessage = messages[messages.length - 1];
      const shouldSimulateTyping = !lastMessage || lastMessage.sender === 'user';

      if (shouldSimulateTyping) {
        simulateAgentTyping(setIsTyping, setMessages, messages, config);
      }
    }

    // Clean up any typing timeout
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [hasUserSentMessage, messages, setIsTyping, setMessages, config, isTicketConversation]);

  // Listen for realtime typing events
  useEffect(() => {
    if (!config?.realtime || config.realtime === false) return;

    // Subscribe to typing events here
    // This would be implemented in an actual real-time system

    return () => {
      // Unsubscribe from typing events
    };
  }, [config, conversation.id]);

  // Listen for realtime message status events
  useEffect(() => {
    if (!config?.realtime || config.realtime === false) return;

    // Subscribe to message status events here
    // This would be implemented in an actual real-time system

    return () => {
      // Unsubscribe from message status events
    };
  }, [config, conversation.id]);

  // Listen for realtime message events
  useEffect(() => {
    if (!config?.realtime || config.realtime === false) return;

    // If there are messages and the last message is new, play sound
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && latestMessageRef.current !== lastMessage.id && lastMessage.sender === 'system') {
      if (playMessageSound) {
        playMessageSound();
      }
      latestMessageRef.current = lastMessage.id;
    }

    // Subscribe to message events here
    // This would be implemented in an actual real-time system

    return () => {
      // Unsubscribe from message events
    };
  }, [messages, config, conversation.id, playMessageSound]);

  // Handle read receipts for user messages in real-time mode
  useEffect(() => {
    if (!config?.realtime || config.realtime === false) return;

    // Process only user messages without read receipts
    const userMessages = messages.filter(msg => 
      msg.sender === 'user' && (!readReceipts[msg.id] || readReceipts[msg.id].status !== 'read')
    );

    if (userMessages.length > 0 && isTicketConversation) {
      // Simulate read receipts after a delay in realtime mode
      setTimeout(() => {
        const updatedReceipts = { ...readReceipts };
        
        userMessages.forEach(msg => {
          updatedReceipts[msg.id] = {
            status: 'delivered',
            timestamp: new Date()
          };
        });
        
        setReadReceipts(updatedReceipts);
        
        // Then mark as read after another delay
        setTimeout(() => {
          const finalReceipts = { ...updatedReceipts };
          
          userMessages.forEach(msg => {
            finalReceipts[msg.id] = {
              status: 'read',
              timestamp: new Date()
            };
          });
          
          setReadReceipts(finalReceipts);
        }, 1000 + Math.random() * 2000);
      }, 500 + Math.random() * 1000);
    }
  }, [messages, readReceipts, setReadReceipts, config, isTicketConversation]);

  // Handler for resetting typing timeout
  const handleTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setRemoteIsTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      setRemoteIsTyping(false);
    }, 3000);
  }, []);

  return {
    remoteIsTyping,
    readReceipts,
    handleTypingTimeout,
    markMessageAsRead: (messageId: string, status: MessageStatus) => 
      markMessageAsRead(messageId, status, setReadReceipts)
  };
}
