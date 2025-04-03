
import React, { useEffect, useRef } from 'react';
import { initializeAbly, cleanupAbly, reconnectAbly } from '../utils/ably';
import { getAblyAuthUrl } from '../services/ablyAuth';
import { ConnectionStatus, getReconnectionManager } from '../utils/reconnectionManager';
import { showSuccessToast, showWarningToast, showErrorToast } from '@/lib/toast-utils';
import { logger } from '@/lib/logger';

interface ConnectionManagerProps {
  workspaceId: string;
  enabled: boolean;
  onStatusChange: (status: ConnectionStatus) => void;
}

const ConnectionManager = ({ workspaceId, enabled, onStatusChange }: ConnectionManagerProps) => {
  const reconnectionAttempts = useRef(0);

  useEffect(() => {
    let ablyCleanup: (() => void) | null = null;
    
    if (!enabled || !workspaceId) return;

    const authUrl = getAblyAuthUrl(workspaceId);
    const reconnectionManager = getReconnectionManager({
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      maxAttempts: 20,
      backoffFactor: 1.5
    });

    const initRealtime = async () => {
      try {
        await initializeAbly(authUrl);
        onStatusChange(ConnectionStatus.CONNECTED);
        logger.info('Real-time communication initialized', 'ConnectionManager');
        ablyCleanup = cleanupAbly;
      } catch (err) {
        logger.error('Failed to initialize real-time communication', 'ConnectionManager', err);
        onStatusChange(ConnectionStatus.FAILED);
        startReconnectionProcess(authUrl);
      }
    };

    const startReconnectionProcess = (url: string) => {
      reconnectionManager.start(async () => {
        reconnectionAttempts.current += 1;
        
        logger.info(`Reconnection attempt ${reconnectionAttempts.current}`, 'ConnectionManager');
        
        if (reconnectionAttempts.current === 1) {
          showWarningToast('Attempting to restore connection...', {
            title: 'Reconnecting'
          });
        }
        
        const success = await reconnectAbly(url);
        
        if (success) {
          onStatusChange(ConnectionStatus.CONNECTED);
          reconnectionAttempts.current = 0;
          
          logger.info('Real-time connection restored', 'ConnectionManager');
          
          showSuccessToast('Real-time connection restored', {
            title: 'Connected'
          });
          
          return true;
        }
        
        return false;
      }).catch(error => {
        logger.error('Reconnection failed after multiple attempts', 'ConnectionManager', error);
        
        showErrorToast('Unable to establish real-time connection. Some features may be limited.', {
          title: 'Connection Failed',
          duration: 0
        });
        
        onStatusChange(ConnectionStatus.FAILED);
      });
    };

    initRealtime();

    return () => {
      if (ablyCleanup) ablyCleanup();
    };
  }, [enabled, workspaceId, onStatusChange]);

  return null;
};

export default ConnectionManager;
