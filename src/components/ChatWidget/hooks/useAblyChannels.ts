
import { useState, useEffect, useRef } from 'react';
import { subscribeToChannel, unsubscribeFromChannel } from '../utils/ably/messaging';
import { getAblyClient } from '../utils/ably/config';
import { getChatSessionId } from '../utils/storage';
import Ably from 'ably';

interface AblyChannelConfig {
  sessionChannels: boolean;
  conversationChannel?: string;
}

interface AblyChannels {
  events?: Ably.Types.RealtimeChannelCallbacks;
  notifications?: Ably.Types.RealtimeChannelCallbacks;
  contactEvent?: Ably.Types.RealtimeChannelCallbacks;
  conversation?: Ably.Types.RealtimeChannelCallbacks;
}

export function useAblyChannels(config: AblyChannelConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const channels = useRef<AblyChannels>({});
  const [sessionId, setSessionId] = useState<string | null>(getChatSessionId());
  const subscribedChannels = useRef<Set<string>>(new Set());
  
  // Validate channel name to ensure it's safe to subscribe
  const isValidChannelName = (channelName: string): boolean => {
    return Boolean(
      channelName && 
      !channelName.includes('null') && 
      !channelName.includes('undefined') &&
      channelName !== 'widget:events:null' &&
      channelName !== 'widget:events:undefined' &&
      channelName !== 'widget:contactevent:null' &&
      channelName !== 'widget:contactevent:undefined'
    );
  };
  
  const subscribeToChannels = () => {
    const client = getAblyClient();
    if (!client || client.connection.state !== 'connected') {
      console.warn('Ably client not connected, skipping channel subscriptions');
      return;
    }
    
    // Only subscribe to session channels if enabled and have a valid session ID
    if (config.sessionChannels && sessionId) {
      // Subscribe to events channel for the session
      const eventsChannel = `widget:events:${sessionId}`;
      if (isValidChannelName(eventsChannel) && !subscribedChannels.current.has(eventsChannel)) {
        console.log(`Subscribing to events channel: ${eventsChannel}`);
        channels.current.events = subscribeToChannel(
          eventsChannel,
          'message',
          (message) => {
            console.log('Received event message:', message);
          }
        );
        subscribedChannels.current.add(eventsChannel);
      }
      
      // Subscribe to contact event channel for the session
      const contactChannel = `widget:contactevent:${sessionId}`;
      if (isValidChannelName(contactChannel) && !subscribedChannels.current.has(contactChannel)) {
        console.log(`Subscribing to contact event channel: ${contactChannel}`);
        channels.current.contactEvent = subscribeToChannel(
          contactChannel,
          'message',
          (message) => {
            console.log('Received contact event message:', message);
          }
        );
        subscribedChannels.current.add(contactChannel);
      }
    }
    
    // Only subscribe to conversation channel if it has a ticket ID
    if (config.conversationChannel && 
        config.conversationChannel.includes('ticket-') &&
        !subscribedChannels.current.has(`widget:conversation:${config.conversationChannel}`)) {
      const conversationChannel = `widget:conversation:${config.conversationChannel}`;
      console.log(`Subscribing to conversation channel: ${conversationChannel}`);
      channels.current.conversation = subscribeToChannel(
        conversationChannel,
        'message',
        (message) => {
          console.log('Received conversation message:', message);
        }
      );
      subscribedChannels.current.add(conversationChannel);
    }
  };

  const unsubscribeAllChannels = () => {
    Object.entries(channels.current).forEach(([key, channel]) => {
      if (channel) {
        console.log(`Unsubscribing from ${key} channel`);
        unsubscribeFromChannel(channel);
      }
    });
    channels.current = {};
    subscribedChannels.current.clear();
  };

  useEffect(() => {
    const storedSessionId = getChatSessionId();
    if (storedSessionId !== sessionId) {
      setSessionId(storedSessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    const client = getAblyClient();
    if (!client) return;
    
    const handleConnectionStateChange = (state: Ably.Types.ConnectionStateChange) => {
      console.log(`Ably connection state changed to: ${state.current}`);
      
      if (state.current === 'connected') {
        setIsConnected(true);
        subscribeToChannels();
      } else if (['disconnected', 'suspended', 'closed', 'failed'].includes(state.current)) {
        setIsConnected(false);
      }
    };
    
    // Subscribe to connection state changes
    client.connection.on(handleConnectionStateChange);
    
    // Check initial connection state
    if (client.connection.state === 'connected') {
      setIsConnected(true);
      subscribeToChannels();
    }
    
    return () => {
      // Clean up event listener on unmount
      client.connection.off(handleConnectionStateChange);
      
      // Don't unsubscribe channels here to prevent disconnecting
      // We'll let the Ably client manager handle this
    };
  }, [config.sessionChannels, config.conversationChannel, sessionId]);

  // Re-subscribe when config changes
  useEffect(() => {
    if (isConnected) {
      // Unsubscribe first to avoid duplicates
      unsubscribeAllChannels();
      subscribeToChannels();
    }
    
    // Don't unsubscribe on unmount
  }, [config.sessionChannels, config.conversationChannel, sessionId, isConnected]);

  return { isConnected, channels: channels.current };
}
