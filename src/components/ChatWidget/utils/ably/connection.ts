
import Ably from 'ably';
import { logger } from '@/lib/logger';
import {
  setAblyClient, getAblyClient,
  isInFallbackMode, setFallbackMode,
  getActiveSubscriptions,
  getPendingMessages, clearPendingMessages
} from './config';
import { subscribeToChannel, publishToChannel } from './messaging';
import { getAccessToken, getWorkspaceIdAndApiKey } from '../storage';

// Keep track of initialization attempts
let initializationInProgress = false;
let lastAuthUrl: string | null = null;

/**
 * Initialize Ably client
 * @param authUrl URL for Ably auth
 * @returns Promise resolving to true when connected
 */
export const initializeAbly = async (authUrl: string): Promise<boolean> => {
  const { workspaceId, apiKey } = getWorkspaceIdAndApiKey();

  // Don't initialize multiple times with the same auth URL
  if (initializationInProgress) {
    console.warn('Ably initialization already in progress, skipping duplicate call');
    return false;
  }

  // If we have the same auth URL and an existing client, just check connection
  const existingClient = getAblyClient();
  if (existingClient && lastAuthUrl === authUrl) {
    if (existingClient.connection.state === 'connected') {
      console.log('Ably already initialized and connected with the same auth URL');
      return true;
    } else if (['connecting', 'disconnected'].includes(existingClient.connection.state)) {
      console.log('Ably already initializing with the same auth URL, waiting for connection');
      return new Promise((resolve) => {
        const handleConnect = () => {
          existingClient.connection.off(handleConnect);
          resolve(true);
        };
        existingClient.connection.once('connected', handleConnect);

        // Set a timeout in case it never connects
        setTimeout(() => {
          existingClient.connection.off(handleConnect);
          resolve(false);
        }, 10000);
      });
    }
  }

  // Track that we're initializing
  initializationInProgress = true;
  lastAuthUrl = authUrl;

  try {
    const clientOptions: Ably.Types.ClientOptions = {
      authUrl,
      authHeaders: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'x-workspace-id': workspaceId,
        'x-api-Key': apiKey
      },
      autoConnect: true,
      echoMessages: false,
      closeOnUnload: true,
      logLevel: 2,
      // Explicitly specify all available transports to fix "no requested transports available" error
      transports: ['websocket', 'xhr_streaming', 'xhr_polling'],
    };

    logger.info('Initializing Ably with token', 'ably');

    const realtime = new Ably.Realtime(clientOptions);

    // Return a promise that resolves when connected or rejects on error
    return new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(() => {
        logger.error('Ably connection timed out after 10s', 'ably');
        setFallbackMode(true);
        initializationInProgress = false;
        reject(new Error('Connection timed out'));
      }, 10000);

      // Handle connection state changes
      const handleConnectionStateChange = (stateChange: Ably.Types.ConnectionStateChange) => {
        const { current, reason } = stateChange;

        if (current === 'connected') {
          logger.info('Ably connected successfully', 'ably');
          clearTimeout(connectTimeout);

          // Store client once connected
          setAblyClient(realtime);
          initializationInProgress = false;

          // Resubscribe to active channels from before
          resubscribeToActiveChannels();

          // Send any pending messages
          sendPendingMessages();

          // Remove listener after successful connection
          realtime.connection.off(handleConnectionStateChange);

          resolve(true);
        } else if (current === 'failed') {
          logger.error('Ably connection failed', 'ably', reason);
          clearTimeout(connectTimeout);
          setFallbackMode(true);
          initializationInProgress = false;

          // Remove listener after failure
          realtime.connection.off(handleConnectionStateChange);

          reject(reason);
        }
      };

      realtime.connection.on(handleConnectionStateChange);

      // If connection is already in desired state, trigger manually
      if (realtime.connection.state === 'connected') {
        handleConnectionStateChange({ current: 'connected' } as Ably.Types.ConnectionStateChange);
      }
    });
  } catch (err) {
    logger.error('Failed to initialize Ably', 'ably', err);
    initializationInProgress = false;
    setFallbackMode(true);
    throw err;
  }
};

