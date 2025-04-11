
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
  
  const subscribeToChannels = () => {
    const client = getAblyClient();
    if (!client || client.connection.state !== 'connected') {
      console.warn('Ably client not connected, skipping channel subscriptions');
      return;
    }
    
    unsubscribeAllChannels();
    
    // Only subscribe to session channels if enabled and have a valid session ID
    if (config.sessionChannels && sessionId) {
      console.log(`Subscribing to session channels for ${sessionId}`);
      
      // Validate session ID to avoid invalid channel names
      if (!sessionId.includes('null') && !sessionId.includes('undefined')) {
        // Subscribe to events channel for the session
        channels.current.events = subscribeToChannel(
          `widget:events:${sessionId}`,
          'message',
          (message) => {
            console.log('Received event message:', message);
          }
        );
        
        // Subscribe to contact event channel for the session
        channels.current.contactEvent = subscribeToChannel(
          `widget:contactevent:${sessionId}`,
          'message',
          (message) => {
            console.log('Received contact event message:', message);
          }
        );
      }
    }
    
    // Only subscribe to conversation channel if it has a ticket ID
    if (config.conversationChannel && 
        config.conversationChannel.includes('ticket-')) {
      console.log(`Subscribing to conversation channel: widget:conversation:${config.conversationChannel}`);
      channels.current.conversation = subscribeToChannel(
        `widget:conversation:${config.conversationChannel}`,
        'message',
        (message) => {
          console.log('Received conversation message:', message);
        }
      );
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
      unsubscribeAllChannels();
    };
  }, [config.sessionChannels, config.conversationChannel, sessionId]);

  // Re-subscribe when config changes
  useEffect(() => {
    if (isConnected) {
      subscribeToChannels();
    }
    
    return () => {
      unsubscribeAllChannels();
    };
  }, [config.sessionChannels, config.conversationChannel, sessionId, isConnected]);

  return { isConnected, channels: channels.current };
}
