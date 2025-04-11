
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWidgetConfig, defaultConfig } from './config';
import { useChatState } from './hooks/useChatState';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import { fetchChatWidgetConfig } from './services/api';
import { getWorkspaceIdAndApiKey } from './utils/storage';
import { dispatchChatEvent } from './utils/events';
import useSound from 'use-sound';
import notificationSound from '@/assets/sounds/notification.mp3';
import { useAblyConnection } from './hooks/useAblyConnection';

const ChatWidget = () => {
  const [widgetConfig, setWidgetConfig] = useState<ChatWidgetConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [playMessageSound] = useSound(notificationSound, { volume: 0.5 });

  const { apiKey, workspaceId } = getWorkspaceIdAndApiKey();

  // Initialize Ably connection
  useAblyConnection(widgetConfig);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const config = await fetchChatWidgetConfig(workspaceId, apiKey);
        setWidgetConfig(config);
        dispatchChatEvent('widget:loaded', {}, config);
      } catch (err: any) {
        setError(err.message || 'Failed to load configuration.');
        dispatchChatEvent('widget:error', { error: err.message }, defaultConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [workspaceId, apiKey]);

  const {
    viewState,
    activeConversation,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleSelectTicket,
    handleUpdateConversation,
    handleLogout,
    userFormData,
    setUserFormData,
    isLoadingConversation
  } = useChatState();

  const enhancedHandleSelectConversation = useCallback((conversation: any) => {
    handleChangeView('chat');
  }, [handleChangeView]);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {viewState === 'home' && (
        <div className="flex-grow flex items-center justify-center">
          <button onClick={handleStartChat}>Start New Chat</button>
        </div>
      )}
      
      {viewState === 'messages' && (
        <MessagesView
          onStartChat={handleStartChat}
          onSelectConversation={handleSelectConversation}
          onSelectTicket={handleSelectTicket}
        />
      )}
      
      {viewState === 'chat' && activeConversation && (
        <ChatView
          conversation={activeConversation}
          onBack={handleBackToMessages}
          onUpdateConversation={handleUpdateConversation}
          config={widgetConfig}
          playMessageSound={playMessageSound}
          userFormData={userFormData}
          setUserFormData={setUserFormData}
        />
      )}
    </div>
  );
};

export default ChatWidget;