/**
 * Reconnect Ably client
 * @param authUrl URL for Ably auth
 * @returns Promise resolving to true when reconnected
 */
export const reconnectAbly = async (authUrl: string): Promise<boolean> => {
  const client = getAblyClient();

  // If we don't have a client, just initialize a new one
  if (!client) {
    return initializeAbly(authUrl);
  }

  // If the client is already connected, just return true
  if (client.connection.state === 'connected') {
    return true;
  }

  try {
    // If the client is disconnected or suspended, try to reconnect
    if (['disconnected', 'suspended', 'failed', 'closed'].includes(client.connection.state)) {
      logger.info('Reconnecting to Ably', 'ably');

      // For clean reconnection, create a new client
      return initializeAbly(authUrl);
    }

    // If the client is connecting, wait for it to connect
    if (client.connection.state === 'connecting') {
      logger.info('Ably is already connecting, waiting', 'ably');

      return new Promise((resolve) => {
        const handleState = (stateChange: Ably.Types.ConnectionStateChange) => {
          if (stateChange.current === 'connected') {
            client.connection.off(handleState);
            resolve(true);
          } else if (['disconnected', 'suspended', 'failed', 'closed'].includes(stateChange.current)) {
            client.connection.off(handleState);
            // Fall back to initializing a new client
            initializeAbly(authUrl)
              .then(() => resolve(true))
              .catch(() => resolve(false));
          }
        };

        client.connection.on(handleState);

        // Set a timeout in case it never connects
        setTimeout(() => {
          client.connection.off(handleState);
          // Fall back to initializing a new client
          initializeAbly(authUrl)
            .then(() => resolve(true))
            .catch(() => resolve(false));
        }, 5000);
      });
    }

    logger.info('Ably is already connected', 'ably');
    return true;
  } catch (err) {
    logger.error('Failed to reconnect to Ably', 'ably', err);
    return false;
  }
};

/**
 * Resubscribe to all active channels
 * Called after reconnection
 */
const resubscribeToActiveChannels = () => {
  const activeSubscriptions = getActiveSubscriptions();

  if (activeSubscriptions.length === 0) {
    return;
  }

  logger.info(`Resubscribing to ${activeSubscriptions.length} active channels`, 'ably');

  // For each channel and its events, resubscribe
  for (const sub of activeSubscriptions) {
    // We don't have the original callback, so we use a placeholder
    // The real components should resubscribe with their own callbacks
    subscribeToChannel(sub.channelName, sub.eventName, () => {
      logger.debug(`Received message from resubscribed channel ${sub.channelName} (${sub.eventName})`, 'ably');
    });
  }
};

/**
 * Send all pending messages
 * Called after reconnection
 */
const sendPendingMessages = () => {
  const pendingMessages = getPendingMessages();

  if (pendingMessages.length === 0) {
    return;
  }

  logger.info(`Sending ${pendingMessages.length} pending messages`, 'ably');

  // For each pending message, attempt to send it
  pendingMessages.forEach((message) => {
    publishToChannel(message.channelName, message.eventName, message.data);
  });

  // Clear pending messages that have been sent
  clearPendingMessages();
};

/**
 * Clean up Ably client
 */
export const cleanupAbly = (): void => {
  const client = getAblyClient();

  if (!client) {
    return;
  }

  // Just detach channels without closing the connection to allow reuse
  try {
    const channels = client.channels;

    // Use a different approach to iterate through channels
    Object.keys(channels).forEach((channelName) => {
      const channel = channels.get(channelName);
      if (channel && channel.state === 'attached') {
        channel.detach();
      }
    });

    // We won't close the connection here to avoid reconnection issues
    // The connection will be reused for new channels
    logger.info('Ably connection preserved for reuse', 'ably');
  } catch (error) {
    logger.error('Error cleaning up Ably channels', 'ably', error);
  }
};
