
import Ably from 'ably';
import { 
  getAblyClient, isInFallbackMode, 
  getPendingMessages, setPendingMessages, addPendingMessage,
  addActiveSubscription, removeActiveSubscription 
} from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';
import { ChatEventType } from '../../config';

// Keep track of active channel subscriptions to avoid duplicates
const activeChannelSubscriptions = new Map<string, Map<string, boolean>>();

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
  
  // Validate channel name before proceeding
  if (!channelName || 
      channelName.includes('null') || 
      channelName.includes('undefined') ||
      channelName === 'session:null' ||
      channelName === 'widget:events:null' ||
      channelName === 'widget:notifications:null' ||
      channelName === 'widget:contactevent:null') {
    console.warn(`Invalid channel name: ${channelName}, skipping subscription`);
    return undefined;
  }
  
  if (!client) {
    console.warn(`Ably client not initialized, subscription to ${channelName} will be deferred`);
    return undefined;
  }
  
  if (client.connection.state !== 'connected') {
    console.info(`Ably client not connected (current state: ${client.connection.state}), subscription to ${channelName} will be deferred`);
    // We'll attempt to resubscribe on reconnection via the resubscribeToActiveChannels function
    return undefined;
  }
  
  // Check if we're already subscribed to avoid duplicate subscriptions
  if (!activeChannelSubscriptions.has(channelName)) {
    activeChannelSubscriptions.set(channelName, new Map());
  }
  
  const channelSubs = activeChannelSubscriptions.get(channelName);
  if (channelSubs?.has(eventName)) {
    console.log(`Already subscribed to ${channelName} (${eventName}), skipping duplicate subscription`);
    // Return the existing channel so the caller can still unsubscribe if needed
    return client.channels.get(channelName);
  }
  
  try {
    const channel = client.channels.get(channelName);
    
    // Keep track of active subscriptions for reconnection
    addActiveSubscription(channelName, eventName);
    
    channel.subscribe(eventName, callback);
    
    // Mark as subscribed to avoid duplicates
    channelSubs?.set(eventName, true);
    
    // Log successful subscription for debugging
    console.log(`Successfully subscribed to ${channelName} (${eventName})`);
    
    // Set up recovery on channel failure
    channel.on('detached', () => {
      console.warn(`Channel ${channelName} detached, attempting to reattach`);
      setTimeout(() => {
        try {
          // Make sure the client is still connected and channel still exists
          if (client && client.connection.state === 'connected' && channel.state !== 'attached') {
            console.log(`Reattaching to channel ${channelName}`);
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
          // Make sure the client is still connected
          if (client && client.connection.state === 'connected') {
            console.log(`Reattaching to failed channel ${channelName}`);
            channel.attach();
          }
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
  // Validate channel name before proceeding
  if (!channelName || 
      channelName.includes('null') || 
      channelName.includes('undefined') || 
      channelName === 'session:null') {
    console.warn(`Invalid channel name for publishing: ${channelName}, message will not be sent`);
    return;
  }
  
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

/**
 * Unsubscribe from a channel
 * @param channel The channel to unsubscribe from
 * @param eventName Optional event name to unsubscribe from
 */
export const unsubscribeFromChannel = (
  channel: Ably.Types.RealtimeChannelCallbacks | undefined,
  eventName?: string
): void => {
  if (!channel) return;
  
  try {
    if (eventName) {
      channel.unsubscribe(eventName);
      removeActiveSubscription(channel.name, eventName);
      
      // Remove from our active subscriptions tracking
      const channelSubs = activeChannelSubscriptions.get(channel.name);
      if (channelSubs) {
        channelSubs.delete(eventName);
        if (channelSubs.size === 0) {
          activeChannelSubscriptions.delete(channel.name);
        }
      }
    } else {
      channel.unsubscribe();
      removeActiveSubscription(channel.name, '*');
      
      // Remove all subscriptions for this channel
      activeChannelSubscriptions.delete(channel.name);
    }
    console.log(`Unsubscribed from ${channel.name} channel`);
  } catch (error) {
    console.error(`Error unsubscribing from channel:`, error);
  }
};

/**
 * Clear all channel subscriptions
 * This can be used when switching between views to clean up unused subscriptions
 */
export const clearAllChannelSubscriptions = (): void => {
  const client = getAblyClient();
  if (!client) return;
  
  try {
    // For each active channel, detach but don't fully close the connection
    const channels = client.channels;
    
    // Use a different approach to iterate through channels
    Object.keys(channels.all).forEach((channelName) => {
      const channel = channels.get(channelName);
      if (channel.state === 'attached') {
        channel.detach();
      }
    });
    
    // Clear our tracking maps
    activeChannelSubscriptions.clear();
  } catch (error) {
    console.error('Error clearing channel subscriptions:', error);
  }
};
