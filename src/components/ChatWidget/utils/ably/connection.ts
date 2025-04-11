
import Ably from 'ably';
import { getAblyClient, setAblyClient, setFallbackMode, processQueuedMessages, resubscribeToActiveChannels } from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';

// A simple backoff algorithm for reconnection attempts
let reconnectAttempts = 0;
const getReconnectDelay = () => Math.min(1000 * Math.pow(1.5, reconnectAttempts), 30000);

// Initialize Ably client with options
export const initializeAblyClient = (
  apiKey?: string,
  authUrl?: string,
  clientId?: string,
  jwtToken?: string
): Ably.Realtime | null => {
  if (getAblyClient()) {
    console.log('Ably client already initialized');
    return getAblyClient();
  }
  
  if (!apiKey && !authUrl && !jwtToken) {
    console.warn('No Ably credentials provided, entering fallback mode');
    setFallbackMode(true);
    return null;
  }
  
  try {
    const options: Ably.Types.ClientOptions = {
      clientId: clientId || 'widget-' + Math.random().toString(36).substring(2, 9),
      closeOnUnload: true,
      idempotentRestPublishing: true,
      echoMessages: false,
      recover: function(lastConnectionDetails, cb) {
        // Decide whether to recover
        cb(true);
      },
      transportParams: {
        heartbeatInterval: 15000, // 15 seconds
        remainPresentFor: 30000    // 30 seconds
      }
    };
    
    // Prioritize different auth methods
    if (jwtToken) {
      options.token = jwtToken;
    } else if (authUrl) {
      options.authUrl = authUrl;
    } else if (apiKey) {
      options.key = apiKey;
    }
    
    // In production environments, prefer websockets
    if (import.meta.env.PROD) {
      options.transports = ['web_socket'];
    }
    
    // Create client
    const client = new Ably.Realtime(options);
    
    // Handle connection state changes
    client.connection.on((stateChange: Ably.Types.ConnectionStateChange) => {
      console.log(`Ably: Connection state: ${stateChange.current}${stateChange.reason ? `; reason: ${stateChange.reason}` : ''}`);
      
      // Dispatch connection state change event for UI updates
      dispatchValidatedEvent('chat:connectionChange', {
        state: stateChange.current,
        previous: stateChange.previous,
        reason: stateChange.reason
      });
      
      // Handle reconnection
      if (stateChange.current === 'connected') {
        // Reset reconnect attempts on successful connection
        reconnectAttempts = 0;
        
        // Process queued messages and resubscribe to channels
        processQueuedMessages();
        resubscribeToActiveChannels();
      } else if (stateChange.current === 'disconnected' || stateChange.current === 'suspended') {
        // Increment reconnect attempts for backoff calculation
        reconnectAttempts++;
      }
    });
    
    // Set client in shared state
    setAblyClient(client);
    setFallbackMode(false);
    
    return client;
  } catch (error) {
    console.error('Failed to initialize Ably client:', error);
    setFallbackMode(true);
    return null;
  }
};

/**
 * Close the Ably client connection safely
 */
export const closeAblyConnection = (): Promise<void> => {
  const client = getAblyClient();
  if (!client) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    try {
      client.connection.once('closed', () => {
        setAblyClient(null);
        resolve();
      });
      
      client.close();
      
      // Set a timeout to force resolve if the closed event doesn't fire
      setTimeout(() => {
        if (getAblyClient() === client) {
          setAblyClient(null);
        }
        resolve();
      }, 3000);
    } catch (error) {
      console.error('Error closing Ably connection:', error);
      setAblyClient(null);
      resolve();
    }
  });
};
