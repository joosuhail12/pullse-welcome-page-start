
import React, { useEffect, useCallback, useState } from 'react';
import { initializeAblyClient, reconnectAbly } from '../utils/ably';
import { ChatWidgetConfig } from '../config';

export interface ConnectionManagerProps {
  config?: ChatWidgetConfig;
  workspaceId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'failed') => void;
  enabled?: boolean;
}

export function ConnectionManager({ 
  config, 
  workspaceId,
  onConnect, 
  onDisconnect,
  onReconnect,
  onError,
  onStatusChange,
  enabled = true
}: ConnectionManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  
  const connectToRealtime = useCallback(() => {
    if (!enabled || !config?.realtime?.enabled) return;
    
    try {
      // Generate auth URL from workspaceId
      const authUrl = `/api/chat-widget/auth?workspaceId=${workspaceId}`;
      
      // Initialize Ably client
      const client = initializeAblyClient(authUrl);
      
      // Set up connection state handlers
      client.connection.on((stateChange) => {
        if (stateChange.current === 'connected') {
          setIsConnected(true);
          onConnect?.();
          onStatusChange?.('connected');
        } else if (stateChange.current === 'disconnected') {
          setIsConnected(false);
          onDisconnect?.();
          onStatusChange?.('disconnected');
        } else if (stateChange.current === 'connecting') {
          onStatusChange?.('connecting');
        } else if (stateChange.current === 'failed') {
          setIsConnected(false);
          onError?.(stateChange.reason);
          onStatusChange?.('failed');
        }
      });
      
    } catch (error) {
      onError?.(error);
      onStatusChange?.('failed');
    }
  }, [config, workspaceId, onConnect, onDisconnect, onError, onStatusChange, enabled]);
  
  useEffect(() => {
    // Connect to realtime if enabled
    if (enabled) {
      connectToRealtime();
    }
    
    // Clean up on unmount
    return () => {
      // Connection cleanup would be handled here
    };
  }, [enabled, connectToRealtime]);
  
  // Handle reconnection attempts
  const handleReconnect = useCallback(() => {
    reconnectAbly().then(() => {
      onReconnect?.();
      onStatusChange?.('connected');
    }).catch((error) => {
      onError?.(error);
      onStatusChange?.('failed');
    });
  }, [onReconnect, onError, onStatusChange]);
  
  return null; // This is a non-visual component
}

export default ConnectionManager;
