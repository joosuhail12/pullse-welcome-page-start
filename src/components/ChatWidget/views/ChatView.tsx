
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';
import { ConnectionStatus } from '../utils/reconnectionManager';
import ChatViewContainer from './ChatView/ChatViewContainer';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
  connectionStatus?: ConnectionStatus;
}

const ChatView = React.memo(({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config = defaultConfig,
  playMessageSound,
  userFormData,
  setUserFormData,
  connectionStatus = ConnectionStatus.CONNECTED
}: ChatViewProps) => {
  return (
    <ChatViewContainer
      conversation={conversation}
      onBack={onBack}
      onUpdateConversation={onUpdateConversation}
      config={config}
      playMessageSound={playMessageSound}
      userFormData={userFormData}
      setUserFormData={setUserFormData}
      connectionStatus={connectionStatus}
    />
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;
