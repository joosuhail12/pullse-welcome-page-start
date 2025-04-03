
import React, { useEffect, useCallback, useState } from 'react';
import { initializeAblyClient, reconnectAbly } from '../utils/ably';
import { ChatWidgetConfig } from '../config';

interface ConnectionManagerProps {
  config: ChatWidgetConfig;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: any) => void;
}

export function ConnectionManager({ 
  config, 
  onConnect, 
  onDisconnect,
  onReconnect,
  onError
}: ConnectionManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  
  const connectToRealtime = useCallback(() => {
    if (!config.realtime?.enabled) return;
    
    try {
      // Generate auth URL from config
      const authUrl = `/api/chat-widget/auth?workspaceId=${config.workspaceId}`;
      
      // Initialize Ably client
      const client = initializeAblyClient(authUrl);
      
      // Set up connection state handlers
      client.connection.on('connected', () => {
        setIsConnected(true);
        onConnect?.();
      });
      
      client.connection.on('disconnected', () => {
        setIsConnected(false);
        onDisconnect?.();
      });
      
      client.connection.on('failed', (error) => {
        setIsConnected(false);
        onError?.(error);
      });
      
    } catch (error) {
      onError?.(error);
    }
  }, [config, onConnect, onDisconnect, onError]);
  
  useEffect(() => {
    // Connect to realtime if enabled
    if (config.realtime?.enabled) {
      connectToRealtime();
    }
    
    // Clean up on unmount
    return () => {
      // Connection cleanup would be handled here
    };
  }, [config.realtime?.enabled, connectToRealtime]);
  
  // Handle reconnection attempts
  const handleReconnect = useCallback(() => {
    reconnectAbly().then(() => {
      onReconnect?.();
    }).catch(onError);
  }, [onReconnect, onError]);
  
  return null; // This is a non-visual component
}

export default ConnectionManager;
