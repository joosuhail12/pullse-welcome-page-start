
import { useState, useEffect, useCallback } from 'react';
import { getConnectionState, subscribeToConnectionState } from '../utils/ably';
import { toast } from 'sonner';

export function useConnectionState() {
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected' | 'suspended' | 'closed' | 'failed' | 'initialized' | 'closing'>(
    getConnectionState() || 'disconnected'
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Use callbacks to avoid recreating functions on each render
  const handleConnectionStateChange = useCallback((state: typeof connectionState) => {
    setConnectionState(state);
    
    // Show toast notifications for important state changes
    switch (state) {
      case 'connected':
        toast.success('Connection established', {
          id: 'connection-status',
          duration: 3000,
        });
        break;
      case 'disconnected':
        toast.warning('Connection lost, reconnecting...', {
          id: 'connection-status',
          duration: 5000,
        });
        break;
      case 'suspended':
        toast.error('Connection suspended, check your network', {
          id: 'connection-status',
          duration: 0, // Don't auto-dismiss this one
        });
        break;
      case 'failed':
        toast.error('Connection failed, please refresh the page', {
          id: 'connection-status',
          duration: 0, // Don't auto-dismiss this one
        });
        break;
      case 'closing':
        toast.info('Connection closing...', {
          id: 'connection-status',
          duration: 3000,
        });
        break;
    }
  }, []);
  
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.success('Network connection restored', {
      id: 'network-status',
      duration: 3000,
    });
  }, []);
  
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast.error('Network connection lost', {
      id: 'network-status',
      duration: 0, // Don't auto-dismiss
    });
  }, []);
  
  // Listen for Ably connection state changes
  useEffect(() => {
    const unsubscribe = subscribeToConnectionState(handleConnectionStateChange);
    return unsubscribe;
  }, [handleConnectionStateChange]);
  
  // Also monitor browser's online/offline status
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
  
  return {
    connectionState,
    isOnline,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isDisconnected: ['disconnected', 'suspended', 'closed', 'failed', 'initialized', 'closing'].includes(connectionState)
  };
}
