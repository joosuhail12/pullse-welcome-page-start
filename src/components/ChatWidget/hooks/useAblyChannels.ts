
import { useEffect, useState } from 'react';
import { subscribeToChannel, getAblyClient } from '../utils/ably';
import { getChatSessionId } from '../utils/storage';
import { logger } from '@/lib/logger';

/**
 * Hook for managing Ably channel subscriptions
 * @param ticketId Optional ticket ID for conversation-specific channel
 * @returns Object containing subscription status
 */
export function useAblyChannels(ticketId?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Setup session-based channels when Ably client is connected
  useEffect(() => {
    const sessionId = getChatSessionId();
    const ablyClient = getAblyClient();
    
    if (!sessionId) {
      logger.warn('No session ID found for Ably channel subscriptions', 'useAblyChannels');
      return;
    }
    
    if (!ablyClient) {
      logger.warn('Ably client not initialized, deferring channel subscriptions', 'useAblyChannels');
      return;
    }
    
    // Only subscribe if Ably is connected
    if (ablyClient.connection.state !== 'connected') {
      logger.info('Waiting for Ably connection before subscribing to channels...', 'useAblyChannels');
      
      // Set up a one-time listener for connection
      const onConnected = () => {
        setupChannels();
        // Remove the listener after connection
        ablyClient.connection.off('connected', onConnected);
      };
      
      ablyClient.connection.once('connected', onConnected);
      return () => {
        // Clean up listener if component unmounts before connection
        ablyClient.connection.off('connected', onConnected);
      };
    }
    
    // If already connected, set up channels immediately
    const channelCleanup = setupChannels();
    return channelCleanup;
    
    // Function to setup all session-based channels
    function setupChannels() {
      logger.info(`Setting up Ably channels for session ${sessionId}`, 'useAblyChannels');
      
      // Subscribe to the three main session-based channels
      const eventsChannel = subscribeToChannel(
        `widget:events:${sessionId}`,
        '*',
        (message) => {
          logger.debug('Event message received', 'useAblyChannels', { messageData: message.data });
        }
      );
      
      const notificationsChannel = subscribeToChannel(
        `widget:notifications:${sessionId}`,
        '*',
        (message) => {
          logger.debug('Notification message received', 'useAblyChannels', { messageData: message.data });
        }
      );
      
      const contactEventsChannel = subscribeToChannel(
        `widget:contactevent:${sessionId}`,
        '*',
        (message) => {
          logger.debug('Contact event message received', 'useAblyChannels', { messageData: message.data });
        }
      );
      
      // Mark as subscribed if all channels were created
      setIsSubscribed(true);
      
      // Clean up subscription when component unmounts or connection changes
      return () => {
        logger.info('Cleaning up Ably channel subscriptions', 'useAblyChannels');
        if (eventsChannel) eventsChannel.unsubscribe();
        if (notificationsChannel) notificationsChannel.unsubscribe();
        if (contactEventsChannel) contactEventsChannel.unsubscribe();
        setIsSubscribed(false);
      };
    }
  }, []);
  
  // Subscribe to conversation-specific channel if ticketId is provided
  useEffect(() => {
    if (!ticketId) return;
    
    const sessionId = getChatSessionId();
    const ablyClient = getAblyClient();
    
    if (!sessionId || !ablyClient) {
      logger.warn('Missing sessionId or Ably client for conversation channel', 'useAblyChannels');
      return;
    }
    
    // Only subscribe if Ably is connected
    if (ablyClient.connection.state !== 'connected') {
      logger.info('Waiting for Ably connection before subscribing to conversation channel...', 'useAblyChannels');
      
      // Set up a one-time listener for connection
      const onConnected = () => {
        setupConversationChannel();
        // Remove the listener after connection
        ablyClient.connection.off('connected', onConnected);
      };
      
      ablyClient.connection.once('connected', onConnected);
      return () => {
        // Clean up listener if component unmounts before connection
        ablyClient.connection.off('connected', onConnected);
      };
    }
    
    // If already connected, set up conversation channel immediately
    const cleanupConversation = setupConversationChannel();
    return cleanupConversation;
    
    function setupConversationChannel() {
      logger.info(`Setting up conversation Ably channel for ticket ${ticketId}`, 'useAblyChannels');
      
      // Subscribe to conversation-specific channel
      const conversationChannel = subscribeToChannel(
        `widget:conversation:${ticketId}`,
        '*',
        (message) => {
          logger.debug('Conversation message received', 'useAblyChannels', { 
            ticketId,
            messageData: message.data 
          });
        }
      );
      
      // Clean up subscription when component unmounts or ticketId changes
      return () => {
        logger.info(`Cleaning up conversation Ably channel for ticket ${ticketId}`, 'useAblyChannels');
        if (conversationChannel) conversationChannel.unsubscribe();
      };
    }
  }, [ticketId]);
  
  // Add connection state change listener to resubscribe on reconnection
  useEffect(() => {
    const ablyClient = getAblyClient();
    
    if (!ablyClient) return;
    
    // Handle reconnection by setting up a state listener
    const handleConnectionStateChange = (stateChange: any) => {
      // When reconnected after being disconnected, suspended, etc.
      if (stateChange.current === 'connected' && 
          ['disconnected', 'suspended', 'failed', 'initialized'].includes(stateChange.previous)) {
        logger.info('Ably reconnected, resubscribing to channels', 'useAblyChannels');
        
        // Force a re-render to trigger resubscription of channels
        setIsSubscribed(false);
        
        // Small delay to ensure connection is fully established
        setTimeout(() => {
          setIsSubscribed(true);
        }, 100);
      }
    };
    
    // Add connection state change listener
    ablyClient.connection.on(handleConnectionStateChange);
    
    // Clean up listener on component unmount
    return () => {
      if (ablyClient) {
        ablyClient.connection.off(handleConnectionStateChange);
      }
    };
  }, []);
  
  return { isSubscribed };
}
