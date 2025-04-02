
import React from 'react';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import TabBar from './TabBar';
import ChatFooter from './ChatFooter';
import ConnectionBanner from './ConnectionBanner';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';

interface ChatContainerProps {
  viewState: 'home' | 'messages' | 'chat';
  activeConversation: Conversation | null;
  handleStartChat: (formData?: Record<string, string>) => void;
  handleBackToMessages: () => void;
  handleChangeView: (view: 'home' | 'messages' | 'chat') => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (updatedConversation: Conversation) => void;
  userFormData: Record<string, string> | undefined;
  setUserFormData: (data: Record<string, string>) => void;
  config: ChatWidgetConfig;
  clearUnreadMessages: () => void;
  isConnected: boolean;
  connectionState: string;
  handleReconnect: () => void;
  playMessageSound: () => void;
}

const ChatContainer = ({
  viewState,
  activeConversation,
  handleStartChat,
  handleBackToMessages,
  handleChangeView,
  handleSelectConversation,
  handleUpdateConversation,
  userFormData,
  setUserFormData,
  config,
  clearUnreadMessages,
  isConnected,
  connectionState,
  handleReconnect,
  playMessageSound
}: ChatContainerProps) => {
  // Wrapper function for handling start chat
  const wrappedHandleStartChat = (formData?: Record<string, string>) => {
    if (formData) {
      setUserFormData(formData);
    }
    
    handleStartChat(formData);
    
    if (formData && Object.keys(formData).length > 0) {
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
    
    dispatchChatEvent('contact:initiatedChat', undefined, config);
  };

  const widgetStyle = {
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    } as React.CSSProperties)
  };

  return (
    <div 
      className="fixed bottom-24 right-4 w-80 sm:w-96 h-[600px] z-50 chat-widget-container"
      style={widgetStyle}
      id="chat-widget-container"
      role="dialog"
      aria-modal="true"
      aria-label="Chat Widget"
    >
      <div className="relative w-full h-full flex flex-col">
        {viewState === 'chat' ? (
          <ChatView 
            conversation={activeConversation!} 
            onBack={handleBackToMessages} 
            onUpdateConversation={handleUpdateConversation}
            config={config}
            playMessageSound={playMessageSound}
            userFormData={userFormData}
            setUserFormData={setUserFormData}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
              {viewState === 'home' && (
                <HomeView 
                  onStartChat={wrappedHandleStartChat} 
                  config={config}
                />
              )}
              {viewState === 'messages' && (
                <div id="messages-view" tabIndex={-1}>
                  <MessagesView onSelectConversation={handleSelectConversation} />
                </div>
              )}
            </div>
            
            <TabBar viewState={viewState} onChangeView={handleChangeView} />
            
            <ChatFooter 
              showBrandingBar={config.branding?.showBrandingBar}
              isConnected={isConnected}
              connectionState={connectionState}
              handleReconnect={handleReconnect}
            />
          </div>
        )}
        
        <ConnectionBanner 
          isConnected={isConnected}
          handleReconnect={handleReconnect}
          realtimeEnabled={config.realtime?.enabled}
        />
      </div>
    </div>
  );
};

export default ChatContainer;

// Import event dispatcher
import { dispatchChatEvent } from '../utils/events';
