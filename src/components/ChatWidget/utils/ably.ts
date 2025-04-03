
import Ably from 'ably/promises';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from './events';
import { validateEventPayload } from './eventValidation';
import { EventPriority } from './eventValidation';
import { isSessionValid, generateClientId } from './security';
import { Message } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Ably singleton instance
let realtimeInstance: Ably.Realtime | null = null;
let connectionFallback: ReturnType<typeof setTimeout> | null = null;

// Cache for channels to prevent duplicates
const channelCache: Record<string, Ably.RealtimeChannel> = {};

// Interface for typing metadata
interface TypingData {
  userId: string;
  isTyping: boolean;
  userName?: string;
}

/**
 * Create a validated event - local function to avoid circular dependencies
 */
function createValidatedEvent(type: string, data?: any): any {
  return {
    type,
    timestamp: new Date(),
    data: data || {}
  };
}

/**
 * Initialize Ably client with proper configuration
 */
export async function getAbly(): Promise<Ably.Realtime> {
  if (realtimeInstance) {
    return realtimeInstance;
  }
  
  try {
    // Initialize with client-side auth
    realtimeInstance = new Ably.Realtime.Promise({
      authUrl: '/api/ably-auth',
      authMethod: 'POST',
      authHeaders: {
        'Content-Type': 'application/json'
      },
      disconnectedRetryTimeout: 10000,
      suspendedRetryTimeout: 30000,
      channelRetryTimeout: 15000,
      transports: ['websocket', 'xhr'],
      clientId: generateClientId(),
      fallbackHosts: [
        'a.ably-realtime.com',
        'b.ably-realtime.com',
        'c.ably-realtime.com',
        'd.ably-realtime.com',
        'e.ably-realtime.com'
      ]
    });
    
    // Listen for connection state changes
    listenForConnectionChanges(realtimeInstance);
    
    return realtimeInstance;
  } catch (err) {
    console.error('Failed to initialize Ably:', err);
    throw err;
  }
}

/**
 * Check if we're in fallback mode
 */
export function isInFallbackMode(): boolean {
  return false; // Implement actual detection logic as needed
}

/**
 * Listen for connection state changes and dispatch events
 */
function listenForConnectionChanges(realtime: Ably.Realtime): void {
  realtime.connection.on((stateChange: Ably.ConnectionStateChange) => {
    switch (stateChange.current) {
      case 'connecting':
        // Create a fallback to handle connection timeout
        if (connectionFallback) {
          clearTimeout(connectionFallback);
          connectionFallback = null;
        }
        
        // If not connected within 10 seconds, consider it a failure
        connectionFallback = setTimeout(() => {
          dispatchChatEvent('chat:connectionChange', {
            status: 'timeout',
            previous: stateChange.previous,
            timestamp: new Date()
          });
        }, 10000);
        
        dispatchChatEvent('chat:connectionChange', {
          status: 'connecting',
          previous: stateChange.previous,
          timestamp: new Date()
        }, EventPriority.LOW);
        break;
      
      case 'connected':
        // Clear the fallback timeout
        if (connectionFallback) {
          clearTimeout(connectionFallback);
          connectionFallback = null;
        }
        
        dispatchChatEvent('chat:connectionChange', {
          status: 'connected',
          previous: stateChange.previous,
          timestamp: new Date()
        }, EventPriority.NORMAL);
        break;
      
      case 'disconnected':
        dispatchChatEvent('chat:connectionChange', {
          status: 'disconnected',
          previous: stateChange.previous,
          timestamp: new Date(),
          reason: stateChange.reason?.message || 'Network disconnected'
        }, EventPriority.HIGH);
        break;
      
      case 'suspended':
        dispatchChatEvent('chat:connectionChange', {
          status: 'suspended',
          previous: stateChange.previous,
          timestamp: new Date(),
          reconnectIn: 30000
        }, EventPriority.HIGH);
        break;
      
      case 'failed':
        dispatchChatEvent('chat:connectionChange', {
          status: 'failed',
          previous: stateChange.previous,
          timestamp: new Date(),
          reason: stateChange.reason?.message || 'Connection failed'
        }, EventPriority.HIGH);
        break;
      
      case 'closing':
      case 'closed':
        dispatchChatEvent('chat:connectionChange', {
          status: 'closed',
          previous: stateChange.previous,
          timestamp: new Date()
        }, EventPriority.NORMAL);
        break;
    }
  });
}

/**
 * Subscribe to a channel and handle messages
 */
export async function subscribeToChannel(
  channelName: string,
  eventName: string,
  callback: (data: any) => void
): Promise<any> {
  // Validate session before allowing subscription
  if (!isSessionValid()) {
    throw new Error('Invalid session');
  }
  
  try {
    const ably = await getAbly();
    
    // Check if channel already exists in cache
    if (channelCache[channelName]) {
      // Subscribe to the specific event
      channelCache[channelName].subscribe(eventName, callback);
      return channelCache[channelName];
    }
    
    // Create and subscribe to the channel
    const channel = ably.channels.get(channelName);
    
    // Subscribe to the specific event
    channel.subscribe(eventName, callback);
    
    // Store in cache
    channelCache[channelName] = channel;
    
    return {
      unsubscribe: () => {
        channel.unsubscribe(eventName, callback);
      }
    };
  } catch (err) {
    console.error(`Failed to subscribe to channel ${channelName}:`, err);
    throw err;
  }
}

