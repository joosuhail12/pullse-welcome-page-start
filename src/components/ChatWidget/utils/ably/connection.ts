
import Ably from 'ably';
import { log, error } from '@/lib/logger';
import { getAuthToken } from '../serverSideAuth';
import { getConfig, saveConfig } from './config';
import { parseAblyError } from '../resilience';

export const ABLY_TOKEN_ENDPOINT = '/api/chat/ably-auth';
export const ABLY_TOKEN_QUERY = 'action=request-token';

export type AblyInstance = Ably.Realtime;
export type AblyChannel = Ably.Types.RealtimeChannelPromise;
export type AblyTokenDetails = Ably.Types.TokenDetails;
export type Transport = 'web_socket' | 'xhr_polling' | 'xhr_streaming';

// Singleton pattern for Ably instance
let _ablyInstance: AblyInstance | null = null;
let _lastTokenDetails: AblyTokenDetails | null = null;
let _connectionState: Ably.Types.ConnectionState = 'initialized';
let _channels: Record<string, AblyChannel> = {};

/**
 * Initialize the Ably client with the provided token
 */
export const initializeAbly = (token: string): AblyInstance | null => {
  try {
    log('Initializing Ably with token', 'ably');
    
    if (_ablyInstance) {
      // If we already have an instance, update the token if needed
      if (_connectionState === 'connected') {
        return _ablyInstance;
      }
      
      // Close the existing connection if it's in a failed state
      try {
        _ablyInstance.close();
      } catch (e) {
        // Ignore errors when closing
      }
      _ablyInstance = null;
    }
    
    // Create a new Ably Realtime instance
    _ablyInstance = new Ably.Realtime({
      authCallback: async (_, callback) => {
        try {
          // Use the token we already have
          callback(null, token);
        } catch (err) {
          callback(err as Error, null);
        }
      },
      log: {
        level: 4, // error only
        handler: (_, msg) => {
          console.log(msg);
        }
      },
      transports: ['web_socket', 'xhr_streaming', 'xhr_polling'],
      closeOnUnload: true
    });
    
    // Listen for connection state changes
    _ablyInstance.connection.on((stateChange: Ably.Types.ConnectionStateChange) => {
      _connectionState = stateChange.current;
      log(`Ably connection state: ${stateChange.current}`, 'ably');
      
      if (stateChange.current === 'connected') {
        // Successfully connected
        log('Ably connected successfully', 'ably');
      } else if (stateChange.current === 'failed') {
        error('Ably connection failed: ' + stateChange.reason?.message, 'ably');
      }
    });
    
    return _ablyInstance;
  } catch (err) {
    error('Failed to initialize Ably', 'ably');
    console.error(err);
    return null;
  }
};

/**
 * Reconnect to Ably, optionally with a new token
 */
export const reconnectAbly = async (token?: string): Promise<boolean> => {
  try {
    // If we have a new token, use it
    const tokenToUse = token || (await getAuthToken());
    if (!tokenToUse) {
      error('No token available for Ably reconnection', 'ably');
      return false;
    }
    
    _ablyInstance = initializeAbly(tokenToUse);
    return !!_ablyInstance;
  } catch (err) {
    error('Failed to reconnect to Ably: ' + parseAblyError(err), 'ably');
    return false;
  }
};

/**
 * Get or create an Ably channel by name
 */
export const getChannel = (channelName: string): AblyChannel | null => {
  if (!_ablyInstance) return null;
  
  if (!_channels[channelName]) {
    _channels[channelName] = _ablyInstance.channels.get(channelName);
  }
  
  return _channels[channelName];
};

/**
 * Release an Ably channel
 */
export const releaseChannel = (channelName: string): void => {
  if (!_ablyInstance || !_channels[channelName]) return;
  
  try {
    _channels[channelName].unsubscribe();
    delete _channels[channelName];
  } catch (err) {
    error(`Error releasing channel ${channelName}: ${parseAblyError(err)}`, 'ably');
  }
};

/**
 * Get the connection state
 */
export const getConnectionState = (): Ably.Types.ConnectionState => {
  return _connectionState;
};

/**
 * Close the Ably connection
 */
export const closeAblyConnection = (): void => {
  if (!_ablyInstance) return;
  
  try {
    // Unsubscribe from all channels first
    Object.keys(_channels).forEach(channelName => {
      try {
        _channels[channelName].unsubscribe();
      } catch (e) {
        // Ignore errors
      }
    });
    
    _channels = {};
    _ablyInstance.close();
    _ablyInstance = null;
    _connectionState = 'closed';
  } catch (err) {
    error(`Error closing Ably connection: ${parseAblyError(err)}`, 'ably');
  }
};

/**
 * Get the Ably instance
 */
export const getAblyInstance = (): AblyInstance | null => {
  return _ablyInstance;
};
