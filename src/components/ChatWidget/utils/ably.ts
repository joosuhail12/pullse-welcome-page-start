
import Ably from 'ably';

// Client instance to ensure singleton pattern
let ablyClient: Ably.Realtime | null = null;

/**
 * Initialize Ably client with given API key
 * @param apiKey Ably API key
 */
export const initializeAbly = async (apiKey: string): Promise<void> => {
  if (ablyClient) {
    return; // Already initialized
  }
  
  try {
    ablyClient = new Ably.Realtime({ key: apiKey });
    
    // Wait for connection to be established
    return new Promise((resolve, reject) => {
      if (!ablyClient) {
        reject(new Error('Ably client not initialized'));
        return;
      }
      
      ablyClient.connection.once('connected', () => {
        console.log('Ably connected successfully');
        resolve();
      });
      
      ablyClient.connection.once('failed', (err) => {
        console.error('Ably connection failed:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error initializing Ably:', error);
    throw error;
  }
};

/**
 * Get the Ably client instance
 * @returns Ably client instance
 */
export const getAblyClient = (): Ably.Realtime | null => {
  return ablyClient;
};

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
    console.warn('Ably client not initialized');
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    
    channel.subscribe(eventName, callback);
    
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
  if (!client) {
    console.warn('Ably client not initialized');
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    channel.publish(eventName, data);
  } catch (error) {
    console.error(`Error publishing to channel ${channelName}:`, error);
  }
};

/**
 * Get presence data for a channel
 * @param channelName Channel name to get presence for
 * @returns Promise resolving to presence data
 */
export const getPresence = async (channelName: string): Promise<Ably.Types.PresenceMessage[]> => {
  const client = getAblyClient();
  if (!client) {
    console.warn('Ably client not initialized');
    return [];
  }
  
  try {
    const channel = client.channels.get(channelName);
    return new Promise<Ably.Types.PresenceMessage[]>((resolve) => {
      channel.presence.get((err, members) => {
        if (err) {
          console.error(`Error getting presence for channel ${channelName}:`, err);
          resolve([]);
        } else {
          resolve(members || []);
        }
      });
    });
  } catch (error) {
    console.error(`Error getting presence for channel ${channelName}:`, error);
    return [];
  }
};

/**
 * Subscribe to presence events on a channel
 * @param channelName Channel name to subscribe to presence for
 * @param callback Callback to run when presence changes
 */
export const subscribeToPresence = (
  channelName: string,
  callback: (presenceData: Ably.Types.PresenceMessage[]) => void
): void => {
  const client = getAblyClient();
  if (!client) {
    console.warn('Ably client not initialized');
    return;
  }
  
  try {
    const channel = client.channels.get(channelName);
    
    const updateCallback = () => {
      // Use our async wrapper for presence.get
      getPresence(channelName).then(callback);
    };
    
    // Initial presence data
    updateCallback();
    
    // Subscribe to presence events
    channel.presence.subscribe('enter', updateCallback);
    channel.presence.subscribe('leave', updateCallback);
    channel.presence.subscribe('update', updateCallback);
  } catch (error) {
    console.error(`Error subscribing to presence for channel ${channelName}:`, error);
  }
};

/**
 * Clean up Ably resources
 */
export const cleanupAbly = (): void => {
  if (!ablyClient) {
    return;
  }
  
  try {
    // Get all active channels
    const channelKeys = Object.keys(ablyClient.channels.all);
    
    // Unsubscribe from all channels
    channelKeys.forEach(channelName => {
      const channel = ablyClient?.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        channel.detach();
      }
    });
    
    // Close connection
    ablyClient.close();
    ablyClient = null;
  } catch (error) {
    console.error('Error cleaning up Ably:', error);
  }
};
