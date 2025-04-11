
import Ably from 'ably';
import { getAblyClient, setAblyClient, setFallbackMode, resubscribeToActiveChannels, processQueuedMessages } from './config';
import { dispatchValidatedEvent } from '../../embed/enhancedEvents';

// Connection state tracking
let reconnectTimer: number | undefined;
const connectionStates = {
  lastState: '',
  disconnectedSince: 0
};

// Initialize the Ably client with the provided API key
export const initializeAblyClient = (apiKey: string, clientOptions?: Ably.Types.ClientOptions): Ably.Realtime => {
  let client = getAblyClient();
  
  // If client already exists, return it
  if (client) {
    console.log('Ably client already initialized');
    return client;
  }
  
  try {
    // Create a new client
    const options: Ably.Types.ClientOptions = {
      ...clientOptions,
      autoConnect: false,
      logLevel: import.meta.env.DEV ? 3 : 1 // More logs in development
    };
    
    client = new Ably.Realtime({ key: apiKey, ...options });
    
    // Set up connection state change handler
    client.connection.on('connected', () => {
      console.log('Ably client connected');
      dispatchValidatedEvent('chat:connectionChange', { state: 'connected' });
      
      // When we reconnect:
      if (connectionStates.lastState === 'disconnected' || connectionStates.lastState === 'suspended') {
        console.log('Reconnected after being disconnected');
        
        // Resubscribe to active channels
        resubscribeToActiveChannels();
        
        // Process any queued messages
        processQueuedMessages();
        
        // Exit fallback mode
        setFallbackMode(false);
      }
      
      // Clear any reconnect timers
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }
      
      // Update last state
      connectionStates.lastState = 'connected';
    });
    
    client.connection.on('disconnected', () => {
      console.warn('Ably client disconnected, will attempt to reconnect');
      dispatchValidatedEvent('chat:connectionChange', { state: 'disconnected' });
      
      // Enter fallback mode if disconnected for more than 5 seconds
      reconnectTimer = window.setTimeout(() => {
        setFallbackMode(true);
        console.log('Entering fallback mode due to prolonged disconnection');
      }, 5000);
      
      // Record when disconnection occurred
      if (connectionStates.lastState !== 'disconnected') {
        connectionStates.disconnectedSince = Date.now();
      }
      
      // Update last state
      connectionStates.lastState = 'disconnected';
    });
    
    client.connection.on('suspended', () => {
      console.warn('Ably client suspended, connection attempts failed');
      dispatchValidatedEvent('chat:connectionChange', { state: 'suspended' });
      
      // Enter fallback mode
      setFallbackMode(true);
      
      // Update last state
      connectionStates.lastState = 'suspended';
    });
    
    client.connection.on('failed', (err) => {
      console.error('Ably client connection failed', err);
      dispatchValidatedEvent('chat:connectionChange', { state: 'failed', error: err });
      
      // Enter fallback mode
      setFallbackMode(true);
      
      // Update last state
      connectionStates.lastState = 'failed';
    });
    
    // Save the client
    setAblyClient(client);
    
    // Connect to Ably
    client.connect();
    
    return client;
  } catch (error) {
    console.error('Error initializing Ably client:', error);
    dispatchValidatedEvent('chat:connectionChange', { state: 'failed', error });
    
    // Enter fallback mode on initialization error
    setFallbackMode(true);
    
    throw error;
  }
};

// Get the current connection state
export const getConnectionState = (): string => {
  const client = getAblyClient();
  if (!client) return 'disconnected';
  return client.connection.state;
};

// Reconnect to Ably
export const reconnectAbly = (): void => {
  const client = getAblyClient();
  
  if (!client) {
    console.warn('Cannot reconnect: No Ably client initialized');
    return;
  }
  
  try {
    client.connect();
  } catch (error) {
    console.error('Error reconnecting to Ably:', error);
  }
};

// Close the Ably connection
export const closeAblyConnection = (): void => {
  const client = getAblyClient();
  
  if (!client) return;
  
  try {
    client.close();
  } catch (error) {
    console.error('Error closing Ably connection:', error);
  }
};

// Clean up Ably resources
export const cleanupAbly = (): void => {
  closeAblyConnection();
  setAblyClient(null);
  
  // Clear any reconnect timers
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
};
