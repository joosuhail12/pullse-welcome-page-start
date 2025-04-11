
import React, { useEffect, useRef, useState } from 'react';
import { initializeAbly, cleanupAbly, reconnectAbly } from '../utils/ably';
import { getAblyAuthUrl } from '../services/ablyAuth';
import { ConnectionStatus, getReconnectionManager } from '../utils/reconnectionManager';
import { toasts } from '@/lib/toast-utils';
import { logger } from '@/lib/logger';
import { getAccessToken } from '../utils/storage';
import { getAblyClient } from '../utils/ably/config';

interface ConnectionManagerProps {
  workspaceId: string;
  enabled: boolean;
  onStatusChange: (status: ConnectionStatus) => void;
}

const ConnectionManager = ({ workspaceId, enabled, onStatusChange }: ConnectionManagerProps) => {
  const reconnectionAttempts = useRef(0);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const ablyInitialized = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const lastWorkspaceId = useRef<string | null>(null);
  
  // Clean up function that's safe to call multiple times
  const performCleanup = () => {
    if (cleanupRef.current) {
      try {
        cleanupRef.current();
        cleanupRef.current = null;
      } catch (err) {
        console.error('Error during Ably cleanup:', err);
      }
    }
  };

  // Monitor access token changes
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getAccessToken();
      if (currentToken !== accessToken) {
        setAccessToken(currentToken);
      }
    };

    // Check for token changes periodically
    const tokenCheckInterval = setInterval(checkToken, 2000);
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [accessToken]);

  // Update connection status based on Ably client state
  useEffect(() => {
    const checkConnectionStatus = () => {
      const client = getAblyClient();
      if (!client) {
        onStatusChange(ConnectionStatus.DISCONNECTED);
        return;
      }
      
      switch (client.connection.state) {
        case 'connected':
          onStatusChange(ConnectionStatus.CONNECTED);
          break;
        case 'connecting':
          onStatusChange(ConnectionStatus.CONNECTING);
          break;
        case 'disconnected':
        case 'suspended':
          onStatusChange(ConnectionStatus.DISCONNECTED);
          break;
        case 'failed':
          onStatusChange(ConnectionStatus.FAILED);
          break;
        default:
          onStatusChange(ConnectionStatus.DISCONNECTED);
      }
    };
    
    // Check connection status periodically
    const statusInterval = setInterval(checkConnectionStatus, 1000);
    return () => clearInterval(statusInterval);
  }, [onStatusChange]);

  // Initialize Ably when component mounts and clean up when unmounts
  useEffect(() => {
    // Return early if not enabled, missing workspaceId, or no access token
    if (!enabled || !workspaceId || !accessToken) {
      onStatusChange(ConnectionStatus.DISCONNECTED);
      logger.info('Realtime disabled: missing required parameters', 'ConnectionManager');
      return;
    }
    
    // Skip initialization if we're already connected to the same workspace
    if (ablyInitialized.current && lastWorkspaceId.current === workspaceId) {
      logger.info('Already connected to this workspace, skipping initialization', 'ConnectionManager');
      return;
    }

    // Update the tracked workspace ID
    lastWorkspaceId.current = workspaceId;

    const authUrl = getAblyAuthUrl(workspaceId);
    const reconnectionManager = getReconnectionManager({
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      maxAttempts: 20,
      backoffFactor: 1.5
    });

    const initRealtime = async () => {
      // Prevent multiple initializations
      if (ablyInitialized.current) {
        return;
      }
      
      try {
        logger.info('Initializing real-time with token', 'ConnectionManager');
        await initializeAbly(authUrl);
        ablyInitialized.current = true;
        onStatusChange(ConnectionStatus.CONNECTED);
        logger.info('Real-time communication initialized', 'ConnectionManager');
        
        // Store the cleanup function
        cleanupRef.current = () => {
          cleanupAbly();
          ablyInitialized.current = false;
        };
      } catch (err) {
        logger.error('Failed to initialize real-time communication', 'ConnectionManager', err);
        onStatusChange(ConnectionStatus.FAILED);
        ablyInitialized.current = false;
        startReconnectionProcess(authUrl);
      }
    };

    const startReconnectionProcess = (url: string) => {
      reconnectionManager.start(async () => {
        reconnectionAttempts.current += 1;

        logger.info(`Reconnection attempt ${reconnectionAttempts.current}`, 'ConnectionManager');

        if (reconnectionAttempts.current === 1) {
          toasts.warning({
            title: 'Reconnecting',
            description: 'Attempting to restore connection...'
          });
        }

        const success = await reconnectAbly(url);

        if (success) {
          onStatusChange(ConnectionStatus.CONNECTED);
          reconnectionAttempts.current = 0;
          ablyInitialized.current = true;

          logger.info('Real-time connection restored', 'ConnectionManager');

          toasts.success({
            title: 'Connected',
            description: 'Real-time connection restored'
          });

          return true;
        }

        return false;
      }).catch(error => {
        logger.error('Reconnection failed after multiple attempts', 'ConnectionManager', error);

        toasts.error({
          title: 'Connection Failed',
          description: 'Unable to establish real-time connection. Some features may be limited.',
          duration: 0
        });

        onStatusChange(ConnectionStatus.FAILED);
      });
    };

    initRealtime();

    // Clean up when component unmounts
    return () => {
      performCleanup();
    };
  }, [enabled, workspaceId, onStatusChange, accessToken]);

  // Handle changes to the enabled state or workspaceId
  useEffect(() => {
    if (!enabled && ablyInitialized.current) {
      performCleanup();
      onStatusChange(ConnectionStatus.DISCONNECTED);
    }
  }, [enabled, workspaceId, onStatusChange]);

  return null;
};

export default ConnectionManager;
