import Ably from 'ably';
import { v4 as uuidv4 } from 'uuid';
import { getChatSessionId } from '../cookies';
import { 
  getAblyClient, setAblyClient, isInFallbackMode, setFallbackMode,
  getPendingMessages, setPendingMessages, processQueuedMessages
} from './config';
import { getAblyAuthUrl } from '../../services/ablyAuth';
import { ChatEventType } from '../../config';
import { dispatchValidatedEvent, EventPriority } from '../../embed/enhancedEvents';
import { getAgentResponse } from '../simulateAgentTyping';

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
    transports: ['websocket', 'xhr'] as any, // Cast to any to avoid type issues
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
  const client = getAblyClient();
  if (client && client.connection.state === 'connected') {
    return; // Already initialized and connected
  }
  
  try {
    // Create a new client if we don't have one or previous connection failed
    if (!client || ['failed', 'closed', 'suspended'].includes(client.connection.state)) {
      // Use token authentication instead of API key
      const newClient = new Ably.Realtime({
        authUrl: authUrl,
        authMethod: 'POST',
        authHeaders: {
          'Content-Type': 'application/json'
        },
        // Connection recovery options
        disconnectedRetryTimeout: 2000,  // Time to wait before attempting reconnection when disconnected
        suspendedRetryTimeout: 10000,    // Time to wait before attempting reconnection when suspended
        // Transport options
        transports: ['websocket', 'xhr'] as any,  // Cast to any to avoid type issues
        fallbackHosts: ['b-fallback.ably.io', 'c-fallback.ably.io'], // Fallback hosts if primary fails
      });
      
      setAblyClient(newClient);
    }
    
    // Reset fallback mode when initializing
    setFallbackMode(false);
    
    // Set up connection state listeners
    setupConnectionStateListeners();
    
    // Wait for connection to be established
    return new Promise((resolve, reject) => {
      const client = getAblyClient();
      if (!client) {
        enableLocalFallback();
        reject(new Error('Ably client not initialized'));
        return;
      }
      
      // Handle immediate connection state
      switch (client.connection.state) {
        case 'connected':
          console.log('Ably already connected');
          resolve();
          break;
        case 'connecting':
          client.connection.once('connected', () => {
            console.log('Ably connected successfully');
            processQueuedMessages();
            resolve();
          });
          
          client.connection.once('failed', (err) => {
            console.error('Ably connection failed:', err);
            enableLocalFallback();
            reject(err);
          });
          break;
        default:
          client.connection.connect();
          
          client.connection.once('connected', () => {
            console.log('Ably connected successfully');
            processQueuedMessages();
            resolve();
          });
          
          client.connection.once('failed', (err) => {
            console.error('Ably connection failed:', err);
            enableLocalFallback();
            reject(err);
          });
          
          // Set a timeout for the initial connection
          setTimeout(() => {
            if (client && client.connection.state !== 'connected') {
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
  const client = getAblyClient();
  if (!client) return;
  
  // Remove any existing listeners to avoid duplicates
  client.connection.off();
  
  // Connection state change handler
  client.connection.on('connected', () => {
    console.log('Ably connection established');
    setFallbackMode(false);
    dispatchValidatedEvent('chat:connectionChange' as ChatEventType, { status: 'connected' }, EventPriority.HIGH);
    processQueuedMessages();
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
    client.close();
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
  state: any, // Simplify type to avoid issues
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
