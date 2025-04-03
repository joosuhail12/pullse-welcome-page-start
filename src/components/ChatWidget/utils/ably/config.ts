
import Ably from 'ably';

// Client instance to ensure singleton pattern
let ablyClient: Ably.Realtime | null = null;
let localFallbackMode = false;
let pendingMessages: Array<{channelName: string, eventName: string, data: any}> = [];

// Export state getters/setters
export const getAblyClient = (): Ably.Realtime | null => {
  return ablyClient;
};

export const setAblyClient = (client: Ably.Realtime | null): void => {
  ablyClient = client;
};

export const isInFallbackMode = (): boolean => {
  return localFallbackMode;
};

export const setFallbackMode = (mode: boolean): void => {
  localFallbackMode = mode;
};

export const getPendingMessages = (): Array<{channelName: string, eventName: string, data: any}> => {
  return pendingMessages;
};

export const setPendingMessages = (messages: Array<{channelName: string, eventName: string, data: any}>): void => {
  pendingMessages = messages;
};

export const addPendingMessage = (channelName: string, eventName: string, data: any): void => {
  pendingMessages.push({ channelName, eventName, data });
};

export const clearPendingMessages = (): void => {
  pendingMessages = [];
};

// Process queued messages that couldn't be sent while disconnected
export const processQueuedMessages = (): void => {
  const client = getAblyClient();
  
  if (!client || client.connection.state !== 'connected' || pendingMessages.length === 0) {
    return;
  }
  
  console.log(`Processing ${pendingMessages.length} queued messages`);
  
  // Process and remove pending messages
  const messagesToProcess = [...pendingMessages];
  setPendingMessages([]);
  
  messagesToProcess.forEach(({ channelName, eventName, data }) => {
    try {
      const channel = client.channels.get(channelName);
      channel.publish(eventName, data);
    } catch (err) {
      console.error(`Failed to process queued message to ${channelName}:`, err);
    }
  });
};
