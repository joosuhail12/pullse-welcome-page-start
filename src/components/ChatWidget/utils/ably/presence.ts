
import Ably from 'ably';
import { v4 as uuidv4 } from 'uuid';
import { getChatSessionId } from '../cookies';
import { getAblyClient } from './config';

// Function to generate a unique presence ID
export const generatePresenceId = (): string => {
  return uuidv4();
};

// Function to enter presence on a channel with type assertions to access presence
export const enterPresence = async (channel: Ably.Types.RealtimeChannelBase, clientId: string, data?: any): Promise<void> => {
  try {
    // Cast the channel to include presence property
    const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
    if (channelWithPresence && channelWithPresence.presence) {
      await channelWithPresence.presence.enterClient(clientId, data);
      console.log(`Entered presence on channel ${channel.name} with clientId ${clientId}`);
    }
  } catch (error) {
    console.error(`Failed to enter presence on channel ${channel.name}:`, error);
    throw error;
  }
};

// Function to leave presence on a channel
export const leavePresence = async (channel: Ably.Types.RealtimeChannelBase, clientId: string): Promise<void> => {
  try {
    // Cast the channel to include presence property
    const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
    if (channelWithPresence && channelWithPresence.presence) {
      await channelWithPresence.presence.leaveClient(clientId);
      console.log(`Left presence on channel ${channel.name} with clientId ${clientId}`);
    }
  } catch (error) {
    console.error(`Failed to leave presence on channel ${channel.name}:`, error);
    throw error;
  }
};

// Function to get the current presence members on a channel
export const getPresence = async (channel: Ably.Types.RealtimeChannelBase): Promise<Ably.Types.PresenceMessage[]> => {
  try {
    // Cast the channel to include presence property
    const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
    if (channelWithPresence && channelWithPresence.presence) {
      const presence = await channelWithPresence.presence.get();
      console.log(`Current presence members on channel ${channel.name}:`, presence);
      return presence;
    }
    return [];
  } catch (error) {
    console.error(`Failed to get presence on channel ${channel.name}:`, error);
    return [];
  }
};

// Fix presence event registration with proper type casting
export const registerPresenceHandlers = (
  channel: Ably.Types.RealtimeChannelBase,
  onPresenceJoin?: (member: Ably.Types.PresenceMessage) => void,
  onPresenceLeave?: (member: Ably.Types.PresenceMessage) => void,
  onPresenceUpdate?: (member: Ably.Types.PresenceMessage) => void
) => {
  // Cast the channel to include presence property
  const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
  if (channelWithPresence && channelWithPresence.presence) {
    if (onPresenceJoin) {
      channelWithPresence.presence.subscribe('enter', onPresenceJoin);
    }
    if (onPresenceLeave) {
      channelWithPresence.presence.subscribe('leave', onPresenceLeave);
    }
    if (onPresenceUpdate) {
      channelWithPresence.presence.subscribe('update', onPresenceUpdate);
    }
  }
};

// Function to clear all presence subscriptions
export const clearPresenceHandlers = (channel: Ably.Types.RealtimeChannelBase) => {
  // Cast the channel to include presence property
  const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
  if (channelWithPresence && channelWithPresence.presence) {
    channelWithPresence.presence.unsubscribe();
    console.log(`Cleared all presence subscriptions on channel ${channel.name}`);
  }
};

/**
 * Subscribe to presence events on a channel
 */
export const subscribeToPresence = (
  channelName: string,
  callback: (members: Ably.Types.PresenceMessage[]) => void
): () => void => {
  const client = getAblyClient();
  if (!client) {
    console.warn('Ably client not initialized, subscription will be deferred');
    return () => {}; // Return empty cleanup function
  }

  try {
    const channel = client.channels.get(channelName);
    // Cast the channel to include presence property
    const channelWithPresence = channel as unknown as { presence: Ably.Types.RealtimePresenceBase };
    
    // Create handler to get all presence members
    const updatePresence = async () => {
      try {
        const members = await channelWithPresence.presence.get();
        callback(members || []);
      } catch (err) {
        console.error(`Error getting presence members for ${channelName}:`, err);
        callback([]);
      }
    };
    
    // Subscribe to relevant presence events
    channelWithPresence.presence.subscribe('enter', updatePresence);
    channelWithPresence.presence.subscribe('leave', updatePresence);
    channelWithPresence.presence.subscribe('update', updatePresence);
    
    // Get initial presence (don't check truthiness of void return)
    updatePresence().catch(err => {
      console.error(`Error getting initial presence for ${channelName}:`, err);
    });
    
    // Return cleanup function
    return () => {
      channelWithPresence.presence.unsubscribe();
    };
  } catch (error) {
    console.error(`Error subscribing to presence on ${channelName}:`, error);
    return () => {}; // Return empty cleanup function
  }
};
