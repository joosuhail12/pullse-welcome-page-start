
import { useEffect, useState } from 'react';
import { Message } from '../types';
import { subscribeToChannel, publishToChannel } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { processSystemMessage, sendDeliveryReceipt } from '../utils/messageHandlers';

export function useRealtimeSubscriptions(
  chatChannelName: string,
  sessionChannelName: string,
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, Date>>({});
  const [deliveredReceipts, setDeliveredReceipts] = useState<Record<string, Date>>({});

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
              type: message.data.type || 'text',
              status: 'sent'
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
              [message.data.messageId]: new Date(message.data.timestamp || Date.now())
            }));
            
            // Update message status
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.data.messageId 
                  ? { ...msg, status: 'read' } 
                  : msg
              )
            );
          }
        }
      );
      
      // Subscribe to delivered receipts
      const deliveredChannel = subscribeToChannel(
        chatChannelName,
        'delivered',
        (message) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setDeliveredReceipts(prev => ({
              ...prev,
              [message.data.messageId]: new Date(message.data.timestamp || Date.now())
            }));
            
            // Update message status if not already read
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.data.messageId && msg.status !== 'read' 
                  ? { ...msg, status: 'delivered' } 
                  : msg
              )
            );
          }
        }
      );
      
      // Subscribe to reactions
      const reactionChannel = subscribeToChannel(
        chatChannelName,
        'reaction',
        (message) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.data.messageId 
                  ? { ...msg, reaction: message.data.reaction } 
                  : msg
              )
            );
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

      // Clean up subscriptions on unmount
      return () => {
        if (messageChannel) messageChannel.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();
        if (readChannel) readChannel.unsubscribe();
        if (deliveredChannel) deliveredChannel.unsubscribe();
        if (reactionChannel) reactionChannel.unsubscribe();
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [config?.realtime?.enabled, chatChannelName, sessionId, playMessageSound, sessionChannelName, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts
  };
}
