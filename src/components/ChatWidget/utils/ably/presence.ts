import Ably from 'ably';
import { v4 as uuidv4 } from 'uuid';
import { getChatSessionId } from '../cookies';

// Function to generate a unique presence ID
export const generatePresenceId = (): string => {
  return uuidv4();
};

// Function to enter presence on a channel
export const enterPresence = async (channel: Ably.Types.RealtimeChannel, clientId: string, data?: any): Promise<void> => {
  try {
    await channel.presence.enterClient(clientId, data);
    console.log(`Entered presence on channel ${channel.name} with clientId ${clientId}`);
  } catch (error) {
    console.error(`Failed to enter presence on channel ${channel.name}:`, error);
    throw error;
  }
};

// Function to leave presence on a channel
export const leavePresence = async (channel: Ably.Types.RealtimeChannel, clientId: string): Promise<void> => {
  try {
    await channel.presence.leaveClient(clientId);
    console.log(`Left presence on channel ${channel.name} with clientId ${clientId}`);
  } catch (error) {
    console.error(`Failed to leave presence on channel ${channel.name}:`, error);
    throw error;
  }
};

// Function to get the current presence members on a channel
export const getPresence = async (channel: Ably.Types.RealtimeChannel): Promise<Ably.Types.PresenceMessage[]> => {
  try {
    const presence = await channel.presence.get();
    console.log(`Current presence members on channel ${channel.name}:`, presence);
    return presence;
  } catch (error) {
    console.error(`Failed to get presence on channel ${channel.name}:`, error);
    return [];
  }
};

// Fix presence event registration
export const registerPresenceHandlers = (
  channel: Ably.Types.RealtimeChannel,
  onPresenceJoin?: (member: Ably.Types.PresenceMessage) => void,
  onPresenceLeave?: (member: Ably.Types.PresenceMessage) => void,
  onPresenceUpdate?: (member: Ably.Types.PresenceMessage) => void
) => {
  if (channel && channel.presence) {
    if (onPresenceJoin) {
      channel.presence.subscribe('enter', onPresenceJoin);
    }
    if (onPresenceLeave) {
      channel.presence.subscribe('leave', onPresenceLeave);
    }
    if (onPresenceUpdate) {
      channel.presence.subscribe('update', onPresenceUpdate);
    }
  }
};

// Function to clear all presence subscriptions
export const clearPresenceHandlers = (channel: Ably.Types.RealtimeChannel) => {
  if (channel && channel.presence) {
    channel.presence.unsubscribe();
    console.log(`Cleared all presence subscriptions on channel ${channel.name}`);
  }
};
