import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';
import { initializeAbly, cleanupAbly, reconnectAbly } from './utils/ably';
import { getAblyAuthUrl } from './services/ablyAuth';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWidgetPosition } from './hooks/useWidgetPosition';
import LauncherButton from './components/LauncherButton';
import WidgetContainer from './components/WidgetContainer';
import EnhancedLoadingIndicator from './components/EnhancedLoadingIndicator';
import ErrorFallback from './components/ErrorFallback';
import ErrorBoundary from '@/components/ui/error-boundary';
import { errorHandler } from '@/lib/error-handler';
import { getReconnectionManager, ConnectionStatus } from './utils/reconnectionManager';
import { toasts } from '@/lib/toast-utils';

export interface ChatWidgetProps {
  workspaceId: string;
}

// Wrap the main component with error boundary
const ChatWidgetWithErrorBoundary = React.memo(({ workspaceId }: ChatWidgetProps) => {
  const [error, setError] = useState<Error | null>(null);
  
  const handleError = (err: Error) => {
    errorHandler.handle(err);
    setError(err);
    dispatchChatEvent('error', { error: err.message }, undefined);
  };
  
  return (
    <ErrorBoundary 
      onError={handleError}
      fallback={
        <ChatWidgetErrorFallback 
          error={error} 
          workspaceId={workspaceId} 
        />
      }
    >
      <ChatWidgetContent workspaceId={workspaceId} />
    </ErrorBoundary>
  );
});

