
import { useEffect, useState, useCallback } from 'react';
import { Message } from '../types';
import { subscribeToChannel, publishToChannel } from '../utils/ably';
import { dispatchChatEvent } from '../utils/events';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';

export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: { id: string },
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});
  
  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionChannelName = `session:${getChatSessionId()}`;
  const sessionId = getChatSessionId();

  // Clear typing timeout when component unmounts
  const clearTypingTimeoutCallback = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }, [typingTimeout]);
  
  // Handle typing indicator timeout
  const handleTypingTimeout = useCallback(() => {
    // Clear previous timeout to avoid multiple typing:stop events
    clearTypingTimeoutCallback();
    
    // Send typing:stop after 2 seconds of no typing
    const timeout = setTimeout(() => {
      publishToChannel(chatChannelName, 'typing', {
        status: 'stop',
        userId: sessionId
      });
    }, 2000);
    
    setTypingTimeout(timeout);
  }, [chatChannelName, sessionId, clearTypingTimeoutCallback]);

  // Realtime communication effect
  useEffect(() => {
    // If realtime is enabled, subscribe to the conversation channel
    if (config?.realtime?.enabled && conversation.id) {
      // Subscribe to new messages
      const messageChannel = subscribeToChannel(
        chatChannelName,
        'message',
        (message) => {
          if (message.data && message.data.sender === 'system') {
            const newMessage: Message = {
              id: message.data.id || `msg-${Date.now()}-system`,
              text: message.data.text,
              sender: 'system',
              timestamp: new Date(message.data.timestamp || Date.now()),
              type: message.data.type || 'text'
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // Play sound notification if provided and chat is not visible
            if (playMessageSound && document.visibilityState !== 'visible') {
              playMessageSound();
            }
            
            // Dispatch message received event
            dispatchChatEvent('chat:messageReceived', { message: newMessage }, config);
            
            // Send read receipt after a short delay
            setTimeout(() => {
              publishToChannel(chatChannelName, 'read', {
                messageId: newMessage.id,
                userId: sessionId,
                timestamp: new Date()
              });
            }, 2000);
          }
        }
      );

      // Subscribe to typing indicators
      const typingChannel = subscribeToChannel(
        chatChannelName,
        'typing',
        (message) => {
          if (message.data && message.data.status && message.data.userId !== sessionId) {
            setRemoteIsTyping(message.data.status === 'start');
          }
        }
      );
      
      // Subscribe to read receipts
      const readChannel = subscribeToChannel(
        chatChannelName,
        'read',
        (message) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setReadReceipts(prev => ({
              ...prev,
              [message.data.messageId]: true
            }));
          }
        }
      );

      // Send notification on the session channel for unread tracking
      const notifyNewMessage = (message: Message) => {
        if (config?.realtime?.enabled && message.sender === 'system') {
          publishToChannel(sessionChannelName, 'message', {
            id: message.id,
            text: message.text,
            sender: message.sender,
            timestamp: message.timestamp
          });
        }
      };

      // Add read receipt functionality for existing messages
      const processExistingMessages = () => {
        messages.forEach(message => {
          if (message.sender === 'system') {
            // Send read receipt for existing system messages
            publishToChannel(chatChannelName, 'read', {
              messageId: message.id,
              userId: sessionId,
              timestamp: new Date()
            });
          }
        });
      };
      
      // Process existing messages when component mounts
      processExistingMessages();

      // Clean up subscriptions on unmount
      return () => {
        if (messageChannel) messageChannel.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();
        if (readChannel) readChannel.unsubscribe();
        clearTypingTimeoutCallback();
      };
    } else {
      // Fallback to the original behavior when realtime is disabled
      const simulateAgentTyping = () => {
        if (!hasUserSentMessage) return;
        
        const randomTimeout = Math.floor(Math.random() * 10000) + 5000;
        const typingTimer = setTimeout(() => {
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
              
              // Dispatch message received event
              dispatchChatEvent('chat:messageReceived', { message: systemMessage }, config);
            }, responseDelay);
          }, typingDuration);
        }, randomTimeout);
        
        setTypingTimeout(typingTimer);
        return () => clearTimeout(typingTimer);
      };
      
      const typingInterval = setInterval(simulateAgentTyping, 15000);
      return () => {
        clearInterval(typingInterval);
        clearTypingTimeoutCallback();
      };
    }
  }, [hasUserSentMessage, config?.realtime?.enabled, chatChannelName, conversation.id, messages, sessionId, playMessageSound, sessionChannelName, setIsTyping, setMessages, clearTypingTimeoutCallback]);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout
  };
}
