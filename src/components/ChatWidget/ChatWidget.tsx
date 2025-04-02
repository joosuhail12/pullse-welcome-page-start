
import React, { useState, useEffect } from 'react';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useConnectionManager } from './hooks/useConnectionManager';
import { dispatchChatEvent } from './utils/events';
import { Toaster } from '@/components/ui/toaster';
import ChatLauncher from './components/ChatLauncher';
import ChatContainer from './components/ChatContainer';

interface ChatWidgetProps {
  workspaceId?: string;
}

export const ChatWidget = ({ workspaceId }: ChatWidgetProps) => {
  // Core hooks for chat functionality
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
  
  // Configuration and messaging hooks
  const { config, loading } = useWidgetConfig(workspaceId);
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  
  // Connection management
  const {
    isConnected,
    connectionState,
    pendingMessages,
    handleReconnect
  } = useConnectionManager(workspaceId, config);

  // Handle widget open/close
  useEffect(() => {
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      dispatchChatEvent('chat:open', undefined, config);
      clearUnreadMessages();
    } else {
      dispatchChatEvent('chat:close', undefined, config);
    }
  };

  if (loading) {
    return <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[600px] rounded-lg shadow-lg bg-white p-4 font-sans">Loading...</div>;
  }

  return (
    <>
      {isOpen && (
        <ChatContainer
          viewState={viewState}
          activeConversation={activeConversation}
          handleStartChat={handleStartChat}
          handleBackToMessages={handleBackToMessages}
          handleChangeView={handleChangeView}
          handleSelectConversation={handleSelectConversation}
          handleUpdateConversation={handleUpdateConversation}
          userFormData={userFormData}
          setUserFormData={setUserFormData}
          config={config}
          clearUnreadMessages={clearUnreadMessages}
          isConnected={isConnected}
          connectionState={connectionState}
          handleReconnect={handleReconnect}
          playMessageSound={playMessageSound}
        />
      )}
      
      <ChatLauncher
        isOpen={isOpen}
        toggleChat={toggleChat}
        unreadCount={unreadCount}
        isConnected={isConnected}
        connectionState={connectionState}
        pendingMessages={pendingMessages}
        primaryColor={config.branding?.primaryColor}
        handleReconnect={handleReconnect}
      />
      
      {/* Add Sonner toaster for connection notifications */}
      <Toaster />
    </>
  );
};

export default ChatWidget;
