
import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { ConnectionStatus } from '../utils/reconnectionManager';
import { 
  saveDraftMessage, 
  getDraftMessage, 
  deleteDraftMessage,
  addPendingMessage,
  getPendingMessages,
  removePendingMessage
} from '../utils/offlineStorage';
import { publishToChannel } from '../utils/ably';
import { toasts } from '@/lib/toast-utils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface UseOfflineSupportProps {
  connectionStatus: ConnectionStatus;
  conversationId: string;
  sessionId: string;
  chatChannelName: string;
}

export function useOfflineSupport({
  connectionStatus,
  conversationId,
  sessionId,
  chatChannelName
}: UseOfflineSupportProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasDraft, setHasDraft] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isMobile = useIsMobile();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (connectionStatus !== ConnectionStatus.CONNECTED) {
        toasts.info({
          title: 'Back online',
          description: 'Your connection has been restored.'
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toasts.warning({
        title: 'You\'re offline',
        description: 'Messages will be sent when your connection is restored.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionStatus]);

  // Check for draft messages on component mount
  useEffect(() => {
    if (conversationId) {
      const draft = getDraftMessage(conversationId);
      setHasDraft(!!draft && draft.trim() !== '');
    }
  }, [conversationId]);

  // Check for pending messages
  useEffect(() => {
    const pendingMessages = getPendingMessages();
    const count = Object.keys(pendingMessages).filter(key => 
      key.startsWith(`${conversationId}-`)
    ).length;
    
    setPendingCount(count);
  }, [conversationId]);

  // Auto-sync pending messages when connection is restored
  useEffect(() => {
    const attemptSync = async () => {
      if (connectionStatus === ConnectionStatus.CONNECTED && isOnline && pendingCount > 0) {
        await syncPendingMessages();
      }
    };
    
    attemptSync();
  }, [connectionStatus, isOnline, pendingCount]);

  // Draft message handling
  const saveDraft = useCallback((text: string) => {
    if (connectionStatus !== ConnectionStatus.CONNECTED || !isOnline) {
      saveDraftMessage(conversationId, text);
      setHasDraft(!!text && text.trim() !== '');
    }
  }, [conversationId, connectionStatus, isOnline]);

  const loadDraft = useCallback(() => {
    return getDraftMessage(conversationId);
  }, [conversationId]);

  const clearDraft = useCallback(() => {
    deleteDraftMessage(conversationId);
    setHasDraft(false);
  }, [conversationId]);

  // Queue message for later sending
  const queueMessageForSending = useCallback((message: Message) => {
    addPendingMessage(conversationId, message);
    setPendingCount(prev => prev + 1);
    
    toasts.info({
      title: 'Message queued',
      description: 'Your message will be sent when you\'re back online.'
    });
  }, [conversationId]);

  // Sync pending messages when connection is restored
  const syncPendingMessages = useCallback(async () => {
    const pendingMessages = getPendingMessages();
    const conversationMessages = Object.entries(pendingMessages)
      .filter(([key]) => key.startsWith(`${conversationId}-`));
    
    if (conversationMessages.length === 0) {
      return;
    }
    
    setIsSyncing(true);
    
    // Show toast only on mobile
    if (isMobile && conversationMessages.length > 0) {
      toasts.info({
        title: 'Syncing messages',
        description: `Sending ${conversationMessages.length} pending messages...`
      });
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process in sequence with small delays to avoid rate limiting
    for (const [key, pendingMessage] of conversationMessages) {
      try {
        // Attempt to publish the message
        publishToChannel(chatChannelName, 'message', pendingMessage.message);
        
        // Remove from pending queue on success
        removePendingMessage(key);
        successCount++;
        
        // Small delay between sends
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Failed to sync pending message:', error);
        errorCount++;
      }
    }
    
    // Update the pending count
    setPendingCount(prev => Math.max(0, prev - successCount));
    setIsSyncing(false);
    
    // Show success toast if any messages were synced
    if (successCount > 0) {
      toasts.success({
        title: 'Messages synced',
        description: `${successCount} messages have been sent.`
      });
    }
    
    // Show error toast if any messages failed
    if (errorCount > 0) {
      toasts.error({
        title: 'Sync failed',
        description: `Failed to send ${errorCount} messages. Will try again later.`
      });
    }
    
  }, [conversationId, chatChannelName, isMobile]);

  return {
    isOnline,
    hasDraft,
    pendingCount,
    isSyncing,
    saveDraft,
    loadDraft,
    clearDraft,
    queueMessageForSending,
    syncPendingMessages
  };
}
