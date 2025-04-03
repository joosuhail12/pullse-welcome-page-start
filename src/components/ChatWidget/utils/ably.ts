
import Ably from 'ably';
import { getReconnectionManager, ConnectionStatus } from './reconnectionManager';
import { createValidatedEvent } from './eventValidation';
import { dispatchValidatedEvent, EventPriority } from '../embed/enhancedEvents';
import { ChatEventType } from '../config';

// Client instance to ensure singleton pattern
let ablyClient: Ably.Realtime | null = null;
let localFallbackMode = false;
let pendingMessages: Array<{channelName: string, eventName: string, data: any}> = [];

/**
 * Initialize Ably client with token auth
 * @param authUrl URL to fetch tokens from
 */
export const initializeAbly = async (authUrl: string): Promise<void> => {
  if (ablyClient && ablyClient.connection.state === 'connected') {
    return; // Already initialized and connected
  }
  
  try {
    // Create a new client if we don't have one or previous connection failed
    if (!ablyClient || ['failed', 'closed', 'suspended'].includes(ablyClient.connection.state)) {
      // Use token authentication instead of API key
      ablyClient = new Ably.Realtime({
        authUrl: authUrl,
        authMethod: 'POST',
        authHeaders: {
          'Content-Type': 'application/json'
        },
        // Connection recovery options
        disconnectedRetryTimeout: 2000,  // Time to wait before attempting reconnection when disconnected
        suspendedRetryTimeout: 10000,    // Time to wait before attempting reconnection when suspended
        channelRetryTimeout: 5000,       // Time to wait between channel attach attempts
        // Transport options
        transports: ['websocket', 'xhr'],  // Preferred transports in order of priority
        fallbackHosts: ['b-fallback.ably.io', 'c-fallback.ably.io'], // Fallback hosts if primary fails
      } as Ably.Types.ClientOptions);
    }
    
    // Reset fallback mode when initializing
    localFallbackMode = false;
    
    // Set up connection state listeners
    setupConnectionStateListeners();
    
    // Wait for connection to be established
    return new Promise((resolve, reject) => {
      if (!ablyClient) {
        enableLocalFallback();
        reject(new Error('Ably client not initialized'));
        return;
      }
      
      // Handle immediate connection state
      switch (ablyClient.connection.state) {
        case 'connected':
          console.log('Ably already connected');
          resolve();
          break;
        case 'connecting':
          ablyClient.connection.once('connected', () => {
            console.log('Ably connected successfully');
            processQueuedMessages();
            resolve();
          });
          
          ablyClient.connection.once('failed', (err) => {
            console.error('Ably connection failed:', err);
            enableLocalFallback();
            reject(err);
          });
          break;
        default:
          ablyClient.connection.connect();
          
          ablyClient.connection.once('connected', () => {
            console.log('Ably connected successfully');
            processQueuedMessages();
            resolve();
          });
          
          ablyClient.connection.once('failed', (err) => {
            console.error('Ably connection failed:', err);
            enableLocalFallback();
            reject(err);
          });
          
          // Set a timeout for the initial connection
          setTimeout(() => {
            if (ablyClient && ablyClient.connection.state !== 'connected') {
              console.warn('Ably connection timed out, enabling fallback');
              enableLocalFallback();
              reject(new Error('Connection timeout'));
            }
          }, 10000);
      }
    });
  } catch (error) {
    console.error('Error initializing Ably:', error);
    enableLocalFallback();
    throw error;
  }
};

/**
 * Set up listeners for Ably connection state changes
 */
function setupConnectionStateListeners() {
  if (!ablyClient) return;
  
  // Remove any existing listeners to avoid duplicates
  ablyClient.connection.off();
  
  // Connection state change handler
  ablyClient.connection.on('connected', () => {
    console.log('Ably connection established');
    localFallbackMode = false;
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'connected' }, EventPriority.HIGH);
    processQueuedMessages();
  });
  
  ablyClient.connection.on('disconnected', () => {
    console.warn('Ably connection disconnected, attempting to reconnect');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'disconnected' }, EventPriority.HIGH);
  });
  
  ablyClient.connection.on('suspended', () => {
    console.warn('Ably connection suspended (multiple reconnection attempts failed)');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'suspended' }, EventPriority.HIGH);
    
    // After being suspended for 30 seconds, enable fallback mode
    setTimeout(() => {
      if (ablyClient && ablyClient.connection.state === 'suspended') {
        enableLocalFallback();
      }
    }, 30000);
  });
  
  ablyClient.connection.on('failed', (err) => {
    console.error('Ably connection failed permanently:', err);
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { 
      status: 'failed', 
      error: err?.message || 'Connection failed' 
    }, EventPriority.HIGH);
    enableLocalFallback();
  });
  
  ablyClient.connection.on('closed', () => {
    console.log('Ably connection closed');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'closed' }, EventPriority.HIGH);
  });
}

/**
 * Enable local fallback mode when Ably is unavailable
 */
