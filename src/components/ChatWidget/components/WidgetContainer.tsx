
import React from 'react';
import { ChatWidgetViews, ChatWidgetConfig, defaultConfig } from '../config';
import { Conversation } from '../types';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import { ConnectionStatus } from '../utils/reconnectionManager';

interface WidgetContainerProps {
  isOpen: boolean;
  viewState: ChatWidgetViews;
  activeConversation: Conversation | null;
  config: ChatWidgetConfig;
  widgetStyle?: React.CSSProperties;
  containerStyles?: React.CSSProperties;
  handleChangeView: (view: ChatWidgetViews) => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (conversation: Conversation) => void;
  handleBackToMessages: () => void;
  handleStartChat: () => void;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
  playMessageSound?: () => void;
  connectionStatus?: ConnectionStatus;
}

const WidgetContainer = ({
  isOpen,
  viewState,
  activeConversation,
  config = defaultConfig,
  widgetStyle,
  containerStyles,
  handleChangeView,
  handleSelectConversation,
  handleUpdateConversation,
  handleBackToMessages,
  handleStartChat,
  userFormData,
  setUserFormData,
  playMessageSound,
  connectionStatus = ConnectionStatus.CONNECTED
}: WidgetContainerProps) => {
  if (!isOpen) {
    return null;
  }

  const width = config?.appearance?.dimensions?.width || 380;
  const height = config?.appearance?.dimensions?.height || 580;
  const shape = config?.appearance?.shape || 'rounded';
  
  const getShapeClass = () => {
    switch (shape) {
      case 'square':
        return '';
      case 'soft':
        return 'rounded-lg';
      case 'pill':
        return 'rounded-xl';
      case 'rounded':
      default:
        return 'rounded-md';
    }
  };

  return (
    <div 
      className={`fixed shadow-xl bg-white text-gray-800 overflow-hidden border border-gray-200 flex flex-col ${getShapeClass()}`}
      style={{ 
        width, 
        height,
        ...containerStyles,
        ...widgetStyle
      }}
    >
      {viewState === 'home' && (
        <HomeView 
          onStartChat={handleStartChat}
          config={config}
        />
      )}

      {viewState === 'messages' && (
        <MessagesView 
          onSelect={handleSelectConversation}
          onViewChange={handleChangeView}
          onStartChat={handleStartChat}
          config={config}
          connectionStatus={connectionStatus}
        />
      )}

      {viewState === 'chat' && activeConversation && (
        <ChatView 
          conversation={activeConversation}
          onBack={handleBackToMessages}
          onUpdateConversation={handleUpdateConversation}
          config={config}
          playMessageSound={playMessageSound}
          userFormData={userFormData}
          setUserFormData={setUserFormData}
          connectionStatus={connectionStatus}
        />
      )}
    </div>
  );
};

export default WidgetContainer;
