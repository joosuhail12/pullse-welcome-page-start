
import Ably from 'ably';

// Client instance to ensure singleton pattern
let ablyClient: Ably.Realtime | null = null;
let localFallbackMode = false;
let pendingMessages: Array<{channelName: string, eventName: string, data: any}> = [];
let activeSubscriptions: Array<{channelName: string, eventName: string}> = [];

// Track attempts to subscribe to prevent duplicates
const subscriptionAttempts = new Set<string>();

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
  // Only add valid channel names to prevent issues
  if (!channelName || 
      channelName.includes('null') || 
      channelName.includes('undefined') ||
      channelName === 'session:null') {
    console.warn(`Not queueing message for invalid channel: ${channelName}`);
    return;
  }
  
  pendingMessages.push({ channelName, eventName, data });
};

export const clearPendingMessages = (): void => {
  pendingMessages = [];
};

// Check if a subscription has been attempted
export const hasAttemptedSubscription = (channelName: string, eventName: string): boolean => {
  return subscriptionAttempts.has(`${channelName}:${eventName}`);
};

// Mark a subscription as attempted
export const markSubscriptionAttempted = (channelName: string, eventName: string): void => {
  subscriptionAttempts.add(`${channelName}:${eventName}`);
};

// Clear subscription attempts
export const clearSubscriptionAttempts = (): void => {
  subscriptionAttempts.clear();
};

// Track active subscriptions
export const getActiveSubscriptions = (): Array<{channelName: string, eventName: string}> => {
  return activeSubscriptions;
};

export const addActiveSubscription = (channelName: string, eventName: string): void => {
  // Only add valid channel names to prevent issues
  if (!channelName || 
      channelName.includes('null') || 
      channelName.includes('undefined') ||
      channelName === 'session:null') {
    console.warn(`Not tracking invalid channel subscription: ${channelName}`);
    return;
  }
  
  // Check if subscription already exists
  const exists = activeSubscriptions.some(
    sub => sub.channelName === channelName && sub.eventName === eventName
  );
  
  if (!exists) {
    activeSubscriptions.push({ channelName, eventName });
  }
};

export const removeActiveSubscription = (channelName: string, eventName: string): void => {
  activeSubscriptions = activeSubscriptions.filter(
    sub => !(sub.channelName === channelName && sub.eventName === eventName)
  );
};

export const clearActiveSubscriptions = (): void => {
  activeSubscriptions = [];
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
      // Skip invalid channel names
      if (!channelName || 
          channelName.includes('null') || 
          channelName.includes('undefined') ||
          channelName === 'session:null') {
        console.warn(`Skipping queued message for invalid channel: ${channelName}`);
        return;
      }
      
      const channel = client.channels.get(channelName);
      channel.publish(eventName, data);
    } catch (err) {
      console.error(`Failed to process queued message to ${channelName}:`, err);
    }
  });
};

// Resubscribe to all active channels after reconnection
export const resubscribeToActiveChannels = (): void => {
  const client = getAblyClient();
  
  if (!client || client.connection.state !== 'connected' || activeSubscriptions.length === 0) {
    return;
  }
  
  console.log(`Resubscribing to ${activeSubscriptions.length} active channels`);
  
  // Group subscriptions by channel to avoid duplicate subscriptions
  const channelSubscriptions: Record<string, string[]> = {};
  
  activeSubscriptions.forEach(({ channelName, eventName }) => {
    // Skip invalid channel names
    if (!channelName || 
        channelName.includes('null') || 
        channelName.includes('undefined') ||
        channelName === 'session:null') {
      console.warn(`Not resubscribing to invalid channel: ${channelName}`);
      return;
    }
    
    if (!channelSubscriptions[channelName]) {
      channelSubscriptions[channelName] = [];
    }
    if (eventName !== '*') {
      channelSubscriptions[channelName].push(eventName);
    }
  });
  
  // Resubscribe to each channel
  Object.entries(channelSubscriptions).forEach(([channelName, events]) => {
    try {
      const channel = client.channels.get(channelName);
      channel.attach();
    } catch (err) {
      console.error(`Failed to resubscribe to channel ${channelName}:`, err);
    }
  });
};
