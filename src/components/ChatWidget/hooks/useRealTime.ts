
import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../types';
import { MessageReadReceipt, MessageReadStatus } from '../types';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { ChatWidgetConfig } from '../config';
import { useTypingIndicator } from './useTypingIndicator';
import { dispatchChatEvent } from '../utils/events';

export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: Conversation,
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  // Create channel name from conversation ID
  const isNewConversation = !conversation.id.includes('ticket-');
  const chatChannel = isNewConversation 
    ? `widget:contactevent:${conversation.sessionId || ''}` 
    : `widget:conversation:${conversation.id}`;
  
  // Use typingIndicator hook for debounced typing status
  const { handleTypingTimeout } = useTypingIndicator(
    chatChannel,
    conversation.sessionId || '',
    config?.realtime === true
  );
  
  // Use realtime subscription hook for all other realtime events
  const {
    remoteIsTyping,
    readReceipts,
    connectionState
  } = useRealtimeSubscriptions(
    conversation.id,
    conversation.sessionId || '',
    setMessages,
    config,
    playMessageSound
  );
  
  // Send message read events when messages are received
  useEffect(() => {
    if (!messages.length || !config?.realtime) return;
    
    // Dispatch event for message counts
    dispatchChatEvent('chat:messagesCounted', {
      count: messages.length,
      conversationId: conversation.id,
    }, config);
    
  }, [messages.length, conversation.id, config]);
  
  // Handle remote typing events
  useEffect(() => {
    if (remoteIsTyping !== undefined) {
      setIsTyping(remoteIsTyping);
    }
  }, [remoteIsTyping, setIsTyping]);
  
  // Return all needed values and functions
  return {
    remoteIsTyping,
    readReceipts,
    connectionState,
    handleTypingTimeout
  };
}
