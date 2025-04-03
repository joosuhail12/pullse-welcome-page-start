
import Ably from 'ably';
import { getAblyClient, isInFallbackMode } from './config';

/**
 * Get presence data for a channel
 * @param channelName Channel name to get presence for
 * @returns Promise resolving to presence data
 */
export const getPresence = async (channelName: string): Promise<Ably.Types.PresenceMessage[]> => {
  const client = getAblyClient();
  if (!client || isInFallbackMode()) {
    console.warn('Ably client not initialized or in fallback mode, returning empty presence data');
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
  if (!client || isInFallbackMode()) {
    console.warn('Ably client not initialized or in fallback mode, presence subscription skipped');
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
    
    // Set up recovery for presence failures
    if (typeof channel.presence.on === 'function') {
      channel.presence.on('error', (err) => {
        console.error(`Presence error on channel ${channelName}:`, err);
        setTimeout(updateCallback, 3000);
      });
    } else {
      console.warn('Presence on method not available');
    }
    
  } catch (error) {
    console.error(`Error subscribing to presence for channel ${channelName}:`, error);
  }
};
