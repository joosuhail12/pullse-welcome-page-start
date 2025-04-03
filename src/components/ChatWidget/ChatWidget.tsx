
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
import { isTestMode } from './utils/testMode';
import { toast } from '@/components/ui/use-toast';

export interface ChatWidgetProps {
  workspaceId: string;
}

const ChatWidget = ({ workspaceId }: ChatWidgetProps) => {
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

  // Check if we're in test mode
  const testMode = useMemo(() => isTestMode(), []);

  // Display toast if in test mode
  useEffect(() => {
    if (testMode) {
      // Show toast notification for test mode
      toast({
        title: "Test Mode Active",
        description: "Chat widget is running in test mode. No real messages will be sent.",
        variant: "warning",
        duration: 5000,
      });
    }
  }, [testMode]);

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
    return <EnhancedLoadingIndicator positionStyles={getWidgetContainerPositionStyles} config={config} />;
  }

  return (
    <ChatWidgetErrorBoundary workspaceId={workspaceId}>
      <ConnectionManager
        workspaceId={workspaceId}
        enabled={config.realtime?.enabled && !testMode} // Don't enable connection in test mode
        onStatusChange={setConnectionStatus}
      />
      
      {testMode && (
        <div 
          className="fixed top-2 left-0 right-0 mx-auto w-fit z-[9999] bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md"
        >
          TEST MODE
        </div>
      )}
      
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
        testMode={testMode}
      />

      <LauncherButton 
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={toggleChat}
        config={config}
        positionStyles={getLauncherPositionStyles}
        testMode={testMode}
      />
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
