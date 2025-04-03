
import React from 'react';
import { Conversation } from '../../types';
import { ChatWidgetConfig } from '../../config';
import ChatViewContainer from './ChatViewContainer';

interface ChatViewProps {
  conversation: Conversation;
  onBack: () => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  config?: ChatWidgetConfig;
  playMessageSound?: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
}

/**
 * Main entry point for the Chat View
 * This component acts as a simple wrapper around the container component
 * which handles all the state management and logic
 */
const ChatView = React.memo(({ 
  conversation, 
  onBack, 
  onUpdateConversation, 
  config,
  playMessageSound,
  userFormData,
  setUserFormData
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
    />
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;
