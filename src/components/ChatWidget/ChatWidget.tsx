import React, { useEffect, useMemo, useState } from 'react';
import { WidgetContainer } from './WidgetContainer';
import { ChatWidgetConfig, defaultConfig } from './config';
import { useWidgetConfig } from './hooks/useWidgetConfig';
import { useViewState } from './hooks/useViewState';
import { useConversations } from './hooks/useConversations';
import { useSound } from 'use-sound';
import newMessageSound from '../../assets/sounds/new_message.mp3';
import { ChatWidgetErrorBoundary } from './ChatWidgetErrorBoundary';

interface ChatWidgetProps {
  workspaceId: string;
  config?: ChatWidgetConfig;
}

const ChatWidget = ({ 
  workspaceId,
  config: configOverride
}) => {
  const { config, loading, error, contactData } = useWidgetConfig();
  const [userFormData, setUserFormData] = useState<Record<string, string> | null>(null);
  const { viewState, handleBackToPrevView, startNewChat, openConversation } = useViewState();
  const { conversations, activeConversation, createNewConversation } = useConversations();
  const [isOpen, setIsOpen] = useState(false);
  const [playMessageSound] = useSound(newMessageSound, { volume: 0.5 });

  // Merge the fetched config with the config override
  const mergedConfig = useMemo(() => {
    return {
      ...defaultConfig,
      ...config,
      ...configOverride,
      workspaceId
    };
  }, [config, configOverride, workspaceId]);

  // Initialize the widget
  useEffect(() => {
    if (workspaceId) {
      // Create a new conversation if none exists
      if (!conversations || conversations.length === 0) {
        createNewConversation();
      }
    }
  }, [workspaceId, conversations, createNewConversation]);

  const closeWidget = () => {
    setIsOpen(false);
  };

  return (
    <ChatWidgetErrorBoundary>
      <WidgetContainer
        isOpen={isOpen}
        viewState={viewState}
        activeConversation={activeConversation}
        config={config}
        onClose={closeWidget}
        onBack={handleBackToPrevView}
        onStartNewChat={startNewChat}
        onOpenConversation={openConversation}
        userFormData={userFormData}
        setUserFormData={setUserFormData}
        conversations={conversations}
        playMessageSound={playMessageSound}
        // Remove connectionStatus if it's not in the interface
        // connectionStatus={connectionStatus}
      />
    </ChatWidgetErrorBoundary>
  );
};

export default ChatWidget;
