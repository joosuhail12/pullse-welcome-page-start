
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
 * Main ChatView component that serves as the entry point for the chat interface.
 * It delegates all the logic to the ChatViewContainer component.
 */
const ChatView: React.FC<ChatViewProps> = (props) => {
  return <ChatViewContainer {...props} />;
};

export default ChatView;
