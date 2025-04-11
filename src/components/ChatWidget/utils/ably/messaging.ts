
import Ably from 'ably';
import { 
  getAblyClient, isInFallbackMode, 
  getPendingMessages, setPendingMessages, addPendingMessage 
} from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';
import { ChatEventType } from '../../config';
import { logger } from '@/lib/logger';

/**
 * Subscribe to a channel and event
 * @param channelName Channel name to subscribe to
 * @param eventName Event name to subscribe to
 * @param callback Callback to run when event is received
 */
export const subscribeToChannel = (
  channelName: string,
  eventName: string,
  callback: (message: Ably.Types.Message) => void
): Ably.Types.RealtimeChannelCallbacks | undefined => {
  const client = getAblyClient();
  if (!client) {
    logger.warn(`Ably client not initialized, subscription to ${channelName} will be deferred`, 'ably:messaging');
    return undefined;
  }
  
  // Don't attempt to subscribe if not connected
  if (client.connection.state !== 'connected') {
    logger.warn(`Ably not connected (state: ${client.connection.state}), deferring subscription to ${channelName}`, 'ably:messaging');
    return undefined;
  }
  
  try {
    const channel = client.channels.get(channelName);
    
    // If eventName is '*', subscribe to all events
    if (eventName === '*') {
      channel.subscribe(callback);
    } else {
      channel.subscribe(eventName, callback);
    }
    
    logger.debug(`Subscribed to channel ${channelName}`, 'ably:messaging');
    
    // Set up recovery on channel failure
    channel.on('detached', () => {
      logger.warn(`Channel ${channelName} detached, attempting to reattach`, 'ably:messaging');
      setTimeout(() => {
        try {
          if (channel.state !== 'attached') {
            channel.attach();
          }
        } catch (err) {
          logger.error(`Failed to reattach to channel ${channelName}`, 'ably:messaging', err);
        }
      }, 2000);
    });
    
    channel.on('failed', () => {
      logger.warn(`Channel ${channelName} failed, attempting to reattach`, 'ably:messaging');
      setTimeout(() => {
        try {
          channel.attach();
        } catch (err) {
          logger.error(`Failed to reattach to failed channel ${channelName}`, 'ably:messaging', err);
        }
      }, 3000);
    });
    
    return channel;
  } catch (error) {
    logger.error(`Error subscribing to channel ${channelName}`, 'ably:messaging', error);
    return undefined;
  }
};

/**
 * Publish a message to a channel
 * @param channelName Channel name to publish to
 * @param eventName Event name to publish
 * @param data Data to publish
 */
export const publishToChannel = (
  channelName: string,
  eventName: string,
  data: any
): void => {
  const client = getAblyClient();
  
  // Queue message if in fallback mode or client not available
  if (isInFallbackMode() || !client || client.connection.state !== 'connected') {
    logger.info(`Queueing message to ${channelName} (${eventName}) as Ably is not connected`, 'ably:messaging');
    addPendingMessage(channelName, eventName, data);
    
    // Also dispatch local event in fallback mode for real-time-like behavior
    const localEventType = `local:${channelName}:${eventName}` as ChatEventType;
    dispatchValidatedEvent(localEventType, data);
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    channel.publish(eventName, data);
    logger.debug(`Published message to ${channelName} (${eventName})`, 'ably:messaging');
  } catch (error) {
    logger.error(`Error publishing to channel ${channelName}`, 'ably:messaging', error);
    
    // Queue message if publish fails
    addPendingMessage(channelName, eventName, data);
    
    // Also dispatch local event for fallback
    const localEventType = `local:${channelName}:${eventName}` as ChatEventType;
    dispatchValidatedEvent(localEventType, data);
  }
};

/**
 * Check if a channel subscription exists and is active
 * @param channelName Channel name to check
 * @returns Boolean indicating if channel is subscribed
 */
export const isChannelSubscribed = (channelName: string): boolean => {
  const client = getAblyClient();
  if (!client || client.connection.state !== 'connected') {
    return false;
  }
  
  try {
    const channel = client.channels.get(channelName, { channelOptions: { modes: ['PRESENCE', 'SUBSCRIBE'] } });
    return channel.state === 'attached';
  } catch (error) {
    logger.error(`Error checking channel subscription for ${channelName}`, 'ably:messaging', error);
    return false;
  }
};
