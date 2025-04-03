
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
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
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

  // Memoize the function to send read receipts - prevents unnecessary re-renders
  const sendReadReceipts = useCallback(() => {
    if (!config?.realtime?.enabled || messages.length === 0) return;
    
    // Use Set to track already processed message IDs
    const processedIds = new Set<string>();
    
    messages.forEach(message => {
      // Skip if already processed this message
      if (processedIds.has(message.id)) return;
      
      processedIds.add(message.id);
      
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

  // Effect for cleanup and initialization
  useEffect(() => {
    // Process existing messages when component mounts
    sendReadReceipts();
    
    // Set mounted flag for cleanup
    isMounted.current = true;
    
    // Return cleanup function to avoid memory leaks
    return () => {
      isMounted.current = false;
      
      // Clean up any timers
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      
      clearTypingTimeout();
    };
  }, [sendReadReceipts, clearTypingTimeout]);

  // For non-realtime mode, simulate agent typing - with proper cleanup
  useEffect(() => {
    if (!config?.realtime?.enabled && hasUserSentMessage) {
      // Clear any existing timers first
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      // Debounce typing simulation to reduce CPU usage
      const debounceInterval = 15000; // 15 seconds between typing simulations
      
      // Set up new typing simulation
      typingIntervalRef.current = setInterval(() => {
        if (!isMounted.current) {
          // Component unmounted, clean up
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
          return;
        }
        
        typingTimerRef.current = simulateAgentTyping(setIsTyping, setMessages, config, playMessageSound);
      }, debounceInterval);
      
      return () => {
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      };
    }
    
    // No additional cleanup needed
    return undefined;
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout
  };
}
