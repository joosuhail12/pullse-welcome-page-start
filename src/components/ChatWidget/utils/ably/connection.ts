
import Ably from 'ably';
import { getChatSessionId } from '../cookies';
import {
  getAblyClient, setAblyClient, isInFallbackMode, setFallbackMode,
  getPendingMessages, setPendingMessages, processQueuedMessages, resubscribeToActiveChannels
} from './config';
import { getAblyAuthUrl } from '../../services/ablyAuth';
import { ChatEventType } from '../../config';
import { dispatchValidatedEvent, EventPriority } from '../../embed/enhancedEvents';
import { getAccessToken, getWorkspaceIdAndApiKey } from '../storage';

// Function to get Ably client configuration
export function getAblyClientConfig(apiKey?: string, userToken?: string): Ably.Types.ClientOptions {
  // Check if we have an API key first
  if (apiKey) {
    return { key: apiKey };
  }

  // Otherwise, use token auth
  return {
    authUrl: '/api/ably/auth',
    authMethod: 'POST',
    authHeaders: { 'Content-Type': 'application/json' },
    disconnectedRetryTimeout: 15000,
    suspendedRetryTimeout: 30000,
    transports: ['websocket', 'xhr_streaming'] as any, // Use the updated transport name
    fallbackHosts: [
      'a.ably-realtime.com',
      'b.ably-realtime.com',
      'c.ably-realtime.com',
      'd.ably-realtime.com',
      'e.ably-realtime.com'
    ]
  };
}

/**
 * Initialize Ably client with token auth
 * @param authUrl URL to fetch tokens from
 */
export const initializeAbly = async (authUrl: string): Promise<void> => {
  try {
    const client = getAblyClient();
    
    // If client already exists and is connected, just return
    if (client && client.connection.state === 'connected') {
      console.log('Ably already connected, skipping initialization');
      return;
    }
    
    // Verify that we have an access token before proceeding
    const accessToken = getAccessToken();
    if (!accessToken) {
      console.warn('Access token not found, Ably initialization aborted');
      enableLocalFallback();
      throw new Error('Access token not available');
    }

    const { workspaceId, apiKey } = getWorkspaceIdAndApiKey();
    
    if (!workspaceId) {
      console.warn('Workspace ID not found, Ably initialization aborted');
      enableLocalFallback();
      throw new Error('Workspace ID not available');
    }
    
    console.log(`Initializing Ably with token for workspace ${workspaceId}`);
    
    // Close existing client if it's in a bad state
    if (client) {
      if (['failed', 'closed', 'suspended'].includes(client.connection.state)) {
        console.log('Closing existing client in bad state before creating new one');
        try {
          client.close();
        } catch (e) {
          console.error('Error closing existing client:', e);
        }
        setAblyClient(null);
      } else if (['connecting', 'disconnected'].includes(client.connection.state)) {
        // For clients that are in the process of connecting, we'll wait a bit to see if they connect
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.log('Connection attempt timed out, creating new client');
            if (client && client.connection.state !== 'connected') {
              try {
                client.close();
              } catch (e) {
                console.error('Error closing existing client:', e);
              }
              setAblyClient(null);
              createAndConnectClient(authUrl, accessToken, workspaceId, apiKey).then(resolve);
            }
          }, 5000);
          
          client.connection.once('connected', () => {
            clearTimeout(timeout);
            console.log('Existing client connected successfully');
            resolve();
          });
        });
      }
    }
    
    // Create a new client
    await createAndConnectClient(authUrl, accessToken, workspaceId, apiKey);
  } catch (error) {
    console.error('Error initializing Ably:', error);
    enableLocalFallback();
    throw error;
  }
};

/**
 * Create and connect a new Ably client
 */
