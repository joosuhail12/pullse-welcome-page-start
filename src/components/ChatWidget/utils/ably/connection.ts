
import Ably from 'ably';
import { getAblyClient, setAblyClient, setFallbackMode, isInFallbackMode } from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';
import { ChatEventType } from '../../config';
import { processQueuedMessages } from './messaging';
import { EventPriority } from '../../embed/enhancedEvents';

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
        channelRetryTimeout: 5000,       // Time to wait between channel attach attempts
        // Transport options
        transports: ['websocket', 'xhr'] as Ably.Types.Transport[],  // Preferred transports in order of priority
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
  
  client.connection.on('failed', (err) => {
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
