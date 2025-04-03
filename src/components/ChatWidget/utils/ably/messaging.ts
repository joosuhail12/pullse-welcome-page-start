import Ably from 'ably';
import { 
  getAblyClient, isInFallbackMode, 
  getPendingMessages, setPendingMessages, addPendingMessage 
} from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';
import { ChatEventType } from '../../config';

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
    console.warn('Ably client not initialized, subscription will be deferred');
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    
    channel.subscribe(eventName, callback);
    
    // Set up recovery on channel failure
    channel.on('detached', () => {
      console.warn(`Channel ${channelName} detached, attempting to reattach`);
      setTimeout(() => {
        try {
          if (channel.state !== 'attached') {
            channel.attach();
          }
        } catch (err) {
          console.error(`Failed to reattach to channel ${channelName}:`, err);
        }
      }, 2000);
    });
    
    channel.on('failed', () => {
      console.warn(`Channel ${channelName} failed, attempting to reattach`);
      setTimeout(() => {
        try {
          channel.attach();
        } catch (err) {
          console.error(`Failed to reattach to failed channel ${channelName}:`, err);
        }
      }, 3000);
    });
    
    return channel;
  } catch (error) {
    console.error(`Error subscribing to channel ${channelName}:`, error);
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
    console.log(`Queueing message to ${channelName} (${eventName}) in fallback mode`);
    addPendingMessage(channelName, eventName, data);
    
    // Also dispatch local event in fallback mode for real-time-like behavior
    const localEventType = `local:${channelName}:${eventName}` as ChatEventType;
    dispatchValidatedEvent(localEventType, data);
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    channel.publish(eventName, data);
  } catch (error) {
    console.error(`Error publishing to channel ${channelName}:`, error);
    
    // Queue message if publish fails
    addPendingMessage(channelName, eventName, data);
    
    // Also dispatch local event for fallback
    const localEventType = `local:${channelName}:${eventName}` as ChatEventType;
    dispatchValidatedEvent(localEventType, data);
  }
};
