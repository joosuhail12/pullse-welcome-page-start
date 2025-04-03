
import React from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import TabBar from './TabBar';
import PoweredByBar from './PoweredByBar';

interface WidgetContainerProps {
  isOpen: boolean;
  viewState: 'home' | 'messages' | 'chat';
  activeConversation: Conversation | null;
  config: ChatWidgetConfig;
  widgetStyle: React.CSSProperties;
  containerStyles: React.CSSProperties;
  userFormData?: Record<string, string>;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (updatedConversation: Conversation) => void;
  handleChangeView: (view: 'home' | 'messages' | 'chat') => void;
  handleBackToMessages: () => void;
  handleStartChat: (formData?: Record<string, string>) => void;
  setUserFormData: (data: Record<string, string>) => void;
  playMessageSound: () => void;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  isOpen,
  viewState,
  activeConversation,
  config,
  widgetStyle,
  containerStyles,
  userFormData,
  handleSelectConversation,
  handleUpdateConversation,
  handleChangeView,
  handleBackToMessages,
  handleStartChat,
  setUserFormData,
  playMessageSound
}) => {
  if (!isOpen) return null;
  
  const widgetWidth = "w-[90vw] sm:w-80 md:w-96";
  const widgetHeight = "h-[500px] sm:h-[600px]";
  const widgetMaxHeight = "max-h-[80vh] sm:max-h-[85vh]";

  return (
    <div 
      className={`fixed ${widgetWidth} ${widgetHeight} ${widgetMaxHeight} z-50 chat-widget-container animate-fade-in shadow-chat-widget flex flex-col rounded-xl sm:rounded-2xl overflow-hidden`}
      style={{...widgetStyle, ...containerStyles}}
    >
      <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden">
        {viewState === 'chat' ? (
          <div className="flex flex-col h-full">
            <ChatView 
              conversation={activeConversation!} 
              onBack={handleBackToMessages} 
              onUpdateConversation={handleUpdateConversation}
              config={config}
              playMessageSound={playMessageSound}
              userFormData={userFormData}
              setUserFormData={setUserFormData}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
              {viewState === 'home' && (
                <HomeView 
                  onStartChat={handleStartChat} 
                  config={config}
                />
              )}
              {viewState === 'messages' && <MessagesView onSelectConversation={handleSelectConversation} />}
            </div>
            
            <TabBar viewState={viewState} onChangeView={handleChangeView} />
          </div>
        )}
      </div>
      
      {config.branding?.showBrandingBar !== false && <PoweredByBar />}
    </div>
  );
};

export default WidgetContainer;
