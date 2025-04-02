
import * as Ably from 'ably';
import { getChatSessionId } from './cookies';

let ably: Ably.Realtime | null = null;
let initialized = false;

/**
 * Initialize Ably client
 * @param apiKey The Ably API key
 */
export const initializeAbly = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (initialized) {
        resolve();
        return;
      }

      ably = new Ably.Realtime({
        key: apiKey,
        clientId: getChatSessionId() || `anonymous-${Date.now()}`,
      });

      ably.connection.once('connected', () => {
        initialized = true;
        console.log('Connected to Ably');
        resolve();
      });

      ably.connection.on('failed', (error) => {
        console.error('Failed to connect to Ably:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error initializing Ably:', error);
      reject(error);
    }
  });
};

/**
 * Get the Ably client instance
 */
export const getAblyClient = (): Ably.Realtime | null => {
  return ably;
};

/**
 * Subscribe to a channel
 * @param channelName The name of the channel to subscribe to
 * @param eventName The name of the event to subscribe to
 * @param callback The callback to call when an event is received
 */
export const subscribeToChannel = (
  channelName: string,
  eventName: string,
  callback: (message: Ably.Types.Message) => void
): Ably.Types.RealtimeChannel | undefined => {
  if (!ably) {
    console.warn('Ably not initialized');
    return undefined;
  }

  try {
    const channel = ably.channels.get(channelName);
    channel.subscribe(eventName, callback);
    return channel;
  } catch (error) {
    console.error(`Error subscribing to channel ${channelName}:`, error);
    return undefined;
  }
};

/**
 * Publish an event to a channel
 * @param channelName The name of the channel to publish to
 * @param eventName The name of the event to publish
 * @param data The data to publish
 */
export const publishToChannel = async (
  channelName: string,
  eventName: string,
  data: any
): Promise<void> => {
  if (!ably) {
    console.warn('Ably not initialized');
    return;
  }

  try {
    const channel = ably.channels.get(channelName);
    await channel.publish(eventName, data);
  } catch (error) {
    console.error(`Error publishing to channel ${channelName}:`, error);
  }
};

/**
 * Enter presence on a channel
 * @param channelName The name of the channel to enter presence on
 * @param data The client data to include in the presence message
 */
export const enterPresence = async (
  channelName: string,
  data: any
): Promise<void> => {
  if (!ably) {
    console.warn('Ably not initialized');
    return;
  }

  try {
    const channel = ably.channels.get(channelName);
    await channel.presence.enter(data);
  } catch (error) {
    console.error(`Error entering presence on channel ${channelName}:`, error);
  }
};

/**
 * Get presence on a channel
 * @param channelName The name of the channel to get presence from
 * @returns Promise resolving to an array of presence members
 */
export const getPresence = async (
  channelName: string
): Promise<Ably.Types.PresenceMessage[]> => {
  if (!ably) {
    console.warn('Ably not initialized');
    return [];
  }

  try {
    const channel = ably.channels.get(channelName);
    return await channel.presence.get();
  } catch (error) {
    console.error(`Error getting presence from channel ${channelName}:`, error);
    return [];
  }
};

/**
 * Subscribe to presence changes on a channel
 * @param channelName The name of the channel to subscribe to presence changes on
 * @param callback The callback to call when presence changes
 */
export const subscribeToPresence = (
  channelName: string,
  callback: (presenceData: Ably.Types.PresenceMessage[]) => void
): void => {
  if (!ably) {
    console.warn('Ably not initialized');
    return;
  }

  try {
    const channel = ably.channels.get(channelName);
    channel.presence.subscribe('enter', () => {
      channel.presence.get((err, members) => {
        if (!err && members) {
          callback(members);
        }
      });
    });
    
    channel.presence.subscribe('leave', () => {
      channel.presence.get((err, members) => {
        if (!err && members) {
          callback(members);
        }
      });
    });
  } catch (error) {
    console.error(`Error subscribing to presence on channel ${channelName}:`, error);
  }
};

/**
 * Clean up Ably resources
 */
export const cleanupAbly = (): void => {
  if (!ably) return;

  try {
    // Close all channel subscriptions
    ably.channels.forEach((channel) => {
      channel.unsubscribe();
      channel.presence.unsubscribe();
      channel.detach();
    });

    // Close the connection
    ably.close();
    ably = null;
    initialized = false;
  } catch (error) {
    console.error('Error cleaning up Ably:', error);
  }
};
