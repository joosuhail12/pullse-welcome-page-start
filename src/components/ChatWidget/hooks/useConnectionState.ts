
import { useState, useEffect, useCallback } from 'react';
import { subscribeToConnectionState, getConnectionState } from '../utils/ably';

type ConnectionState = 'connected' | 'disconnected' | 'suspended' | 'connecting' | 'failed' | 'unknown';

export function useConnectionState() {
  // Initialize state with the proper value
  const [connectionState, setConnectionState] = useState<ConnectionState>('unknown');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Handle connection state change
  const handleConnectionChange = useCallback((newState: string) => {
    console.log('Connection state changed:', newState);
    
    // Cast to ConnectionState to ensure type safety
    const typedState = newState as ConnectionState;
    setConnectionState(typedState);
    setIsConnected(typedState === 'connected');
  }, []);
  
  // Subscribe to connection state changes only once on mount
  useEffect(() => {
    // Get current state and update if it exists
    const currentState = getConnectionState();
    if (currentState) {
      const typedCurrentState = currentState as ConnectionState;
      setConnectionState(typedCurrentState);
      setIsConnected(typedCurrentState === 'connected');
    }
    
    // Subscribe to state changes
    const unsubscribe = subscribeToConnectionState(handleConnectionChange);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [handleConnectionChange]);
  
  return {
    connectionState,
    isConnected
  };
}
