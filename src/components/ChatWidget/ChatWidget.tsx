
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';
import { initializeAbly, cleanupAbly } from './utils/ably';
import { getAblyAuthUrl } from './services/ablyAuth';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWidgetPosition } from './hooks/useWidgetPosition';
import LauncherButton from './components/LauncherButton';
import WidgetContainer from './components/WidgetContainer';
import LoadingIndicator from './components/LoadingIndicator';

export interface ChatWidgetProps {
  workspaceId: string;
}

export const ChatWidget = React.memo(({ workspaceId }: ChatWidgetProps) => {
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
  
  const { config, loading } = useWidgetConfig(workspaceId);
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  const isMobile = useIsMobile();
  const { getLauncherPositionStyles, getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);
  
  useEffect(() => {
    let ablyCleanup: (() => void) | null = null;
    
    if (!loading && config.realtime?.enabled && workspaceId) {
      const authUrl = getAblyAuthUrl(workspaceId);
      
      initializeAbly(authUrl)
        .then(() => {
          ablyCleanup = cleanupAbly;
        })
        .catch(err => console.error('Failed to initialize Ably:', err));
    }
    
    return () => {
      if (ablyCleanup) ablyCleanup();
    };
  }, [loading, config.realtime?.enabled, workspaceId]);
  
  const widgetStyle = useMemo(() => {
    return {
      ...(config.branding?.primaryColor && {
        '--vivid-purple': config.branding.primaryColor,
      } as React.CSSProperties)
    };
  }, [config.branding?.primaryColor]);

  useEffect(() => {
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      dispatchChatEvent('chat:open', undefined, config);
      clearUnreadMessages();
    } else {
      dispatchChatEvent('chat:close', undefined, config);
    }
  }, [isOpen, config, clearUnreadMessages]);

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
    return <LoadingIndicator positionStyles={getWidgetContainerPositionStyles} />;
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

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;