// Error fallback component with positioning
const ChatWidgetErrorFallback = ({ 
  error, 
  workspaceId 
}: { 
  error: Error | null;
  workspaceId: string;
}) => {
  // Get widget config even if there was an error to apply branding
  const { config } = useWidgetConfig(workspaceId);
  const isMobile = useIsMobile();
  const { getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  
  return (
    <ErrorFallback 
      error={error} 
      positionStyles={getWidgetContainerPositionStyles} 
      config={config}
      resetErrorBoundary={() => window.location.reload()} 
    />
  );
};

// Main content component
const ChatWidgetContent = React.memo(({ workspaceId }: ChatWidgetProps) => {
  const {
    viewState,
    activeConversation,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation,
    userFormData,
    setUserFormData
  } = useChatState();
  
  const { config, loading, error } = useWidgetConfig(workspaceId);
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  const isMobile = useIsMobile();
  const { getLauncherPositionStyles, getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const reconnectionAttempts = useRef(0);
  
  // Handle errors from useWidgetConfig
  useEffect(() => {
    if (error) {
      errorHandler.handle(error);
      dispatchChatEvent('error', { error: error.message }, config);
    }
  }, [error, config]);
  
  // Initialize real-time communication
  useEffect(() => {
    let ablyCleanup: (() => void) | null = null;
    let reconnectionInterval: ReturnType<typeof setInterval> | null = null;
    
    if (!loading && config.realtime?.enabled && workspaceId) {
      const authUrl = getAblyAuthUrl(workspaceId);
      const reconnectionManager = getReconnectionManager({
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        maxAttempts: 20,
        backoffFactor: 1.5
      });
      
      // Initialize Ably and handle failures
      const initRealtime = async () => {
        try {
          await initializeAbly(authUrl);
          setConnectionStatus(ConnectionStatus.CONNECTED);
          ablyCleanup = cleanupAbly;
        } catch (err) {
          console.error('Failed to initialize real-time communication:', err);
          errorHandler.handle(new Error('Failed to initialize real-time communication'));
          setConnectionStatus(ConnectionStatus.FAILED);
          
          // Start reconnection process
          startReconnectionProcess(authUrl);
        }
      };
      
      // Start initial connection
      initRealtime();
      
      // Function to handle reconnection
      const startReconnectionProcess = (url: string) => {
        // Don't start multiple reconnection processes
        if (reconnectionInterval) {
          return;
        }
        
        // Start reconnection manager
        reconnectionManager.start(async () => {
          reconnectionAttempts.current += 1;
          
          // Show reconnection toast on first attempt
          if (reconnectionAttempts.current === 1) {
            toasts.warning({
              title: 'Reconnecting',
              description: 'Attempting to restore connection...'
            });
          }
          
          // Attempt to reconnect
          const success = await reconnectAbly(url);
          
          if (success) {
            // Connection restored
            setConnectionStatus(ConnectionStatus.CONNECTED);
            reconnectionAttempts.current = 0;
            
            // Show success notification
            toasts.success({
              title: 'Connected',
              description: 'Real-time connection restored'
            });
            
            return true;
          }
          
          return false;
        }).then(() => {
          // Reconnection successful
          console.log('Reconnection successful');
        }).catch(error => {
          console.error('Reconnection failed after multiple attempts:', error);
          
          // Show failure notification
          toasts.error({
            title: 'Connection Failed',
            description: 'Unable to establish real-time connection. Some features may be limited.',
            duration: 0 // Don't auto-hide this important message
          });
          
          // Switch to fallback mechanisms
          setConnectionStatus(ConnectionStatus.FAILED);
        });
      };
      
      // Listen for connection status changes
      const unsubscribe = reconnectionManager.onStatusChange((status) => {
        setConnectionStatus(status);
      });
      
      // Clean up function
      return () => {
        if (ablyCleanup) ablyCleanup();
        if (reconnectionInterval) {
          clearInterval(reconnectionInterval);
        }
        unsubscribe();
      };
    }
    
    // No cleanup needed when realtime is disabled
    return () => {};
  }, [loading, config.realtime?.enabled, workspaceId]);
  
  // Apply custom branding colors to the widget
  const widgetStyle = useMemo(() => {
    return {
      ...(config.branding?.primaryColor && {
        '--vivid-purple': config.branding.primaryColor,
      } as React.CSSProperties)
    };
  }, [config.branding?.primaryColor]);

  // Cleanup unread messages when opening the chat
  useEffect(() => {
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  // Toggle chat open/close state
  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Add a small delay on mobile devices to allow for animations
    const eventDelay = isMobile ? 50 : 0;
    
    setTimeout(() => {
      if (newIsOpen) {
        dispatchChatEvent('chat:open', undefined, config);
        clearUnreadMessages();
      } else {
        dispatchChatEvent('chat:close', undefined, config);
      }
    }, eventDelay);
  }, [isOpen, config, clearUnreadMessages, isMobile]);

  // Handle starting a chat with form data
  const wrappedHandleStartChat = useCallback((formData?: Record<string, string>) => {
    if (formData) {
      setUserFormData(formData);
    }
    
    handleStartChat(formData);
    
    if (formData && Object.keys(formData).length > 0) {
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
  }, [handleStartChat, setUserFormData, config]);

  if (loading) {
    return <EnhancedLoadingIndicator positionStyles={getWidgetContainerPositionStyles} config={config} />;
  }

  return (
    <>
      <WidgetContainer 
        isOpen={isOpen}
        viewState={viewState}
        activeConversation={activeConversation}
        config={config}
        widgetStyle={widgetStyle}
        containerStyles={getWidgetContainerPositionStyles}
        userFormData={userFormData}
        handleSelectConversation={handleSelectConversation}
        handleUpdateConversation={handleUpdateConversation}
        handleChangeView={handleChangeView}
        handleBackToMessages={handleBackToMessages}
        handleStartChat={wrappedHandleStartChat}
        setUserFormData={setUserFormData}
        playMessageSound={playMessageSound}
        connectionStatus={connectionStatus}
      />

      <LauncherButton 
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={toggleChat}
        config={config}
        positionStyles={getLauncherPositionStyles}
      />
    </>
  );
});

ChatWidgetContent.displayName = 'ChatWidgetContent';
ChatWidgetWithErrorBoundary.displayName = 'ChatWidgetWithErrorBoundary';

// Export the error-wrapped component as default
export default ChatWidgetWithErrorBoundary;
