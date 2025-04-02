import { useEffect, useState, useRef } from 'react';
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
  const [readReceipts, setReadReceipts] = useState<Record<string, boolean>>({});
  const [deliveredReceipts, setDeliveredReceipts] = useState<Record<string, boolean>>({});
  
  // Keep track of the last message we've processed
  const lastProcessedMessageRef = useRef<string | null>(null);
  
  // Track active subscriptions for cleanup
  const subscriptionsRef = useRef<Array<{ channel: any, event: string, callback: Function }>>([]);

  // Helper function to add a subscription to our tracking ref
  const trackSubscription = (channel: any, event: string, callback: Function) => {
    subscriptionsRef.current.push({ channel, event, callback });
  };

  // Realtime communication effect
  useEffect(() => {
    // If realtime is enabled, subscribe to the conversation channel
    if (config?.realtime?.enabled && chatChannelName) {
      console.log(`Setting up realtime subscriptions for channel: ${chatChannelName}`);
      
      // Set up reconnection handler
      const handleReconnect = () => {
        console.log('Reconnected, resyncing state...');
        
        // Clean up existing subscriptions to avoid duplicates
        subscriptionsRef.current.forEach(({ channel, event, callback }) => {
          try {
            if (channel && channel.unsubscribe) {
              channel.unsubscribe(event, callback);
            }
          } catch (e) {
            console.error('Error unsubscribing:', e);
          }
        });
        
        // Clear the subscriptions array
        subscriptionsRef.current = [];
        
        // Re-setup subscriptions
        setupSubscriptions();
      };
      
      // Listen for reconnection events
      window.addEventListener('ably:reconnected', handleReconnect);
      
      // Setup all channel subscriptions
      const setupSubscriptions = () => {
        // Subscribe to new messages with history (rewind parameter is set in the subscribeToChannel function)
        const messageCallback = (message: any) => {
          // Skip if we've already processed this message
          if (lastProcessedMessageRef.current === message.id) {
            return;
          }
          
          // Store this message ID as processed
          lastProcessedMessageRef.current = message.id;
          
          if (message.data && message.data.sender === 'system') {
            const newMessage: Message = {
              id: message.data.id || `msg-${Date.now()}-system`,
              text: message.data.text,
              sender: 'system',
              timestamp: new Date(message.data.timestamp || Date.now()),
              type: message.data.type || 'text',
              status: 'sent'
            };
            
            // Check for duplicate messages before adding
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                return prev;
              } else {
                return [...prev, newMessage];
              }
            });
            
            // Process system message (sound, event, read receipt)
            processSystemMessage(newMessage, chatChannelName, sessionId, config, playMessageSound);
          }
        };
        
        const messageChannel = subscribeToChannel(
          chatChannelName,
          'message',
          messageCallback
        );
        
        if (messageChannel) {
          trackSubscription(messageChannel, 'message', messageCallback);
        }

        // Subscribe to typing indicators
        const typingCallback = (message: any) => {
          if (message.data && message.data.status && message.data.userId !== sessionId) {
            setRemoteIsTyping(message.data.status === 'start');
          }
        };
        
        const typingChannel = subscribeToChannel(
          chatChannelName,
          'typing',
          typingCallback
        );
        
        if (typingChannel) {
          trackSubscription(typingChannel, 'typing', typingCallback);
        }
      
        // Subscribe to read receipts
        const readCallback = (message: any) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setReadReceipts(prev => ({
              ...prev,
              [message.data.messageId]: true
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
        };
        
        const readChannel = subscribeToChannel(
          chatChannelName,
          'read',
          readCallback
        );
        
        if (readChannel) {
          trackSubscription(readChannel, 'read', readCallback);
        }
      
        // Subscribe to delivered receipts
        const deliveredCallback = (message: any) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setDeliveredReceipts(prev => ({
              ...prev,
              [message.data.messageId]: true
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
        };
        
        const deliveredChannel = subscribeToChannel(
          chatChannelName,
          'delivered',
          deliveredCallback
        );
        
        if (deliveredChannel) {
          trackSubscription(deliveredChannel, 'delivered', deliveredCallback);
        }
      
        // Subscribe to reactions
        const reactionCallback = (message: any) => {
          if (message.data && message.data.messageId && message.data.userId !== sessionId) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === message.data.messageId 
                  ? { ...msg, reaction: message.data.reaction } 
                  : msg
              )
            );
          }
        };
        
        const reactionChannel = subscribeToChannel(
          chatChannelName,
          'reaction',
          reactionCallback
        );
        
        if (reactionChannel) {
          trackSubscription(reactionChannel, 'reaction', reactionCallback);
        }
      };
      
      // Initial setup of subscriptions
      setupSubscriptions();

      // Clean up subscriptions on unmount
      return () => {
        window.removeEventListener('ably:reconnected', handleReconnect);
        
        // Clean up all tracked subscriptions
        subscriptionsRef.current.forEach(({ channel, event, callback }) => {
          try {
            if (channel && channel.unsubscribe) {
              channel.unsubscribe(event, callback);
            }
          } catch (e) {
            console.error('Error cleaning up subscription:', e);
          }
        });
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [config?.realtime?.enabled, chatChannelName, sessionId, playMessageSound, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts
  };
}