/**
 * Publish a message to a channel
 */
export async function publishToChannel(
  channelName: string,
  eventName: string,
  data: any
): Promise<void> {
  // Validate session before allowing publishing
  if (!isSessionValid()) {
    throw new Error('Invalid session');
  }
  
  try {
    const ably = await getAbly();
    const channel = ably.channels.get(channelName);
    
    // Publish the message
    await channel.publish(eventName, data);
  } catch (err) {
    console.error(`Failed to publish to channel ${channelName}:`, err);
    dispatchChatEvent('chat:error', {
      error: 'publish_failed',
      message: `Failed to publish to channel ${channelName}`,
      details: err
    });
    throw err;
  }
}

/**
 * Send a typing indicator
 */
export async function sendTypingIndicator(
  channelName: string,
  userId: string,
  action: 'start' | 'stop'
): Promise<void> {
  try {
    const typingData: TypingData = {
      userId,
      isTyping: action === 'start',
      userName: 'User' // Could be personalized in the future
    };
    
    await publishToChannel(channelName, 'typing', typingData);
    
    dispatchChatEvent('typing', {
      userId,
      isTyping: action === 'start',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to send typing indicator:', err);
  }
}

/**
 * Subscribe to typing indicators
 */
export async function subscribeToTyping(
  channelName: string,
  callback: (isTyping: boolean, userId: string) => void
): Promise<() => void> {
  try {
    const ably = await getAbly();
    const channel = ably.channels.get(channelName);
    
    // Create a handler for typing events
    const handleTypingEvent = (message: Ably.Types.Message) => {
      const data = message.data as TypingData;
      callback(data.isTyping, data.userId);
      
      // Create a local event for typing events
      const eventData = {
        ...data,
        timestamp: new Date()
      };
      
      // Custom dispatch for local events
      const event = createValidatedEvent('typing', {
        userId: data.userId,
        isTyping: data.isTyping,
        timestamp: new Date()
      });
      
      if (event) {
        dispatchChatEvent(event.type, event.data);
      }
    };
    
    // Subscribe to typing events
    channel.subscribe('typing', handleTypingEvent);
    
    // Return cleanup function
    return () => {
      channel.unsubscribe('typing', handleTypingEvent);
    };
  } catch (err) {
    console.error('Failed to subscribe to typing indicators:', err);
    return () => {}; // Return empty cleanup function
  }
}

/**
 * Get presence information for a channel
 */
export async function getPresence(
  channelName: string
): Promise<Ably.Types.PresenceMessage[]> {
  try {
    const ably = await getAbly();
    const channel = ably.channels.get(channelName);
    
    // Get presence data
    const presence = await channel.presence.get();
    return presence;
  } catch (err) {
    console.error('Failed to get presence information:', err);
    return [];
  }
}

/**
 * Subscribe to presence updates
 */
export function subscribeToPresence(
  channelName: string,
  callback: (presenceData: Ably.Types.PresenceMessage[]) => void
): Promise<() => void> {
  return new Promise(async (resolve, reject) => {
    try {
      const ably = await getAbly();
      const channel = ably.channels.get(channelName);
      
      // Subscribe to presence enter events
      channel.presence.subscribe('enter', async () => {
        const presenceData = await channel.presence.get();
        callback(presenceData);
      });
      
      // Subscribe to presence leave events
      channel.presence.subscribe('leave', async () => {
        const presenceData = await channel.presence.get();
        callback(presenceData);
      });
      
      // Get initial presence data
      const initialPresence = await channel.presence.get();
      callback(initialPresence);
      
      // Return cleanup function
      resolve(() => {
        channel.presence.unsubscribe();
      });
    } catch (err) {
      console.error('Failed to subscribe to presence updates:', err);
      reject(err);
    }
  });
}

/**
 * Enter presence for the current user
 */
export async function enterPresence(
  channelName: string,
  clientData?: any
): Promise<void> {
  try {
    const ably = await getAbly();
    const channel = ably.channels.get(channelName);
    
    // Enter presence
    await channel.presence.enter(clientData || {});
  } catch (err) {
    console.error('Failed to enter presence:', err);
  }
}

/**
 * Leave presence
 */
export async function leavePresence(channelName: string): Promise<void> {
  try {
    const ably = await getAbly();
    const channel = ably.channels.get(channelName);
    
    // Leave presence
    await channel.presence.leave();
  } catch (err) {
    console.error('Failed to leave presence:', err);
  }
}

/**
 * Clean up Ably resources
 */
export function cleanupAbly(): void {
  if (realtimeInstance) {
    // Close all channels
    Object.values(channelCache).forEach(channel => {
      channel.unsubscribe();
    });
    
    // Clear channel cache
    Object.keys(channelCache).forEach(key => {
      delete channelCache[key];
    });
    
    // Close connection
    realtimeInstance.close();
    realtimeInstance = null;
  }
  
  // Clear connection fallback
  if (connectionFallback) {
    clearTimeout(connectionFallback);
    connectionFallback = null;
  }
}
