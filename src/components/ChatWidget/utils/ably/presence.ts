
import Ably from 'ably';
import { v4 as uuidv4 } from 'uuid';
import { getChatSessionId } from '../cookies';
import { getAblyClient } from './config';

// Function to generate a unique presence ID
export const generatePresenceId = (): string => {
  return uuidv4();
};

// Function to enter presence on a channel with more flexible type casting
export const enterPresence = async (channel: Ably.Types.RealtimeChannelBase, clientId: string, data?: any): Promise<void> => {
  try {
    // Use any type for better flexibility with Ably's changing API
    const presenceInterface = (channel as any).presence;
    if (presenceInterface) {
      await presenceInterface.enter(data);
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
    // Use any type for better flexibility with Ably's changing API
    const presenceInterface = (channel as any).presence;
    if (presenceInterface) {
      await presenceInterface.leave();
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
    // Use any type for better flexibility with Ably's changing API
    const presenceInterface = (channel as any).presence;
    if (presenceInterface) {
      const presence = await presenceInterface.get();
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
  // Use any type for better flexibility with Ably's changing API
  const presenceInterface = (channel as any).presence;
  if (presenceInterface) {
    if (onPresenceJoin) {
      presenceInterface.on('enter', onPresenceJoin);
    }
    if (onPresenceLeave) {
      presenceInterface.on('leave', onPresenceLeave);
    }
    if (onPresenceUpdate) {
      presenceInterface.on('update', onPresenceUpdate);
    }
  }
};

// Function to clear all presence subscriptions
export const clearPresenceHandlers = (channel: Ably.Types.RealtimeChannelBase) => {
  // Use any type for better flexibility with Ably's changing API
  const presenceInterface = (channel as any).presence;
  if (presenceInterface) {
    presenceInterface.off();
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
    
    // Create handler to get all presence members
    const updatePresence = async () => {
      try {
        // Get presence with proper type casting
        const members = await (channel as any).presence?.get();
        callback(members || []);
      } catch (err) {
        console.error(`Error getting presence members for ${channelName}:`, err);
        callback([]);
      }
    };
    
    // Get presence interface with any type to avoid API mismatch issues
    const presenceInterface = (channel as any).presence;
    
    if (!presenceInterface) {
      console.warn(`Presence interface not available for channel ${channelName}`);
      return () => {};
    }
    
    // Subscribe to relevant presence events
    presenceInterface.on('enter', updatePresence);
    presenceInterface.on('leave', updatePresence);
    presenceInterface.on('update', updatePresence);
    
    // Get initial presence
    updatePresence();
    
    // Return cleanup function
    return () => {
      if (presenceInterface) {
        presenceInterface.off();
      }
    };
  } catch (error) {
    console.error(`Error subscribing to presence on ${channelName}:`, error);
    return () => {}; // Return empty cleanup function
  }
};
