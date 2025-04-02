
import { useEffect, useState } from 'react';
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

  // Effects for specific functionality
  useEffect(() => {
    // Process existing messages when component mounts
    if (config?.realtime?.enabled && messages.length > 0) {
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
    }
  }, [chatChannelName, config?.realtime?.enabled, messages, sessionId]);

  // For non-realtime mode, simulate agent typing
  useEffect(() => {
    if (!config?.realtime?.enabled) {
      // Only simulate if the user has sent at least one message
      if (!hasUserSentMessage) return;
      
      const typingInterval = setInterval(() => {
        const typingTimer = simulateAgentTyping(setIsTyping, setMessages, config, playMessageSound);
        return () => clearTimeout(typingTimer);
      }, 15000);
      
      return () => {
        clearInterval(typingInterval);
        clearTypingTimeout();
      };
    }
    
    // No cleanup needed when realtime is enabled
    return () => {};
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages, clearTypingTimeout]);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout
  };
}
