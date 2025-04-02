
import { useState, useEffect, useCallback } from 'react';
import { subscribeToConnectionState, getConnectionState } from '../utils/ably';

type ConnectionState = 'connected' | 'disconnected' | 'suspended' | 'connecting' | 'failed' | 'unknown';

export function useConnectionState() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState() || 'unknown');
  const [isConnected, setIsConnected] = useState<boolean>(connectionState === 'connected');
  
  // Handle connection state change
  const handleConnectionChange = useCallback((newState: string) => {
    console.log('Connection state changed:', newState);
    
    setConnectionState(newState as ConnectionState);
    setIsConnected(newState === 'connected');
    
  }, []);
  
  // Subscribe to connection state changes
  useEffect(() => {
    // Get current state
    const currentState = getConnectionState();
    if (currentState) {
      setConnectionState(currentState as ConnectionState);
      setIsConnected(currentState === 'connected');
    }
    
    // Subscribe to state changes
    const unsubscribe = subscribeToConnectionState(handleConnectionChange);
    
    return () => {
      unsubscribe();
    };
  }, [handleConnectionChange]);
  
  return {
    connectionState,
    isConnected
  };
}
