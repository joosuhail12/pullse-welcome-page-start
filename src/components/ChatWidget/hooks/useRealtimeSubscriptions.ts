
import { useEffect, useState } from 'react';
import { Message } from '../types';
import { subscribeToChannel, publishToChannel } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { processSystemMessage } from '../utils/messageHandlers';

export function useRealtimeSubscriptions(
  chatChannelName: string,
  sessionChannelName: string,
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});

  // Realtime communication effect
  useEffect(() => {
    // If realtime is enabled, subscribe to the conversation channel
    if (config?.realtime?.enabled && chatChannelName) {
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
            
            // Process system message (sound, event, read receipt)
            processSystemMessage(newMessage, chatChannelName, sessionId, config, playMessageSound);
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

      // Process existing messages to send read receipts
      const processExistingMessages = () => {
        // This would be called with messages from the parent component
        // Implementation remains in useRealTime
      };

      // Clean up subscriptions on unmount
      return () => {
        if (messageChannel) messageChannel.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();
        if (readChannel) readChannel.unsubscribe();
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [config?.realtime?.enabled, chatChannelName, sessionId, playMessageSound, sessionChannelName, setMessages]);

  return {
    remoteIsTyping,
    readReceipts
  };
}
