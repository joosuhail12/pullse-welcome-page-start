
import { useState, useEffect, useRef } from 'react';
import { subscribeToChannel, unsubscribeFromChannel } from '../utils/ably/messaging';
import { getAblyClient } from '../utils/ably/config';
import { getChatSessionId } from '../utils/storage';
import Ably from 'ably';
import { dispatchChatEvent } from '../utils/events';

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
      channelName !== 'widget:notifications:null' &&
      channelName !== 'widget:notifications:undefined' &&
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
        try {
          channels.current.events = subscribeToChannel(
            eventsChannel,
            'message',
            (message) => {
              console.log('Received event message:', message);
            }
          );
          if (channels.current.events) {
            subscribedChannels.current.add(eventsChannel);
          }
        } catch (error) {
          console.error(`Error subscribing to ${eventsChannel}:`, error);
        }
      }

      // Subscribe to notifications channel for the session
      const notificationsChannel = `widget:notifications:${sessionId}`;
      if (isValidChannelName(notificationsChannel) && !subscribedChannels.current.has(notificationsChannel)) {
        console.log(`Subscribing to notifications channel: ${notificationsChannel}`);
        try {
          channels.current.notifications = subscribeToChannel(
            notificationsChannel,
            'message',
            (message) => {
              console.log('Received notification message:', message);
            }
          );
          if (channels.current.notifications) {
            subscribedChannels.current.add(notificationsChannel);
          }
        } catch (error) {
          console.error(`Error subscribing to ${notificationsChannel}:`, error);
        }
      }

      // Subscribe to contact event channel for the session
      const contactChannel = `widget:contactevent:${sessionId}`;
      if (isValidChannelName(contactChannel) && !subscribedChannels.current.has(contactChannel)) {
        console.log(`Subscribing to contact event channel: ${contactChannel}`);
        try {
          channels.current.contactEvent = subscribeToChannel(
            contactChannel,
            'new_ticket_reply',
            (message) => {
              console.log('Received contact event message:', message);
              // Send a event for other components to handle
              dispatchChatEvent('chat:new_ticket', { message: message.data["ticketId"] });
            }
          );
          if (channels.current.contactEvent) {
            subscribedChannels.current.add(contactChannel);
          }
        } catch (error) {
          console.error(`Error subscribing to ${contactChannel}:`, error);
        }
      }
    }

    // Only subscribe to conversation channel if it has a ticket ID
    if (config.conversationChannel &&
      config.conversationChannel.includes('ticket-') &&
      !subscribedChannels.current.has(`widget:conversation:${config.conversationChannel}`)) {
      const conversationChannel = `widget:conversation:${config.conversationChannel}`;
      console.log(`Subscribing to conversation channel: ${conversationChannel}`);
      try {
        channels.current.conversation = subscribeToChannel(
          conversationChannel,
          'message_reply',
          (message) => {
            console.log('Received conversation message:', message);

            dispatchChatEvent('chat:ticket_message', { message: message.data.message, type: message.data.type || 'agent' });
          }
        );
        if (channels.current.conversation) {
          subscribedChannels.current.add(conversationChannel);
        }
      } catch (error) {
        console.error(`Error subscribing to ${conversationChannel}:`, error);
      }
    }
  };

  const unsubscribeAllChannels = () => {
    Object.entries(channels.current).forEach(([key, channel]) => {
      if (channel) {
        console.log(`Unsubscribing from ${key} channel`);
        try {
          unsubscribeFromChannel(channel);
        } catch (error) {
          console.error(`Error unsubscribing from ${key} channel:`, error);
        }
      }
    });
    channels.current = {};
    subscribedChannels.current.clear();
  };

  const checkChannelSubscription = (channelName: string) => {
    if (subscribedChannels.current.has(channelName)) {
      console.log(`Channel ${channelName} is already subscribed`);
      return true;
    } else {
      console.log(`Channel ${channelName} is not subscribed`);
      return false;
    }
  }

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

  // Re-subscribe when config changes but only if we weren't already subscribed
  useEffect(() => {
    if (isConnected) {
      // Don't unnecessarily unsubscribe and resubscribe to prevent connection issues
      // Only subscribe to new channels
      subscribeToChannels();
    }

    // Clean up when component unmounts
    return () => {
      // Explicitly unsubscribe from conversation channel when unmounting or when conversation changes
      if (channels.current.conversation) {
        const channelName = channels.current.conversation.name;
        if (channelName.startsWith('widget:conversation:')) {
          console.log(`Unsubscribing from conversation channel when unmounting: ${channelName}`);
          unsubscribeFromChannel(channels.current.conversation);
          channels.current.conversation = undefined;
          subscribedChannels.current.delete(channelName);
        }
      }
    };
  }, [config.sessionChannels, config.conversationChannel, sessionId, isConnected]);

  return { isConnected, channels: channels.current, checkChannelSubscription };
}
