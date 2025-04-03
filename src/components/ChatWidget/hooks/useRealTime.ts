
import { useEffect, useState, useRef, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { useTypingIndicator } from './useTypingIndicator';
import { simulateAgentTyping } from '../utils/simulateAgentTyping';

export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: { id: string },
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionChannelName = `session:${getChatSessionId()}`;
  const sessionId = getChatSessionId();
  
  // Track if the component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Use the realtime subscriptions hook
  const { remoteIsTyping, readReceipts } = useRealtimeSubscriptions(
    chatChannelName,
    sessionChannelName,
    sessionId,
    setMessages,
    config,
    playMessageSound
  );
  
  // Use the typing indicator hook
  const { handleTypingTimeout, clearTypingTimeout } = useTypingIndicator(
    chatChannelName, 
    sessionId, 
    !!config?.realtime?.enabled
  );

  // Memoize the function to send read receipts
  const sendReadReceipts = useCallback(() => {
    if (!config?.realtime?.enabled || messages.length === 0) return;
    
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
  }, [chatChannelName, config?.realtime?.enabled, messages, sessionId]);

  // Effects for specific functionality
  useEffect(() => {
    // Process existing messages when component mounts
    sendReadReceipts();
  }, [sendReadReceipts]);

  // For non-realtime mode, simulate agent typing - with proper cleanup
  useEffect(() => {
    if (!config?.realtime?.enabled && hasUserSentMessage) {
      let typingTimer: ReturnType<typeof setTimeout> | null = null;
      
      const typingInterval = setInterval(() => {
        if (!isMounted.current) return;
        
        typingTimer = simulateAgentTyping(setIsTyping, setMessages, config, playMessageSound);
      }, 15000);
      
      return () => {
        isMounted.current = false;
        clearInterval(typingInterval);
        if (typingTimer) clearTimeout(typingTimer);
        clearTypingTimeout();
      };
    }
    
    // No cleanup needed when realtime is enabled
    return () => {
      isMounted.current = false;
    };
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages, clearTypingTimeout]);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout
  };
}
