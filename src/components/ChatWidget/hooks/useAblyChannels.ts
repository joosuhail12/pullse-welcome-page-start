
import { useEffect } from 'react';
import { subscribeToChannel } from '../utils/ably';
import { getChatSessionId } from '../utils/storage';
import { logger } from '@/lib/logger';

/**
 * Hook for managing Ably channel subscriptions
 * @param ticketId Optional ticket ID for conversation-specific channel
 * @returns Object containing subscription status
 */
export function useAblyChannels(ticketId?: string) {
  // Initialize channels on component mount
  useEffect(() => {
    const sessionId = getChatSessionId();
    
    if (!sessionId) {
      logger.warn('No session ID found for Ably channel subscriptions', 'useAblyChannels');
      return;
    }
    
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
    
    // Clean up subscription when component unmounts
    return () => {
      logger.info('Cleaning up Ably channel subscriptions', 'useAblyChannels');
      if (eventsChannel) eventsChannel.unsubscribe();
      if (notificationsChannel) notificationsChannel.unsubscribe();
      if (contactEventsChannel) contactEventsChannel.unsubscribe();
    };
  }, []);
  
  // Subscribe to conversation-specific channel if ticketId is provided
  useEffect(() => {
    if (!ticketId) return;
    
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
  }, [ticketId]);
  
  return {
    isSubscribed: true
  };
}
