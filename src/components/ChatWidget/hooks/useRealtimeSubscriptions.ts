
import { useEffect, useState, useRef } from 'react';
import { Message, MessageReadReceipt, MessageReadStatus } from '../types';
import { subscribeToChannel, publishToChannel, isInFallbackMode } from '../utils/ably';
import { ChatWidgetConfig, ChatEventType } from '../config';
import { processSystemMessage, sendDeliveryReceipt } from '../utils/messageHandlers';
import { dispatchValidatedEvent } from '../embed/enhancedEvents';

export function useRealtimeSubscriptions(
  chatChannelName: string,
  sessionChannelName: string,
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, MessageReadReceipt>>({});
  const [deliveredReceipts, setDeliveredReceipts] = useState<Record<string, MessageReadReceipt>>({});
  const [connectionState, setConnectionState] = useState<string>('connecting');
  
  // Track if local fallback has already been set up
  const fallbackSetupDone = useRef(false);
  const localEventHandlers = useRef<{[key: string]: any}>({});

  // Realtime communication effect
  useEffect(() => {
    // If realtime is enabled, subscribe to the conversation channel
    if (config?.realtime?.enabled && chatChannelName) {
      let messageChannel: any;
      let typingChannel: any;
      let readChannel: any;
      let deliveredChannel: any;
      let reactionChannel: any;
      let connectionChannel: any;
      
      // Set up event handlers that work with both Ably and local fallback
      const messageHandler = (message: any) => {
        if (message.data && message.data.sender === 'system') {
          const newMessage: Message = {
            id: message.data.id || `msg-${Date.now()}-system`,
            text: message.data.text,
            sender: 'system',
            timestamp: new Date(message.data.timestamp || Date.now()),
            type: message.data.type || 'text',
            status: 'sent'
          };
          
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Process system message (sound, event, read receipt)
          processSystemMessage(newMessage, chatChannelName, sessionId, config, playMessageSound);
        }
      };
      
      const typingHandler = (message: any) => {
        if (message.data && message.data.status && message.data.userId !== sessionId) {
          setRemoteIsTyping(message.data.status === 'start');
        }
      };
      
      const readHandler = (message: any) => {
        if (message.data && message.data.messageId && message.data.userId !== sessionId) {
          setReadReceipts(prev => ({
            ...prev,
            [message.data.messageId]: {
              status: 'read' as MessageReadStatus,
              timestamp: new Date(message.data.timestamp || Date.now())
            }
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
      
      const deliveredHandler = (message: any) => {
        if (message.data && message.data.messageId && message.data.userId !== sessionId) {
          setDeliveredReceipts(prev => ({
            ...prev,
            [message.data.messageId]: {
              status: 'delivered' as MessageReadStatus,
              timestamp: new Date(message.data.timestamp || Date.now())
            }
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
      
      const reactionHandler = (message: any) => {
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
      
      const connectionHandler = (message: any) => {
        setConnectionState(message.data?.status || 'unknown');
        
        if (message.data?.status === 'fallback' && !fallbackSetupDone.current) {
          setupLocalFallback();
        }
      };
      
      // Store handlers for local fallback mode
      localEventHandlers.current = {
        message: messageHandler,
        typing: typingHandler,
        read: readHandler,
        delivered: deliveredHandler,
        reaction: reactionHandler
      };
      
      // Setup subscriptions
      messageChannel = subscribeToChannel(chatChannelName, 'message', messageHandler);
      typingChannel = subscribeToChannel(chatChannelName, 'typing', typingHandler);
      readChannel = subscribeToChannel(chatChannelName, 'read', readHandler);
      deliveredChannel = subscribeToChannel(chatChannelName, 'delivered', deliveredHandler);
      reactionChannel = subscribeToChannel(chatChannelName, 'reaction', reactionHandler);
      
      // Subscribe to connection state changes
      connectionChannel = document.addEventListener('pullse:chat:connectionChange', 
        (event: any) => connectionHandler(event.detail));
      
      // Set up fallback mode listeners if needed
      if (isInFallbackMode() && !fallbackSetupDone.current) {
        setupLocalFallback();
      }
      
      // Function to set up local fallback event handlers
      function setupLocalFallback() {
        fallbackSetupDone.current = true;
        
        // Create event listeners for local fallback events
        document.addEventListener(`pullse:local:${chatChannelName}:message`, 
          (event: any) => messageHandler(event.detail));
        
        document.addEventListener(`pullse:local:${chatChannelName}:typing`, 
          (event: any) => typingHandler(event.detail));
        
        document.addEventListener(`pullse:local:${chatChannelName}:read`, 
          (event: any) => readHandler(event.detail));
        
        document.addEventListener(`pullse:local:${chatChannelName}:delivered`, 
          (event: any) => deliveredHandler(event.detail));
        
        document.addEventListener(`pullse:local:${chatChannelName}:reaction`, 
          (event: any) => reactionHandler(event.detail));
      }

      // Clean up subscriptions on unmount
      return () => {
        if (messageChannel) messageChannel.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();
        if (readChannel) readChannel.unsubscribe();
        if (deliveredChannel) deliveredChannel.unsubscribe();
        if (reactionChannel) reactionChannel.unsubscribe();
        
        // Clean up connection state listener
        document.removeEventListener('pullse:chat:connectionChange', 
          (event: any) => connectionHandler(event.detail));
        
        // Clean up local fallback listeners
        if (fallbackSetupDone.current) {
          document.removeEventListener(`pullse:local:${chatChannelName}:message`, 
            (event: any) => messageHandler(event.detail));
          
          document.removeEventListener(`pullse:local:${chatChannelName}:typing`, 
            (event: any) => typingHandler(event.detail));
          
          document.removeEventListener(`pullse:local:${chatChannelName}:read`, 
            (event: any) => readHandler(event.detail));
          
          document.removeEventListener(`pullse:local:${chatChannelName}:delivered`, 
            (event: any) => deliveredHandler(event.detail));
          
          document.removeEventListener(`pullse:local:${chatChannelName}:reaction`, 
            (event: any) => reactionHandler(event.detail));
        }
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [config?.realtime?.enabled, chatChannelName, sessionId, playMessageSound, sessionChannelName, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts,
    connectionState
  };
}
