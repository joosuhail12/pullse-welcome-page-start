
import * as Ably from 'ably';
import { getChatSessionId } from './cookies';
import { getOrCreateSessionId, generateClientId } from './security';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';
import { EventPriority } from './eventValidation';
import { dispatchChatEvent } from './events';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { SecurityEventType } from './securityTypes';
import { ChatWidgetConfig } from '../config';

// Client instance
let realtimeClient: Ably.Realtime | null = null;
const subscribedChannels: Map<string, Ably.Types.RealtimeChannel> = new Map();

/**
 * Initialize the Ably client
 * @param authUrl Authentication URL for Ably
 * @returns Initialized Ably client
 */
export function initializeAblyClient(authUrl: string): Ably.Realtime {
  try {
    if (realtimeClient) {
      return realtimeClient;
    }

    logger.info('Initializing Ably client', 'ably.initializeAbly');
    
    // Get or create client ID
    const clientId = generateClientId();
    
    const clientOptions: Ably.Types.ClientOptions = {
      authUrl,
      authMethod: 'POST',
      authHeaders: {
        'Content-Type': 'application/json'
      },
      // Recovery and connection resilience
      disconnectedRetryTimeout: 10000, // 10 seconds
      suspendedRetryTimeout: 30000,    // 30 seconds
      // Force WebSocket for best performance
      transports: ['web_socket'],
      // Use our client ID for authentication
      clientId,
      // Allow fallback hosts in case of connectivity issues
      fallbackHosts: [
        'a.ably-realtime.com',
        'b.ably-realtime.com',
        'c.ably-realtime.com',
        'd.ably-realtime.com',
        'e.ably-realtime.com'
      ]
    };

    // Create client
    realtimeClient = new Ably.Realtime(clientOptions);
    
    // Set up connection listeners
    setupConnectionListeners(realtimeClient);
    
    return realtimeClient;
  } catch (error) {
    const safeErrorMessage = sanitizeErrorMessage(error);
    logger.error('Failed to initialize Ably client', 'ably.initializeAbly', { error: safeErrorMessage });
    throw error;
  }
}

/**
 * Set up connection state change listeners
 * @param client Ably client instance
 */
function setupConnectionListeners(client: Ably.Realtime): void {
  client.connection.on((stateChange) => {
    const newState = stateChange.current;
    const previousState = stateChange.previous;
    const reason = stateChange.reason;
    
    logger.info(
      `Ably connection state changed: ${previousState} -> ${newState}`,
      'ably.connectionStateChange',
      { reason: reason ? sanitizeErrorMessage(reason) : 'No reason provided' }
    );
    
    // Dispatch connection state change event
    dispatchChatEvent('chat:connectionChange', {
      connectionState: newState,
      previousState,
      reason: reason ? sanitizeErrorMessage(reason.message) : undefined
    });
    
    // Handle specific state changes
    if (newState === 'connected') {
      dispatchChatEvent('chat:open', {
        connectionId: client.connection.id,
        timestamp: new Date()
      });
    } else if (newState === 'disconnected') {
      dispatchChatEvent('chat:error', {
        error: 'connection_lost',
        message: 'Connection to chat service lost. Attempting to reconnect...',
        timestamp: new Date()
      });
    } else if (newState === 'suspended') {
      dispatchChatEvent('chat:error', {
        error: 'connection_suspended',
        message: 'Connection to chat service suspended after multiple failed attempts.',
        timestamp: new Date()
      });
    } else if (newState === 'failed') {
      dispatchChatEvent('chat:error', {
        error: 'connection_failed',
        message: 'Failed to connect to chat service.',
        timestamp: new Date()
      }, EventPriority.HIGH);
    } else if (newState === 'closed') {
      dispatchChatEvent('chat:close', {
        reason: reason ? sanitizeErrorMessage(reason.message) : 'Connection closed',
        timestamp: new Date()
      }, EventPriority.MEDIUM);
    }
  });
}

/**
 * Reconnect to Ably
 * @returns Promise resolving when reconnection is attempted
 */
export async function reconnectAbly(): Promise<void> {
  if (!realtimeClient) {
    logger.warn('Cannot reconnect: Ably client not initialized', 'ably.reconnectAbly');
    return;
  }
  
  logger.info('Attempting to reconnect to Ably', 'ably.reconnectAbly');
  
  try {
    await realtimeClient.connection.connect();
  } catch (error) {
    logger.error('Failed to reconnect to Ably', 'ably.reconnectAbly', {
      error: sanitizeErrorMessage(error)
    });
  }
}

/**
 * Close the Ably connection
 */