const createAndConnectClient = async (authUrl: string, accessToken: string, workspaceId: string, apiKey?: string) => {
  // Check if we already have a connected client
  const existingClient = getAblyClient();
  if (existingClient && existingClient.connection.state === 'connected') {
    console.log('Using existing connected client');
    return;
  }

  const newClient = new Ably.Realtime({
    authUrl: authUrl,
    authHeaders: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'x-workspace-id': workspaceId,
      'x-api-key': apiKey || ''
    },
    // Connection recovery options
    disconnectedRetryTimeout: 2000,  // Time to wait before attempting reconnection when disconnected
    suspendedRetryTimeout: 10000,    // Time to wait before attempting reconnection when suspended
    // Transport options
    transports: ['websocket', 'xhr_streaming'] as any,  // Use the updated transport name
    fallbackHosts: ['b-fallback.ably.io', 'c-fallback.ably.io'], // Fallback hosts if primary fails
  });

  setAblyClient(newClient);
  
  // Reset fallback mode when initializing
  setFallbackMode(false);

  // Set up connection state listeners
  setupConnectionStateListeners(newClient);

  // Wait for connection to be established
  return new Promise((resolve, reject) => {
    const timeoutMs = 15000; // 15 seconds timeout
    const currentClient = getAblyClient();
    
    if (!currentClient) {
      enableLocalFallback();
      reject(new Error('Ably client not initialized'));
      return;
    }

    // Set a timeout for the connection attempt
    const connectionTimeout = setTimeout(() => {
      console.warn('Ably connection timed out, enabling fallback');
      enableLocalFallback();
      reject(new Error('Connection timeout'));
    }, timeoutMs);

    // Handle immediate connection state
    switch (currentClient.connection.state) {
      case 'connected':
        clearTimeout(connectionTimeout);
        console.log('Ably already connected');
        processQueuedMessages();
        resubscribeToActiveChannels();
        resolve(true);
        break;
        
      case 'connecting':
        currentClient.connection.once('connected', () => {
          clearTimeout(connectionTimeout);
          console.log('Ably connected successfully');
          processQueuedMessages();
          resubscribeToActiveChannels();
          resolve(true);
        });

        currentClient.connection.once('failed', (err) => {
          clearTimeout(connectionTimeout);
          console.error('Ably connection failed:', err);
          enableLocalFallback();
          reject(err);
        });
        break;
        
      default:
        currentClient.connection.connect();

        currentClient.connection.once('connected', () => {
          clearTimeout(connectionTimeout);
          console.log('Ably connected successfully');
          processQueuedMessages();
          resubscribeToActiveChannels();
          resolve(true);
        });

        currentClient.connection.once('failed', (err) => {
          clearTimeout(connectionTimeout);
          console.error('Ably connection failed:', err);
          enableLocalFallback();
          reject(err);
        });
    }
  });
};

/**
 * Set up listeners for Ably connection state changes
 */
function setupConnectionStateListeners(client: Ably.Realtime) {
  if (!client) return;

  // Remove any existing listeners to avoid duplicates
  client.connection.off();

  // Connection state change handler
  client.connection.on('connected', () => {
    console.log('Ably connection established');
    setFallbackMode(false);
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'connected' }, EventPriority.HIGH);
    processQueuedMessages();
    resubscribeToActiveChannels();
  });

  client.connection.on('disconnected', () => {
    console.warn('Ably connection disconnected, attempting to reconnect');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'disconnected' }, EventPriority.HIGH);
  });

  client.connection.on('suspended', () => {
    console.warn('Ably connection suspended (multiple reconnection attempts failed)');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'suspended' }, EventPriority.HIGH);

    // After being suspended for 30 seconds, enable fallback mode
    setTimeout(() => {
      const client = getAblyClient();
      if (client && client.connection.state === 'suspended') {
        enableLocalFallback();
      }
    }, 30000);
  });

  client.connection.on('failed', (err: any) => {
    console.error('Ably connection failed permanently:', err?.reason);
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, {
      status: 'failed',
      error: err?.reason || 'Connection failed'
    }, EventPriority.HIGH);
    enableLocalFallback();
  });

  client.connection.on('closed', () => {
    console.log('Ably connection closed');
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'closed' }, EventPriority.HIGH);
  });
}

/**
 * Enable local fallback mode when Ably is unavailable
 */
