
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
import ChatKeyboardHandler from './components/ChatKeyboardHandler';
import { setWorkspaceIdAndApiKey } from './utils/storage';
import { dispatchChatEvent } from './utils/events';

export interface ChatWidgetProps {
  workspaceId: string;
  apiKey: string;
}

const ChatWidget = ({ workspaceId, apiKey }: ChatWidgetProps) => {
  // Set workspace id and api key in localStorage
  setWorkspaceIdAndApiKey(workspaceId, apiKey);

  const {
    viewState,
    activeConversation,
    isLoadingTicket,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleSelectTicket,
    handleUpdateConversation,
    userFormData,
    setUserFormData
  } = useChatState();

  const { config, loading, error, contactData } = useWidgetConfig();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  const isMobile = useIsMobile();
  const { getLauncherPositionStyles, getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  // Dispatch loading event once
  useEffect(() => {
    if (config) {
      dispatchChatEvent('widget:loaded', { config });
    }

    if (error) {
      dispatchChatEvent('widget:error', { error });
    }
  }, [config, error]);

  // If contactData is available from the API but userFormData is not set, initialize it
  useEffect(() => {
    if (contactData && !userFormData) {
      // Create form data from contact
      const formData = {
        email: contactData.email,
        name: `${contactData.firstname} ${contactData.lastname}`.trim()
      };
      setUserFormData(formData);
    }
  }, [contactData, userFormData, setUserFormData]);

  const widgetStyle = useMemo(() => ({
    ...(config.colors?.primaryColor && {
      '--vivid-purple': config.colors.primaryColor,
    } as React.CSSProperties)
  }), [config.colors?.primaryColor]);

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    setTimeout(() => {
      if (newIsOpen) {
        clearUnreadMessages();
      }
    }, isMobile ? 50 : 0);
  }, [isOpen, clearUnreadMessages, isMobile]);

  // Global keyboard shortcut to toggle chat widget open/close with Alt+C
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        toggleChat();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleChat]);

  if ((loading || isLoadingTicket) && isOpen) {
    return <EnhancedLoadingIndicator positionStyles={getWidgetContainerPositionStyles} config={config} />;
  }

  // Add contact data to config for component access
  const enhancedConfig = {
    ...config,
    contact: contactData
  };

  return (
    <ChatWidgetErrorBoundary workspaceId={workspaceId}>
      <ConnectionManager
        workspaceId={workspaceId}
        enabled={true}
        onStatusChange={setConnectionStatus}
      />

      <WidgetContainer
        isOpen={isOpen}
        viewState={viewState}
        activeConversation={activeConversation}
        config={enhancedConfig}
        widgetStyle={widgetStyle}
        containerStyles={getWidgetContainerPositionStyles}
        userFormData={userFormData}
        handleSelectConversation={handleSelectConversation}
        handleSelectTicket={handleSelectTicket}
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
        config={enhancedConfig}
        positionStyles={getLauncherPositionStyles}
      />
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
