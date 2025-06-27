
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import LauncherButton from './components/LauncherButton';
import WidgetContainer from './components/WidgetContainer';
import ChatWidgetErrorBoundary from './components/ChatWidgetErrorBoundary';
import { getWorkspaceIdAndApiKey } from './utils/storage';
import { AblyProvider } from './context/ablyContext';
import { ChatProvider } from './context/chatContext';

const ChatWidget = () => {
  const { apiKey, workspaceId } = getWorkspaceIdAndApiKey();
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
  }, [isOpen]);

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

  // Don't render if there's no apiKey or workspaceId
  if (!apiKey || !workspaceId) {
    return null;
  }

  return (
    <ChatWidgetErrorBoundary workspaceId={workspaceId}>
      <ChatProvider>
        <AblyProvider>
          <WidgetContainer />
          <LauncherButton
            unreadCount={0}
          />
        </AblyProvider>
      </ChatProvider>
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