export function enableLocalFallback(): void {
  if (isInFallbackMode()) return; // Already in fallback mode

  setFallbackMode(true);
  console.warn('Switching to local fallback mode due to Ably unavailability');
  dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'fallback' }, EventPriority.HIGH);
}

/**
 * Attempt to reconnect to Ably
 * @returns Promise resolving to a boolean indicating success or failure
 */
export const reconnectAbly = async (authUrl: string): Promise<boolean> => {
  // Check for access token before attempting reconnection
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.warn('Access token not found, Ably reconnection aborted');
    enableLocalFallback();
    return false;
  }

  const client = getAblyClient();
  if (!client) {
    try {
      await initializeAbly(authUrl);
      return true;
    } catch (error) {
      console.error('Failed to initialize Ably during reconnection:', error);
      return false;
    }
  }

  // If client exists but connection is in a recoverable state
  if (['disconnected', 'suspended', 'initialized'].includes(client.connection.state)) {
    return new Promise((resolve) => {
      // Try to reconnect
      client.connection.connect();

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
        client.connection.off('connected', connectedHandler);
        client.connection.off('failed', failureHandler);
      }

      client.connection.once('connected', connectedHandler);
      client.connection.once('failed', failureHandler);

      // Set a timeout to prevent waiting indefinitely
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 10000);
    });
  }

  // If connection is in a non-recoverable state, reinitialize
  if (['failed', 'closed'].includes(client.connection.state)) {
    try {
      client.close();
    } catch (e) {
      console.error('Error closing failed client:', e);
    }
    setAblyClient(null);
    try {
      await initializeAbly(authUrl);
      return true;
    } catch (error) {
      console.error('Failed to reinitialize Ably after failure:', error);
      return false;
    }
  }

  // Already connected
  if (client.connection.state === 'connected') {
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
      client.connection.off('connected', connectedHandler);
      client.connection.off('failed', failureHandler);
    }

    client.connection.once('connected', connectedHandler);
    client.connection.once('failed', failureHandler);

    // Set a timeout to prevent waiting indefinitely
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000);
  });
};

/**
 * Clean up Ably resources
 */
export const cleanupAbly = (): void => {
  const client = getAblyClient();
  if (!client) {
    return;
  }

  try {
    client.close();
    setAblyClient(null);
    setFallbackMode(false);
    setPendingMessages([]);
  } catch (error) {
    console.error('Error cleaning up Ably:', error);
  }
};

export const handleConnectionStateChange = (
  state: any,
  realtimeClient: Ably.Realtime,
  pendingMessages: Array<{ channelName: string; event: string; data: any }>,
  setPendingMessages: React.Dispatch<React.SetStateAction<Array<{ channelName: string; event: string; data: any }>>>
) => {
  // Handle connection state changes
  switch (state.current || state.state) {  // Handle both versions of connection state
    case 'connected':
      console.log('Ably connection established');
      setFallbackMode(false);
      dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'connected' }, EventPriority.HIGH);
      processQueuedMessages();
      resubscribeToActiveChannels();
      break;
    case 'disconnected':
      console.warn('Ably connection disconnected, attempting to reconnect');
      dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'disconnected' }, EventPriority.HIGH);
      break;
    case 'suspended':
      console.warn('Ably connection suspended (multiple reconnection attempts failed)');
      dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'suspended' }, EventPriority.HIGH);

      // After being suspended for 30 seconds, enable fallback mode
      setTimeout(() => {
        const client = getAblyClient();
        if (client && client.connection.state === 'suspended') {
          enableLocalFallback();
        }
      }, 30000);
      break;
    case 'failed':
      console.error('Ably connection failed permanently:', state.reason || (state.error && state.error.reason));
      dispatchValidatedEvent('chat:connectionChange' as ChatEventType, {
        status: 'failed',
        error: state.reason || (state.error && state.error.reason) || 'Connection failed'
      }, EventPriority.HIGH);
      enableLocalFallback();
      break;
    case 'closed':
      console.log('Ably connection closed');
      dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'closed' }, EventPriority.HIGH);
      break;
  }
};
