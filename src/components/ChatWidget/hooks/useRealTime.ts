
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Conversation, AgentStatus } from '../types';
import { ChatWidgetConfig } from '../config';
import { subscribeToAgentPresence, subscribeToTypingIndicator, subscribeToConversationUpdates } from '../utils/ably';
import { subscribeToReconnectionEvents } from '../utils/reconnectionManager';
import { markConversationAsRead } from '../utils/storage';

interface ReadReceipt {
  status: 'sent' | 'delivered' | 'read';
  timestamp?: Date;
}

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
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(conversation.agentInfo?.status || 'offline');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Function to handle when remote is typing
  const handleRemoteTyping = useCallback(() => {
    setRemoteIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setRemoteIsTyping(false);
    }, 3000); // Hide typing indicator after 3 seconds of no typing updates
  }, []);

  // Function to handle typing timeout
  const handleTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setRemoteIsTyping(false);
    }, 3000);
  }, []);

  // Handle connection status changes
  useEffect(() => {
    const unsubscribeReconnection = subscribeToReconnectionEvents((status) => {
      // When reconnected, fetch the latest conversation state
      if (status === 'connected' && conversation.id) {
        // You could implement a fetch here to get the latest conversation state
      }
    });

    return () => {
      unsubscribeReconnection();
    };
  }, [conversation.id]);

  // Subscribe to agent presence
  useEffect(() => {
    if (!conversation.id || !config?.features?.agentPresence) return;

    const unsubscribe = subscribeToAgentPresence(conversation.id, (status) => {
      setAgentStatus(status || 'offline');

      // Update the conversation's agent info
      if (status) {
        conversation.agentInfo = {
          ...conversation.agentInfo,
          status
        };
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversation, config?.features?.agentPresence]);

  // Subscribe to typing indicator
  useEffect(() => {
    if (!conversation.id) return;

    const unsubscribe = subscribeToTypingIndicator(conversation.id, () => {
      handleRemoteTyping();
    });

    return () => {
      unsubscribe();
    };
  }, [conversation.id, handleRemoteTyping]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation.id || !hasUserSentMessage) return;

    const unsubscribe = subscribeToConversationUpdates(
      conversation.id,
      (message) => {
        if (message.sender !== 'user') {
          setMessages(prev => [...prev, message]);
          if (playMessageSound) {
            playMessageSound();
          }
          lastMessageIdRef.current = message.id;
        }
      },
      (status, messageId) => {
        if (messageId) {
          setReadReceipts(prev => ({
            ...prev,
            [messageId]: {
              status,
              timestamp: status === 'read' ? new Date() : undefined
            }
          }));
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversation.id, hasUserSentMessage, setMessages, playMessageSound]);

  // Find the last user message and update its status based on read receipts
  useEffect(() => {
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      const receipt = readReceipts[lastUserMessage.id];
      
      if (receipt) {
        setMessages(prev => 
          prev.map(m => 
            m.id === lastUserMessage.id 
              ? { ...m, status: receipt.status } 
              : m
          )
        );
      }
    }
  }, [messages, readReceipts, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    handleTypingTimeout,
    agentStatus
  };
}
