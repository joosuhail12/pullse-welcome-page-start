
import React, { useEffect, useRef } from 'react';
import { initializeAbly, cleanupAbly, reconnectAbly } from '../utils/ably';
import { getAblyAuthUrl } from '../services/ablyAuth';
import { ConnectionStatus, getReconnectionManager } from '../utils/reconnectionManager';
import { toasts } from '@/lib/toast-utils';

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
        ablyCleanup = cleanupAbly;
      } catch (err) {
        console.error('Failed to initialize real-time communication:', err);
        onStatusChange(ConnectionStatus.FAILED);
        startReconnectionProcess(authUrl);
      }
    };

    const startReconnectionProcess = (url: string) => {
      reconnectionManager.start(async () => {
        reconnectionAttempts.current += 1;
        
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
          
          toasts.success({
            title: 'Connected',
            description: 'Real-time connection restored'
          });
          
          return true;
        }
        
        return false;
      }).catch(error => {
        console.error('Reconnection failed after multiple attempts:', error);
        
        toasts.error({
          title: 'Connection Failed',
          description: 'Unable to establish real-time connection. Some features may be limited.',
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
