
import { useState, useEffect, useRef } from 'react';
import { subscribeToChannel, unsubscribeFromChannel } from '../utils/ably/messaging';
import { getAblyClient } from '../utils/ably/config';
import { getChatSessionId } from '../utils/storage';
import Ably from 'ably';

interface AblyChannelConfig {
  sessionChannels: boolean;
  conversationChannel?: string;
  isNewConversation?: boolean;
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
  
  // Function to subscribe to channels
  const subscribeToChannels = () => {
    const client = getAblyClient();
    if (!client || client.connection.state !== 'connected') {
      console.warn('Ably client not connected, skipping channel subscriptions');
      return;
    }
    
    unsubscribeAllChannels();
    
    // Only proceed if we have a session ID
    if (config.sessionChannels && sessionId) {
      console.log(`Subscribing to session channels for ${sessionId}`);
      
      // Subscribe to session channels with widget: prefix
      channels.current.events = subscribeToChannel(
        `widget:events:${sessionId}`,
        'message',
        (message) => {
          console.log('Received event message:', message);
        }
      );
      
      channels.current.notifications = subscribeToChannel(
        `widget:notifications:${sessionId}`,
        'message',
        (message) => {
          console.log('Received notification message:', message);
        }
      );
      
      channels.current.contactEvent = subscribeToChannel(
        `widget:contactevent:${sessionId}`,
        'message',
        (message) => {
          console.log('Received contact event message:', message);
        }
      );
    }
    
    // Subscribe to conversation channel if provided, with widget: prefix
    // And only if this is not a new conversation (has ticket ID)
    if (config.conversationChannel && !config.isNewConversation) {
      console.log(`Subscribing to conversation channel: ${config.conversationChannel}`);
      channels.current.conversation = subscribeToChannel(
        config.conversationChannel,
        'message',
        (message) => {
          console.log('Received conversation message:', message);
        }
      );
    }
  };
  
  // Function to unsubscribe from all channels
  const unsubscribeAllChannels = () => {
    Object.entries(channels.current).forEach(([key, channel]) => {
      if (channel) {
        console.log(`Unsubscribing from ${key} channel`);
        unsubscribeFromChannel(channel);
      }
    });
    channels.current = {};
  };
  
  // Watch for sessionId changes (e.g., when loaded from storage)
  useEffect(() => {
    const storedSessionId = getChatSessionId();
    if (storedSessionId !== sessionId) {
      setSessionId(storedSessionId);
    }
  }, [sessionId]);
  
  // Watch for connection state changes
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
        unsubscribeAllChannels();
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
  }, [config.sessionChannels, config.conversationChannel, config.isNewConversation, sessionId]);
  
  return { isConnected, channels: channels.current };
}