export function closeAblyConnection(): void {
  if (!realtimeClient) {
    return;
  }
  
  logger.info('Closing Ably connection', 'ably.closeAblyConnection');
  
  // Close all subscribed channels first
  subscribedChannels.forEach((channel, name) => {
    logger.debug(`Detaching from channel: ${name}`, 'ably.closeAblyConnection');
    channel.detach().catch(err => {
      logger.warn(`Failed to detach from channel ${name}`, 'ably.closeAblyConnection', {
        error: sanitizeErrorMessage(err)
      });
    });
  });
  
  // Clear the map
  subscribedChannels.clear();
  
  // Close the connection
  realtimeClient.close();
  realtimeClient = null;
}

/**
 * Subscribe to a channel and event
 * @param channelName Channel name
 * @param eventName Event name
 * @param callback Callback function
 * @returns Subscription object with unsubscribe method
 */
export function subscribeToChannel(
  channelName: string,
  eventName: string,
  callback: (message: any) => void
) {
  if (!realtimeClient) {
    logger.warn(`Cannot subscribe to ${channelName}:${eventName}: Ably client not initialized`, 'ably.subscribeToChannel');
    return {
      unsubscribe: () => {}
    };
  }

  // Get or create channel
  let channel: Ably.Types.RealtimeChannel;
  
  if (subscribedChannels.has(channelName)) {
    channel = subscribedChannels.get(channelName)!;
  } else {
    channel = realtimeClient.channels.get(channelName);
    subscribedChannels.set(channelName, channel);
  }

  // Subscribe to event
  channel.subscribe(eventName, callback);

  // Return unsubscribe function
  return {
    unsubscribe: () => {
      channel.unsubscribe(eventName, callback);
    }
  };
}

/**
 * Publish an event to a channel
 * @param channelName Channel name
 * @param eventName Event name
 * @param data Event data
 */
export function publishToChannel(
  channelName: string,
  eventName: string,
  data: any
): void {
  if (!realtimeClient) {
    logger.warn(`Cannot publish to ${channelName}:${eventName}: Ably client not initialized`, 'ably.publishToChannel');
    return;
  }

  // Get or create channel
  let channel: Ably.Types.RealtimeChannel;
  
  if (subscribedChannels.has(channelName)) {
    channel = subscribedChannels.get(channelName)!;
  } else {
    channel = realtimeClient.channels.get(channelName);
    subscribedChannels.set(channelName, channel);
  }

  // Publish event
  channel.publish(eventName, data);
}

/**
 * Check if the client is in fallback mode
 * @returns true if in fallback mode, false otherwise
 */
export function isInFallbackMode(): boolean {
  if (!realtimeClient) {
    return true;
  }
  
  return realtimeClient.connection.state === 'suspended' || 
         realtimeClient.connection.state === 'failed' ||
         realtimeClient.connection.state === 'closed';
}

/**
 * Get presence for a channel
 * @param channelName Channel name
 * @returns Promise resolving with presence data
 */
export async function getPresence(channelName: string): Promise<any[]> {
  if (!realtimeClient) {
    logger.warn(`Cannot get presence for ${channelName}: Ably client not initialized`, 'ably.getPresence');
    return [];
  }

  try {
    // Get channel
    const channel = realtimeClient.channels.get(channelName);
    
    // Get presence
    const presenceData = await channel.presence.get();
    
    return presenceData;
  } catch (error) {
    logger.error(`Failed to get presence for ${channelName}`, 'ably.getPresence', {
      error: sanitizeErrorMessage(error)
    });
    
    return [];
  }
}

/**
 * Subscribe to presence events on a channel
 * @param channelName Channel name
 * @param callback Callback function
 * @returns Subscription object with unsubscribe method
 */
export function subscribeToPresence(
  channelName: string,
  callback: (presenceData: any) => void
) {
  if (!realtimeClient) {
    logger.warn(`Cannot subscribe to presence for ${channelName}: Ably client not initialized`, 'ably.subscribeToPresence');
    return {
      unsubscribe: () => {}
    };
  }

  // Get channel
  const channel = realtimeClient.channels.get(channelName);
  
  // Subscribe to presence events
  channel.presence.subscribe('enter', (member) => {
    callback({
      action: 'enter',
      member
    });
  });
  
  channel.presence.subscribe('leave', (member) => {
    callback({
      action: 'leave',
      member
    });
  });
  
  channel.presence.subscribe('update', (member) => {
    callback({
      action: 'update',
      member
    });
  });

  // Return unsubscribe function
  return {
    unsubscribe: () => {
      channel.presence.unsubscribe();
    }
  };
}
