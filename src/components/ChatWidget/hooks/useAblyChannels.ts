
import { useEffect, useState, useRef } from 'react';
import { getChatSessionId } from '../utils/storage';
import { 
  subscribeToChannel, 
  getAblyClient, 
  isInFallbackMode 
} from '../utils/ably';
import { logger } from '@/lib/logger';

/**
 * Hook to manage Ably channel subscriptions with connection state awareness
 * Subscribes to standard widget channels and handles reconnection
 */
export function useAblyChannels(
  conversationId?: string | null,
  onMessage?: (channelName: string, eventName: string, message: any) => void
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const channelRefs = useRef<any[]>([]);
  const sessionId = getChatSessionId();
  
  // Cleanup function for unsubscribing from channels
  const cleanupSubscriptions = () => {
    if (channelRefs.current.length > 0) {
      logger.info(`Cleaning up ${channelRefs.current.length} channel subscriptions`, 'useAblyChannels');
      
      channelRefs.current.forEach(channel => {
        if (channel) {
          try {
            channel.unsubscribe();
          } catch (err) {
            logger.error('Error unsubscribing from channel', 'useAblyChannels', err);
          }
        }
      });
      
      channelRefs.current = [];
      setIsSubscribed(false);
    }
  };

  // Function to subscribe to all required channels
  const subscribeToChannels = () => {
    const client = getAblyClient();
    
    // Only subscribe if we have a client, it's connected, and we have a sessionId
    if (!client || client.connection.state !== 'connected' || !sessionId) {
      logger.warn('Cannot subscribe to channels - client not ready or no sessionId', 'useAblyChannels', { 
        clientState: client?.connection.state,
        hasSessionId: !!sessionId
      });
      return;
    }
    
    // Clean up any existing subscriptions
    cleanupSubscriptions();
    
    logger.info('Subscribing to Ably channels', 'useAblyChannels', { sessionId });
    
    try {
      // Subscribe to the three main channels
      const eventsChannel = subscribeToChannel(
        `widget:events:${sessionId}`,
        '*',
        (message) => onMessage?.('events', message.name, message.data)
      );
      
      const notificationsChannel = subscribeToChannel(
        `widget:notifications:${sessionId}`,
        '*',
        (message) => onMessage?.('notifications', message.name, message.data)
      );
      
      const contactEventChannel = subscribeToChannel(
        `widget:contactevent:${sessionId}`,
        '*',
        (message) => onMessage?.('contactevent', message.name, message.data)
      );
      
      // Collect references to all channels
      channelRefs.current = [eventsChannel, notificationsChannel, contactEventChannel].filter(Boolean);
      
      // If a conversation is active, subscribe to its channel too
      if (conversationId) {
        const conversationChannel = subscribeToChannel(
          `widget:conversation:${conversationId}`,
          '*',
          (message) => onMessage?.('conversation', message.name, message.data)
        );
        
        if (conversationChannel) {
          channelRefs.current.push(conversationChannel);
        }
      }
      
      setIsSubscribed(channelRefs.current.length > 0);
      logger.info(`Successfully subscribed to ${channelRefs.current.length} channels`, 'useAblyChannels');
    } catch (error) {
      logger.error('Error subscribing to channels', 'useAblyChannels', error);
    }
  };

  // Listen for connection state changes on the client
  useEffect(() => {
    const client = getAblyClient();
    if (!client || !sessionId) return;
    
    const handleConnectionStateChange = (stateChange: any) => {
      logger.info(`Ably connection state changed: ${stateChange.current}`, 'useAblyChannels');
      
      if (stateChange.current === 'connected') {
        // Connection is now active, subscribe to channels
        subscribeToChannels();
      } else if (['disconnected', 'suspended', 'failed'].includes(stateChange.current)) {
        // Mark as unsubscribed, will resubscribe when connection returns
        setIsSubscribed(false);
      }
    };
    
    // If already connected, subscribe immediately
    if (client.connection.state === 'connected') {
      subscribeToChannels();
    }
    
    // Set up connection state change listener
    client.connection.on('statechange', handleConnectionStateChange);
    
    // Cleanup on unmount
    return () => {
      client.connection.off('statechange', handleConnectionStateChange);
      cleanupSubscriptions();
    };
  }, [sessionId]);
  
  // Update subscriptions when conversationId changes
  useEffect(() => {
    const client = getAblyClient();
    
    // If client is connected, we should update our subscriptions when conversationId changes
    if (client && client.connection.state === 'connected' && sessionId) {
      subscribeToChannels();
    }
  }, [conversationId, sessionId]);

  // Setup global connection event listeners for fallback handling
  useEffect(() => {
    const handleConnectionEvent = (event: any) => {
      const status = event.detail?.status;
      
      if (status === 'connected') {
        // Resubscribe on reconnection
        subscribeToChannels();
      }
    };
    
    // Listen for connection change events
    document.addEventListener('pullse:chat:connectionChange', handleConnectionEvent);
    
    return () => {
      document.removeEventListener('pullse:chat:connectionChange', handleConnectionEvent);
    };
  }, []);

  return {
    isSubscribed,
    subscribeToChannels,
    cleanupSubscriptions
  };
}
