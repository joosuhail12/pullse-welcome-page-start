
import { useEffect, useState, useRef } from 'react';
import { Message, MessageReadReceipt, MessageReadStatus } from '../types';
import { subscribeToChannel, publishToChannel, unsubscribeFromChannel } from '../utils/ably';
import { ChatWidgetConfig, ChatEventType } from '../config';
import { processSystemMessage } from '../utils/messageHandlers';
import { dispatchValidatedEvent } from '../embed/enhancedEvents';

export function useRealtimeSubscriptions(
  ticketId: string,
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, MessageReadReceipt>>({});
  const [deliveredReceipts, setDeliveredReceipts] = useState<Record<string, MessageReadReceipt>>({});
  const [connectionState, setConnectionState] = useState<string>('connecting');
  
  // Create proper channel names based on sessionId and ticketId
  const eventsChannelName = sessionId ? `widget:events:${sessionId}` : '';
  const notificationsChannelName = sessionId ? `widget:notifications:${sessionId}` : '';
  const contactEventChannelName = sessionId ? `widget:contactevent:${sessionId}` : '';
  const conversationChannelName = ticketId && ticketId.includes('ticket-') 
    ? `widget:conversation:${ticketId}` 
    : '';
  
  // Track if local fallback has already been set up
  const fallbackSetupDone = useRef(false);
  const localEventHandlers = useRef<{[key: string]: any}>({});
  const activeChannels = useRef<{[key: string]: any}>({});
  const subscriptionAttempted = useRef<{[key: string]: boolean}>({});

  // Validate channel name before subscribing
  const isValidChannelName = (channelName: string): boolean => {
    return Boolean(
      channelName && 
      !channelName.includes('null') && 
      !channelName.includes('undefined') &&
      channelName !== 'widget:events:null' &&
      channelName !== 'widget:events:undefined' &&
      channelName !== 'widget:contactevent:null' &&
      channelName !== 'widget:contactevent:undefined' &&
      channelName !== 'widget:notifications:null' &&
      channelName !== 'widget:notifications:undefined' &&
      channelName !== 'widget:conversation:null' &&
      channelName !== 'widget:conversation:undefined'
    );
  };

  // Subscribe to session channels (events, notifications, contact events)
  const subscribeToSessionChannels = () => {
    if (!sessionId) return;

    // Subscribe to events channel
    if (isValidChannelName(eventsChannelName) && !subscriptionAttempted.current[eventsChannelName]) {
      subscriptionAttempted.current[eventsChannelName] = true;
      activeChannels.current.eventsChannel = subscribeToChannel(
        eventsChannelName,
        'message',
        (message) => {
          console.log('Received event message:', message);
        }
      );
    }

    // Subscribe to notifications channel
    if (isValidChannelName(notificationsChannelName) && !subscriptionAttempted.current[notificationsChannelName]) {
      subscriptionAttempted.current[notificationsChannelName] = true;
      activeChannels.current.notificationsChannel = subscribeToChannel(
        notificationsChannelName,
        'message',
        (message) => {
          console.log('Received notification message:', message);
        }
      );
    }

    // Subscribe to contact event channel
    if (isValidChannelName(contactEventChannelName) && !subscriptionAttempted.current[contactEventChannelName]) {
      subscriptionAttempted.current[contactEventChannelName] = true;
      activeChannels.current.contactEventChannel = subscribeToChannel(
        contactEventChannelName,
        'message',
        (message) => {
          console.log('Received contact event message:', message);
        }
      );
    }
  };

  // Session channels effect - these should be subscribed at all times
  useEffect(() => {
    if (config?.realtime && sessionId) {
      subscribeToSessionChannels();
    }
    return () => {
      // Don't unsubscribe session channels on unmount
      // They should remain active throughout the session
    };
  }, [config?.realtime, sessionId]);

  // Conversation channel effect - this should be subscribed only when viewing a conversation
  useEffect(() => {
    // If realtime is enabled and we have a valid conversation channel, subscribe to it
    if (config?.realtime && isValidChannelName(conversationChannelName)) {
      // Skip if we've already attempted to subscribe to this channel
      if (subscriptionAttempted.current[conversationChannelName] === true) {
        return;
      }
      
      subscriptionAttempted.current[conversationChannelName] = true;
      
      // Define handlers for conversation messages
      const messageHandler = (message: any) => {
        if (message.data && message.data.sender) {
          const newMessage: Message = {
            id: message.data.id || `msg-${Date.now()}-${message.data.sender}`,
            text: message.data.text,
            sender: message.data.sender,
            createdAt: new Date(message.data.timestamp || Date.now()),
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
          
          // Process system message (sound, event)
          if (newMessage.sender === 'system') {
            processSystemMessage(newMessage, conversationChannelName, sessionId, config);
          }
          
          // Play sound if provided
          if (playMessageSound) {
            playMessageSound();
          }
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
      
      // Store handlers for local fallback mode
      localEventHandlers.current = {
        message: messageHandler,
        typing: typingHandler,
        read: readHandler,
        delivered: deliveredHandler,
        reaction: reactionHandler
      };
      
      // Setup subscriptions to conversation channel only if valid
      if (isValidChannelName(conversationChannelName)) {
        console.log(`Subscribing to conversation channel: ${conversationChannelName}`);
        activeChannels.current.messageChannel = subscribeToChannel(conversationChannelName, 'message', messageHandler);
        activeChannels.current.typingChannel = subscribeToChannel(conversationChannelName, 'typing', typingHandler);
        activeChannels.current.readChannel = subscribeToChannel(conversationChannelName, 'read', readHandler);
        activeChannels.current.deliveredChannel = subscribeToChannel(conversationChannelName, 'delivered', deliveredHandler);
        activeChannels.current.reactionChannel = subscribeToChannel(conversationChannelName, 'reaction', reactionHandler);
      }
      
      // Clean up conversation channel subscriptions on unmount or change
      return () => {
        // Only unsubscribe from conversation channels
        Object.entries(activeChannels.current).forEach(([key, channel]) => {
          if (key.includes('messageChannel') || 
              key.includes('typingChannel') || 
              key.includes('readChannel') || 
              key.includes('deliveredChannel') || 
              key.includes('reactionChannel')) {
            if (channel) {
              console.log(`Unsubscribing from conversation channel: ${channel.name}`);
              unsubscribeFromChannel(channel);
              delete activeChannels.current[key];
            }
          }
        });

        // Reset subscription attempt for this conversation to allow resubscription
        if (conversationChannelName) {
          subscriptionAttempted.current[conversationChannelName] = false;
        }
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [config?.realtime, conversationChannelName, sessionId, playMessageSound, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts,
    connectionState
  };
}
