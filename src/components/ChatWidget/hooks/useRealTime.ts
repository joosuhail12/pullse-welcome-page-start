
import { useEffect, useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel, subscribeToChannel, getConnectionState } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { useTypingIndicator } from './useTypingIndicator';
import { simulateAgentTyping } from '../utils/simulateAgentTyping';
import { useConnectionState } from './useConnectionState';
import { toast } from 'sonner';
import { 
  addMessageToQueue, 
  getMessageQueue, 
  removeMessageFromQueue, 
  getPendingMessageCount 
} from '../utils/offlineQueue';

export function useRealTime(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  conversation: { id: string },
  hasUserSentMessage: boolean,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
) {
  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionChannelName = `session:${getChatSessionId()}`;
  const sessionId = getChatSessionId();
  
  // Background sync interval in ms (default: 5s)
  const SYNC_INTERVAL = 5000;
  
  // Track pending messages that couldn't be sent due to connection issues
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingMessageCount());
  
  // Use the connection state hook
  const { isConnected, connectionState } = useConnectionState();
  
  // Use the realtime subscriptions hook
  const { remoteIsTyping, readReceipts } = useRealtimeSubscriptions(
    chatChannelName,
    sessionChannelName,
    sessionId,
    setMessages,
    config,
    playMessageSound
  );
  
  // Use the typing indicator hook
  const { handleTypingTimeout, clearTypingTimeout } = useTypingIndicator(
    chatChannelName, 
    sessionId, 
    !!config?.realtime?.enabled
  );

  // Function to publish a message with connection-aware error handling
  const safePublishToChannel = useCallback(async (channel: string, event: string, data: any) => {
    if (!config?.realtime?.enabled) return true;
    
    try {
      if (isConnected) {
        await publishToChannel(channel, event, data);
        return true;
      } else {
        // Queue message if we're offline
        if (event === 'message') {
          addMessageToQueue(data, channel, event);
          toast.info('Message saved offline and will send when connection is restored', {
            id: 'offline-message',
            duration: 3000,
          });
          setPendingCount(getPendingMessageCount());
        }
        return false;
      }
    } catch (err) {
      console.error('Error publishing message:', err);
      
      // Queue message if publish fails
      if (event === 'message') {
        addMessageToQueue(data, channel, event);
        toast.info('Message will be sent when connection is restored', {
          id: 'offline-message',
          duration: 3000,
        });
        setPendingCount(getPendingMessageCount());
      }
      return false;
    }
  }, [config?.realtime?.enabled, isConnected]);

  // Background sync function to process offline message queue
  const syncOfflineMessages = useCallback(async () => {
    if (!isConnected || !config?.realtime?.enabled) return;
    
    const queue = getMessageQueue();
    if (queue.length === 0) return;
    
    setIsBackgroundSyncing(true);
    let successCount = 0;
    
    // Process each queued message
    for (const queuedItem of queue) {
      try {
        await publishToChannel(
          queuedItem.channelName, 
          queuedItem.eventType, 
          queuedItem.message
        );
        
        // Remove successfully sent message
        removeMessageFromQueue(queuedItem.message.id);
        successCount++;
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    }
    
    // Update pending count
    const remainingCount = getPendingMessageCount();
    setPendingCount(remainingCount);
    
    // Show toast if any messages were sent
    if (successCount > 0) {
      toast.success(`Sent ${successCount} queued message${successCount > 1 ? 's' : ''}`, {
        id: 'sync-success',
        duration: 3000,
      });
      
      if (remainingCount > 0) {
        toast.info(`${remainingCount} message${remainingCount > 1 ? 's' : ''} still pending`, {
          id: 'sync-pending',
          duration: 3000,
        });
      }
    }
    
    setIsBackgroundSyncing(false);
  }, [isConnected, config?.realtime?.enabled]);

  // Attempt to sync offline messages when connection is restored
  useEffect(() => {
    if (isConnected && pendingCount > 0 && config?.realtime?.enabled) {
      syncOfflineMessages();
    }
  }, [isConnected, pendingCount, config?.realtime?.enabled, syncOfflineMessages]);

  // Set up periodic background sync
  useEffect(() => {
    if (!config?.realtime?.enabled) return;
    
    const intervalId = setInterval(() => {
      if (isConnected && pendingCount > 0 && !isBackgroundSyncing) {
        syncOfflineMessages();
      }
    }, SYNC_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [config?.realtime?.enabled, isConnected, pendingCount, isBackgroundSyncing, syncOfflineMessages]);

  // For non-realtime mode, simulate agent typing
  useEffect(() => {
    if (!config?.realtime?.enabled) {
      // Only simulate if the user has sent at least one message
      if (!hasUserSentMessage) return;
      
      const typingInterval = setInterval(() => {
        const typingTimer = simulateAgentTyping(setIsTyping, setMessages, config, playMessageSound);
        return () => clearTimeout(typingTimer);
      }, 15000);
      
      return () => {
        clearInterval(typingInterval);
        clearTypingTimeout();
      };
    }
    
    // No cleanup needed when realtime is enabled
    return () => {};
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages, clearTypingTimeout]);

  // Function to add a message to the pending queue
  const addPendingMessage = useCallback((message: Message) => {
    addMessageToQueue(message, chatChannelName);
    setPendingCount(getPendingMessageCount());
    
    toast.info('Message will be sent when connection is restored', {
      duration: 3000,
    });
  }, [chatChannelName]);

  return {
    remoteIsTyping,
    readReceipts,
    chatChannelName,
    sessionId,
    handleTypingTimeout,
    connectionState,
    isConnected,
    pendingCount,
    addPendingMessage,
    safePublishToChannel,
    isBackgroundSyncing
  };
}