function enableLocalFallback(): void {
  if (localFallbackMode) return; // Already in fallback mode
  
  localFallbackMode = true;
  console.warn('Switching to local fallback mode due to Ably unavailability');
  dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'fallback' }, EventPriority.HIGH);
}

/**
 * Process queued messages that couldn't be sent while disconnected
 */
function processQueuedMessages(): void {
  if (!ablyClient || ablyClient.connection.state !== 'connected' || pendingMessages.length === 0) {
    return;
  }
  
  console.log(`Processing ${pendingMessages.length} queued messages`);
  
  // Process and remove pending messages
  const messagesToProcess = [...pendingMessages];
  pendingMessages = [];
  
  messagesToProcess.forEach(({ channelName, eventName, data }) => {
    try {
      const channel = ablyClient!.channels.get(channelName);
      channel.publish(eventName, data);
    } catch (err) {
      console.error(`Failed to process queued message to ${channelName}:`, err);
    }
  });
}

/**
 * Attempt to reconnect to Ably
 * @returns Promise resolving to a boolean indicating success or failure
 */
export const reconnectAbly = async (authUrl: string): Promise<boolean> => {
  if (!ablyClient) {
    try {
      await initializeAbly(authUrl);
      return true;
    } catch (error) {
      console.error('Failed to initialize Ably during reconnection:', error);
      return false;
    }
  }
  
  // If client exists but connection is in a recoverable state
  if (['disconnected', 'suspended', 'initialized'].includes(ablyClient.connection.state)) {
    return new Promise((resolve) => {
      // Try to reconnect
      ablyClient!.connection.connect();
      
      // Listen for connection events
      const connectedHandler = () => {
        cleanup();
        resolve(true);
      };
      
      const failureHandler = () => {
        cleanup();
        resolve(false);
      };
      
      function cleanup() {
        ablyClient!.connection.off('connected', connectedHandler);
        ablyClient!.connection.off('failed', failureHandler);
      }
      
      ablyClient!.connection.once('connected', connectedHandler);
      ablyClient!.connection.once('failed', failureHandler);
      
      // Set a timeout to prevent waiting indefinitely
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 10000);
    });
  }
  
  // If connection is in a non-recoverable state, reinitialize
  if (['failed', 'closed'].includes(ablyClient.connection.state)) {
    ablyClient.close();
    ablyClient = null;
    try {
      await initializeAbly(authUrl);
      return true;
    } catch (error) {
      console.error('Failed to reinitialize Ably after failure:', error);
      return false;
    }
  }
  
  // Already connected
  if (ablyClient.connection.state === 'connected') {
    return true;
  }
  
  // Connecting - wait for result
  return new Promise((resolve) => {
    const connectedHandler = () => {
      cleanup();
      resolve(true);
    };
    
    const failureHandler = () => {
      cleanup();
      resolve(false);
    };
    
    function cleanup() {
      ablyClient!.connection.off('connected', connectedHandler);
      ablyClient!.connection.off('failed', failureHandler);
    }
    
    ablyClient!.connection.once('connected', connectedHandler);
    ablyClient!.connection.once('failed', failureHandler);
    
    // Set a timeout to prevent waiting indefinitely
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000);
  });
};

/**
 * Get the Ably client instance
 * @returns Ably client instance
 */
export const getAblyClient = (): Ably.Realtime | null => {
  return ablyClient;
};

/**
 * Check if using local fallback mode
 * @returns True if in fallback mode
 */
export const isInFallbackMode = (): boolean => {
  return localFallbackMode;
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
  if (localFallbackMode || !client || client.connection.state !== 'connected') {
    console.log(`Queueing message to ${channelName} (${eventName}) in fallback mode`);
    pendingMessages.push({ channelName, eventName, data });
    
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
    pendingMessages.push({ channelName, eventName, data });
    
    // Also dispatch local event for fallback
    const localEventType = `local:${channelName}:${eventName}` as ChatEventType;
    dispatchValidatedEvent(localEventType, data);
  }
};

/**
 * Get presence data for a channel
 * @param channelName Channel name to get presence for
 * @returns Promise resolving to presence data
 */
export const getPresence = async (channelName: string): Promise<Ably.Types.PresenceMessage[]> => {
  const client = getAblyClient();
  if (!client || localFallbackMode) {
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
  if (!client || localFallbackMode) {
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
    channel.presence.on ? channel.presence.on('error', (err) => {
      console.error(`Presence error on channel ${channelName}:`, err);
      setTimeout(updateCallback, 3000);
    }) : console.warn('Presence on method not available');
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
    // Get active channels using a different approach
    const channels = ablyClient.channels;
    
    // Since we can't directly access all channels, we need to 
    // keep track of channels we've created elsewhere or
    // just detach and close the connection
    ablyClient.close();
    ablyClient = null;
    localFallbackMode = false;
    pendingMessages = [];
  } catch (error) {
    console.error('Error cleaning up Ably:', error);
  }
};
