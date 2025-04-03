
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWidgetPosition } from './hooks/useWidgetPosition';
import LauncherButton from './components/LauncherButton';
import WidgetContainer from './components/WidgetContainer';
import EnhancedLoadingIndicator from './components/EnhancedLoadingIndicator';
import ChatWidgetErrorBoundary from './components/ChatWidgetErrorBoundary';
import ConnectionManager from './components/ConnectionManager';
import { ConnectionStatus } from './utils/reconnectionManager';
import { EventManager, getEventManager } from './events/eventManager';
import { ChatWidgetConfig } from './config';

export interface ChatWidgetProps {
  workspaceId: string;
  previewConfig?: ChatWidgetConfig;
  isTestMode?: boolean;
}

const ChatWidget = ({ workspaceId, previewConfig, isTestMode = false }: ChatWidgetProps) => {
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
  
  const configFromHook = useWidgetConfig(workspaceId);
  
  // Use previewConfig if in test mode, otherwise use config from hook
  const { config, loading, error } = useMemo(() => {
    if (isTestMode && previewConfig) {
      return { 
        config: previewConfig, 
        loading: false, 
        error: null 
      };
    }
    return configFromHook;
  }, [isTestMode, previewConfig, configFromHook]);
  
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  const isMobile = useIsMobile();
  const { getLauncherPositionStyles, getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  const widgetStyle = useMemo(() => ({
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    } as React.CSSProperties)
  }), [config.branding?.primaryColor]);

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    setTimeout(() => {
      if (newIsOpen) {
        clearUnreadMessages();
      }
    }, isMobile ? 50 : 0);
  }, [isOpen, clearUnreadMessages, isMobile]);

  // Handle test mode as a special case
  useEffect(() => {
    if (isTestMode) {
      // Log test mode activation
      console.log('Chat Widget running in test mode with custom configuration');
    }
  }, [isTestMode]);

  if (loading) {
    return <EnhancedLoadingIndicator positionStyles={getWidgetContainerPositionStyles} config={config} />;
  }

  return (
    <ChatWidgetErrorBoundary workspaceId={workspaceId}>
      <ConnectionManager
        workspaceId={workspaceId}
        enabled={config.realtime?.enabled && !isTestMode}
        onStatusChange={setConnectionStatus}
      />
      
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
        handleStartChat={handleStartChat}
        setUserFormData={setUserFormData}
        playMessageSound={playMessageSound}
      />

      <LauncherButton 
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={toggleChat}
        config={config}
        positionStyles={getLauncherPositionStyles}
      />
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
