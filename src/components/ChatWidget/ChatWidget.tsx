
import React, { useState, useCallback, useMemo } from 'react';
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

export interface ChatWidgetProps {
  workspaceId: string;
}

const ChatWidget = ({ workspaceId }: ChatWidgetProps) => {
  const chatState = useChatState();
  const { state } = chatState;
  
  // Extract values from state for easier access
  const viewState = state.viewState;
  const activeConversation = state.activeConversation;
  const userFormData = state.userFormData;
  
  // Define handler functions from chatState
  const handleStartChat = chatState.startChat;
  const handleBackToMessages = chatState.backToMessages;
  const handleChangeView = chatState.changeView;
  const handleSelectConversation = chatState.selectConversation;
  const handleUpdateConversation = chatState.updateConversation;
  const setUserFormData = chatState.setUserFormData;
  
  const { config, loading, error } = useWidgetConfig(workspaceId);
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

  if (loading) {
    return <EnhancedLoadingIndicator positionStyles={getWidgetContainerPositionStyles()} config={config} />;
  }

  const handleConnectionStatusChange = (status: 'connected' | 'disconnected' | 'connecting' | 'failed') => {
    switch (status) {
      case 'connected':
        setConnectionStatus(ConnectionStatus.CONNECTED);
        break;
      case 'disconnected':
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        break;
      case 'connecting':
        setConnectionStatus(ConnectionStatus.CONNECTING);
        break;
      case 'failed':
        setConnectionStatus(ConnectionStatus.FAILED);
        break;
    }
  };

  return (
    <ChatWidgetErrorBoundary workspaceId={workspaceId}>
      <ConnectionManager
        workspaceId={workspaceId}
        config={config}
        enabled={config.realtime?.enabled}
        onStatusChange={handleConnectionStatusChange}
      />
      
      <WidgetContainer 
        isOpen={isOpen}
        viewState={viewState}
        activeConversation={activeConversation}
        config={config}
        widgetStyle={widgetStyle}
        containerStyles={getWidgetContainerPositionStyles()}
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
        positionStyles={getLauncherPositionStyles()}
      />
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
