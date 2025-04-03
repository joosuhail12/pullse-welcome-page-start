
import Ably from 'ably';

// Client instance to ensure singleton pattern
let ablyClient: Ably.Realtime | null = null;
let connectionState: Ably.Types.ConnectionState = 'disconnected';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL_MS = 3000;

/**
 * Initialize Ably client with token auth
 * @param authUrl URL to fetch tokens from
 */
export const initializeAbly = async (authUrl: string): Promise<void> => {
  if (ablyClient) {
    return; // Already initialized
  }
  
  try {
    console.log('Initializing Ably client with auth URL:', authUrl);
    
    // Use token authentication instead of API key
    ablyClient = new Ably.Realtime({
      authUrl: authUrl,
      authMethod: 'POST',
      authHeaders: {
        'Content-Type': 'application/json'
      },
      // Add connection recovery options
      recover: function(lastConnectionDetails, cb) {
        // Decide whether to recover connection based on last session
        if (lastConnectionDetails && Date.now() - lastConnectionDetails.disconnectedAt < 60000) {
          cb(true); // Recover if disconnection was less than 1 minute ago
        } else {
          cb(false); // Don't recover connection (start new session)
        }
      }
    });
    
    // Set up connection state listeners
    setupConnectionListeners();
    
    // Wait for connection to be established
    return new Promise((resolve, reject) => {
      if (!ablyClient) {
        reject(new Error('Ably client not initialized'));
        return;
      }
      
      ablyClient.connection.once('connected', () => {
        console.log('Ably connected successfully');
        connectionState = 'connected';
        reconnectAttempts = 0;
        resolve();
      });
      
      ablyClient.connection.once('failed', (err) => {
        console.error('Ably connection failed:', err);
        connectionState = 'failed';
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error initializing Ably:', error);
    throw error;
  }
};

/**
 * Set up connection state listeners
 */
const setupConnectionListeners = () => {
  if (!ablyClient) return;
  
  ablyClient.connection.on((stateChange) => {
    console.log('Ably connection state changed:', stateChange.current);
    connectionState = stateChange.current;
    
    // Handle disconnection
    if (stateChange.current === 'disconnected') {
      console.log('Ably disconnected. Will attempt to reconnect...');
    }
    
    // Handle suspension (longer disconnection)
    if (stateChange.current === 'suspended') {
      handleSuspendedConnection();
    }
    
    // Handle reconnection success
    if (stateChange.previous === 'connecting' && stateChange.current === 'connected') {
      console.log('Ably reconnected successfully');
      reconnectAttempts = 0;
      
      // Synchronize state after reconnection - emit event that subscribers can listen for
      const event = new CustomEvent('ably:reconnected', { detail: { timestamp: Date.now() } });
      window.dispatchEvent(event);
    }
  });
};

/**
 * Handle a suspended connection with exponential backoff
 */
const handleSuspendedConnection = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check your network connection.`);
    return;
  }
  
  const delay = RECONNECT_INTERVAL_MS * Math.pow(1.5, reconnectAttempts);
  reconnectAttempts++;
  
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);
  
  setTimeout(() => {
    if (ablyClient && connectionState !== 'connected') {
      console.log('Initiating manual reconnection...');
      ablyClient.connection.connect();
    }
  }, delay);
};

/**
 * Get the current connection state
 */
export const getConnectionState = (): Ably.Types.ConnectionState => {
  return connectionState;
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
    const channel = client.channels.get(channelName, {
      params: { rewind: '1' } // Get the last message sent on this channel
    });
    
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
 * @returns Promise that resolves when message is published
 */
export const publishToChannel = (
  channelName: string,
  eventName: string,
  data: any
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const client = getAblyClient();
    if (!client) {
      console.warn('Ably client not initialized');
      reject(new Error('Ably client not initialized'));
      return;
    }
    
    try {
      const channel = client.channels.get(channelName);
      
      // Handle different connection states
      if (connectionState === 'connected' || connectionState === 'connecting') {
        // Publish with callback to confirm delivery
        channel.publish(eventName, data, (err) => {
          if (err) {
            console.error(`Error publishing to channel ${channelName}:`, err);
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        // Queue message for later delivery and listen for reconnection
        const reconnectHandler = () => {
          window.removeEventListener('ably:reconnected', reconnectHandler);
          
          // Try again after reconnection
          const retryChannel = client.channels.get(channelName);
          retryChannel.publish(eventName, data, (err) => {
            if (err) {
              console.error(`Error publishing to channel ${channelName} after reconnection:`, err);
              reject(err);
            } else {
              resolve();
            }
          });
        };
        
        window.addEventListener('ably:reconnected', reconnectHandler);
        
        // Also set a timeout for the reconnection
        setTimeout(() => {
          window.removeEventListener('ably:reconnected', reconnectHandler);
          reject(new Error('Connection timeout while waiting to publish message'));
        }, 30000); // 30 second timeout
      }
    } catch (error) {
      console.error(`Error accessing channel ${channelName}:`, error);
      reject(error);
    }
  });
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
 * @returns Function to unsubscribe
 */
export const subscribeToPresence = (
  channelName: string,
  callback: (presenceData: Ably.Types.PresenceMessage[]) => void
): () => void => {
  const client = getAblyClient();
  if (!client) {
    console.warn('Ably client not initialized');
    return () => {};
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
    
    // Return unsubscribe function
    return () => {
      try {
        channel.presence.unsubscribe('enter', updateCallback);
        channel.presence.unsubscribe('leave', updateCallback);
        channel.presence.unsubscribe('update', updateCallback);
      } catch (e) {
        console.error('Error unsubscribing from presence:', e);
      }
    };
  } catch (error) {
    console.error(`Error subscribing to presence for channel ${channelName}:`, error);
    return () => {};
  }
};

/**
 * Create a connection status monitor that reports connection status changes
 * @param onStatusChange Callback for connection status changes
 * @returns Function to stop monitoring
 */
export const createConnectionMonitor = (
  onStatusChange: (state: Ably.Types.ConnectionState, timeInState: number) => void
): () => void => {
  if (!ablyClient) {
    console.warn('Ably client not initialized');
    return () => {};
  }
  
  const statusHandler = () => {
    if (!ablyClient) return;
    onStatusChange(ablyClient.connection.state, ablyClient.connection.timeSerial);
  };
  
  // Initial status
  statusHandler();
  
  // Listen for all connection state changes
  ablyClient.connection.on(statusHandler);
  
  // Return cleanup function
  return () => {
    if (ablyClient) {
      ablyClient.connection.off(statusHandler);
    }
  };
};

/**
 * Clean up Ably resources
 */
export const cleanupAbly = (): void => {
  if (!ablyClient) {
    return;
  }
  
  try {
    console.log('Cleaning up Ably resources');
    
    // Close all channels explicitly before closing the connection
    for (const channelName in ablyClient.channels.all) {
      try {
        const channel = ablyClient.channels.get(channelName);
        channel.detach();
      } catch (e) {
        console.error(`Error detaching channel ${channelName}:`, e);
      }
    }
    
    ablyClient.close();
    ablyClient = null;
    connectionState = 'disconnected';
    reconnectAttempts = 0;
  } catch (error) {
    console.error('Error cleaning up Ably:', error);
  }
};

/**
 * Subscribe to connection state changes
 * @param callback Callback to run when connection state changes
 * @returns Function to unsubscribe
 */
export const subscribeToConnectionState = (
  callback: (state: Ably.Types.ConnectionState) => void
): () => void => {
  if (!ablyClient) {
    console.warn('Ably client not initialized');
    return () => {};
  }
  
  const handler = (stateChange: Ably.Types.ConnectionStateChange) => {
    callback(stateChange.current);
  };
  
  ablyClient.connection.on(handler);
  
  return () => {
    if (ablyClient) {
      ablyClient.connection.off(handler);
    }
  };
};
