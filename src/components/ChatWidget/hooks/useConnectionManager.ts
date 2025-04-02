
import { useState, useEffect, useCallback } from 'react';
import { ChatWidgetConfig } from '../config';
import { toast } from 'sonner';
import { initializeAbly, cleanupAbly } from '../utils/ably';
import { getAblyAuthUrl } from '../services/ablyAuth';
import { getPendingMessageCount } from '../utils/offlineQueue';

export function useConnectionManager(workspaceId: string | undefined, config: ChatWidgetConfig) {
  const [pendingMessages, setPendingMessages] = useState(getPendingMessageCount());
  const { isConnected, connectionState } = useConnectionState();

  // Check for pending messages periodically
  useEffect(() => {
    const checkPendingInterval = setInterval(() => {
      setPendingMessages(getPendingMessageCount());
    }, 3000);
    
    return () => clearInterval(checkPendingInterval);
  }, []);

  // Initialize realtime connection if enabled
  useEffect(() => {
    if (config.realtime?.enabled && workspaceId) {
      const authUrl = getAblyAuthUrl(workspaceId);
      
      initializeAbly(authUrl)
        .then(() => {
          console.log('Ably initialized successfully');
          toast.success('Chat connection established');
        })
        .catch(err => {
          console.error('Failed to initialize Ably:', err);
          toast.error('Failed to establish chat connection');
        });
      
      return () => {
        cleanupAbly();
      };
    }
  }, [config.realtime?.enabled, workspaceId]);

  // Handle reconnection attempts
  const handleReconnect = useCallback(() => {
    if (connectionState === 'disconnected' || connectionState === 'suspended' || connectionState === 'failed') {
      toast.loading('Attempting to reconnect...', { id: 'reconnecting' });
      
      cleanupAbly();
      
      setTimeout(() => {
        if (workspaceId) {
          const authUrl = getAblyAuthUrl(workspaceId);
          
          initializeAbly(authUrl)
            .then(() => {
              toast.success('Successfully reconnected', { id: 'reconnecting' });
            })
            .catch(err => {
              toast.error('Failed to reconnect', { id: 'reconnecting' });
              console.error('Failed to reconnect:', err);
            });
        }
      }, 1000);
    }
  }, [connectionState, workspaceId]);

  return {
    isConnected,
    connectionState,
    pendingMessages,
    handleReconnect
  };
}

// Import the useConnectionState hook
import { useConnectionState } from './useConnectionState';
