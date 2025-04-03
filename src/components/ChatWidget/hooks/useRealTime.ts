import { useEffect, useState, useCallback } from 'react';
import { Message } from '../types';
import { publishToChannel, subscribeToChannel, getConnectionState } from '../utils/ably';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { useTypingIndicator } from './useTypingIndicator';
import { simulateAgentTyping } from '../utils/simulateAgentTyping';
import { useConnectionState } from './useConnectionState';
import { toast } from '@/components/ui/use-toast';
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
  const chatChannelName = `conversation:${conversation.id}`;
  const sessionChannelName = `session:${getChatSessionId()}`;
  const sessionId = getChatSessionId();
  
  const SYNC_INTERVAL = 5000;
  
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingMessageCount());
  
  const { isConnected, connectionState } = useConnectionState();
  
  const { remoteIsTyping, readReceipts } = useRealtimeSubscriptions(
    chatChannelName,
    sessionChannelName,
    sessionId,
    setMessages,
    config,
    playMessageSound
  );
  
  const { handleTypingTimeout, clearTypingTimeout } = useTypingIndicator(
    chatChannelName, 
    sessionId, 
    !!config?.realtime?.enabled
  );

  const safePublishToChannel = useCallback(async (channel: string, event: string, data: any) => {
    if (!config?.realtime?.enabled) return true;
    
    try {
      if (isConnected) {
        await publishToChannel(channel, event, data);
        return true;
      } else {
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

  const syncOfflineMessages = useCallback(async () => {
    if (!isConnected || !config?.realtime?.enabled) return;
    
    const queue = getMessageQueue();
    if (queue.length === 0) return;
    
    setIsBackgroundSyncing(true);
    let successCount = 0;
    
    for (const queuedItem of queue) {
      try {
        await publishToChannel(
          queuedItem.channelName, 
          queuedItem.eventType, 
          queuedItem.message
        );
        
        removeMessageFromQueue(queuedItem.message.id);
        successCount++;
      } catch (error) {
        console.error('Failed to send queued message:', error);
      }
    }
    
    const remainingCount = getPendingMessageCount();
    setPendingCount(remainingCount);
    
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

  useEffect(() => {
    if (isConnected && pendingCount > 0 && config?.realtime?.enabled) {
      syncOfflineMessages();
    }
  }, [isConnected, pendingCount, config?.realtime?.enabled, syncOfflineMessages]);

  useEffect(() => {
    if (!config?.realtime?.enabled) return;
    
    const intervalId = setInterval(() => {
      if (isConnected && pendingCount > 0 && !isBackgroundSyncing) {
        syncOfflineMessages();
      }
    }, SYNC_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [config?.realtime?.enabled, isConnected, pendingCount, isBackgroundSyncing, syncOfflineMessages]);

  useEffect(() => {
    if (!config?.realtime?.enabled) {
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
    
    return () => {};
  }, [config?.realtime?.enabled, hasUserSentMessage, playMessageSound, setIsTyping, setMessages, clearTypingTimeout]);

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
