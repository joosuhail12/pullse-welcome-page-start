
import React, { useEffect, useCallback, useState } from 'react';
import { initializeAblyClient, reconnectAbly } from '../utils/ably';
import { ChatWidgetConfig } from '../config';

export interface ConnectionManagerProps {
  config: ChatWidgetConfig;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: any) => void;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'failed') => void;
  enabled?: boolean;
}

export function ConnectionManager({ 
  config, 
  onConnect, 
  onDisconnect,
  onReconnect,
  onError,
  onStatusChange,
  enabled = true
}: ConnectionManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  
  const connectToRealtime = useCallback(() => {
    if (!enabled || !config.realtime?.enabled) return;
    
    try {
      // Generate auth URL from config
      const authUrl = `/api/chat-widget/auth?workspaceId=${config.workspaceId}`;
      
      // Initialize Ably client
      const client = initializeAblyClient(authUrl);
      
      // Set up connection state handlers
      client.connection.on('connected', () => {
        setIsConnected(true);
        onConnect?.();
        onStatusChange?.('connected');
      });
      
      client.connection.on('disconnected', () => {
        setIsConnected(false);
        onDisconnect?.();
        onStatusChange?.('disconnected');
      });
      
      client.connection.on('connecting', () => {
        onStatusChange?.('connecting');
      });
      
      client.connection.on('failed', (error) => {
        setIsConnected(false);
        onError?.(error);
        onStatusChange?.('failed');
      });
      
    } catch (error) {
      onError?.(error);
      onStatusChange?.('failed');
    }
  }, [config, onConnect, onDisconnect, onError, onStatusChange, enabled]);
  
  useEffect(() => {
    // Connect to realtime if enabled
    if (enabled && config.realtime?.enabled) {
      connectToRealtime();
    }
    
    // Clean up on unmount
    return () => {
      // Connection cleanup would be handled here
    };
  }, [enabled, config.realtime?.enabled, connectToRealtime]);
  
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
