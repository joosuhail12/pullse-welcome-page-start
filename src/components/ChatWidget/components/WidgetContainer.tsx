
import React from 'react';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import TabBar from './TabBar';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';

interface WidgetContainerProps {
  viewState: 'home' | 'messages' | 'chat';
  activeConversation: Conversation | null;
  onBackToMessages: () => void;
  onChangeView: (view: 'home' | 'messages' | 'chat') => void;
  onSelectConversation: (conversation: Conversation) => void;
  onUpdateConversation: (conversation: Conversation) => void;
  onStartChat: (formData?: Record<string, string>) => void;
  config: ChatWidgetConfig;
  positionClass: string;
  messageStyleClass: string;
  widgetStyle: React.CSSProperties;
  playMessageSound?: () => void;
  renderFooter: () => React.ReactNode;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  viewState,
  activeConversation,
  onBackToMessages,
  onChangeView,
  onSelectConversation,
  onUpdateConversation,
  onStartChat,
  config,
  positionClass,
  messageStyleClass,
  widgetStyle,
  playMessageSound,
  renderFooter,
}) => {
  
  return (
    <div 
      className={`fixed ${positionClass} w-80 sm:w-96 h-[600px] z-50 chat-widget-container ${messageStyleClass}`}
      style={widgetStyle}
    >
      <div className="relative w-full h-full flex flex-col">
        {viewState === 'chat' && activeConversation ? (
          <ChatView 
            conversation={activeConversation} 
            onBack={onBackToMessages} 
            onUpdateConversation={onUpdateConversation}
            config={config}
            playMessageSound={playMessageSound}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
              {viewState === 'home' && (
                <HomeView 
                  onStartChat={onStartChat} 
                  config={config}
                />
              )}
              {viewState === 'messages' && <MessagesView onSelectConversation={onSelectConversation} />}
            </div>
            
            <TabBar viewState={viewState} onChangeView={onChangeView} />
            
            {renderFooter()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetContainer;
