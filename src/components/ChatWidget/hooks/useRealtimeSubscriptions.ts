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
  
  const eventsChannelName = sessionId ? `widget:events:${sessionId}` : '';
  const notificationsChannelName = sessionId ? `widget:notifications:${sessionId}` : '';
  const contactEventChannelName = sessionId ? `widget:contactevent:${sessionId}` : '';
  const conversationChannelName = ticketId && ticketId.includes('ticket-') 
    ? `widget:conversation:${ticketId}` 
    : '';
  
  const fallbackSetupDone = useRef(false);
  const localEventHandlers = useRef<{[key: string]: any}>({});
  const activeChannels = useRef<{[key: string]: any}>({});
  const subscriptionAttempted = useRef<{[key: string]: boolean}>({});

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

  const subscribeToSessionChannels = () => {
    if (!sessionId) return;

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

  useEffect(() => {
    if (config?.realtime && sessionId) {
      subscribeToSessionChannels();
    }
    return () => {
      // Don't unsubscribe session channels on unmount
      // They should remain active throughout the session
    };
  }, [config?.realtime, sessionId]);

  useEffect(() => {
    if (config?.realtime && isValidChannelName(conversationChannelName)) {
      if (subscriptionAttempted.current[conversationChannelName] === true) {
        return;
      }
      
      console.log(`Subscribing to conversation channel after receiving ticketId: ${conversationChannelName}`);
      subscriptionAttempted.current[conversationChannelName] = true;
      
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
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          if (newMessage.sender === 'system') {
            processSystemMessage(newMessage, conversationChannelName, sessionId, config);
          }
          
          if (playMessageSound) {
            playMessageSound();
          }
        }
      };
      
      activeChannels.current.messageChannel = subscribeToChannel(conversationChannelName, 'message', messageHandler);
      
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
      
      localEventHandlers.current = {
        message: messageHandler,
        typing: typingHandler,
        read: readHandler,
        delivered: deliveredHandler,
        reaction: reactionHandler
      };
      
      if (isValidChannelName(conversationChannelName)) {
        console.log(`Subscribing to conversation channel: ${conversationChannelName}`);
        activeChannels.current.typingChannel = subscribeToChannel(conversationChannelName, 'typing', typingHandler);
        activeChannels.current.readChannel = subscribeToChannel(conversationChannelName, 'read', readHandler);
        activeChannels.current.deliveredChannel = subscribeToChannel(conversationChannelName, 'delivered', deliveredHandler);
        activeChannels.current.reactionChannel = subscribeToChannel(conversationChannelName, 'reaction', reactionHandler);
      }
      
      return () => {
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

        if (conversationChannelName) {
          subscriptionAttempted.current[conversationChannelName] = false;
        }
      };
    }
    
    return () => {};
  }, [config?.realtime, conversationChannelName, sessionId, playMessageSound, setMessages]);

  return {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts,
    connectionState
  };
}
