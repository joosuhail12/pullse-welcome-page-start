
import React, { useState } from 'react';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import TabBar from './components/TabBar';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';

interface ChatWidgetProps {
  workspaceId?: string;
}

export const ChatWidget = ({ workspaceId }: ChatWidgetProps) => {
  const {
    viewState,
    activeConversation,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation
  } = useChatState();
  
  const { config, loading } = useWidgetConfig(workspaceId);
  const [isOpen, setIsOpen] = useState(true);
  
  // Apply custom branding if available
  const widgetStyle = {
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    } as React.CSSProperties)
  };

  if (loading) {
    return <div className="fixed bottom-4 right-4 w-80 sm:w-96 rounded-lg shadow-lg bg-white p-4">Loading...</div>;
  }

  const handleOpenChat = () => {
    setIsOpen(true);
    dispatchChatEvent('chat:open', undefined, config);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    dispatchChatEvent('chat:close', undefined, config);
  };

  const wrappedHandleStartChat = (formData?: Record<string, string>) => {
    handleStartChat(formData);
    
    // Dispatch appropriate event based on whether form data was provided
    if (formData) {
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
    
    dispatchChatEvent('contact:initiatedChat', undefined, config);
  };

  return (
    <div 
      className="fixed bottom-4 right-4 w-80 sm:w-96 rounded-lg shadow-lg overflow-hidden flex flex-col bg-white border border-gray-200 max-h-[600px]"
      style={widgetStyle}
    >
      <div className="w-full max-h-[600px] flex flex-col">
        {viewState === 'chat' ? (
          <ChatView 
            conversation={activeConversation!} 
            onBack={handleBackToMessages} 
            onUpdateConversation={handleUpdateConversation}
            config={config}
          />
        ) : (
          <div className="flex flex-col h-96">
            <div className="flex-grow overflow-y-auto">
              {viewState === 'home' && (
                <HomeView 
                  onStartChat={wrappedHandleStartChat} 
                  config={config}
                />
              )}
              {viewState === 'messages' && <MessagesView onSelectConversation={handleSelectConversation} />}
            </div>
            
            <TabBar viewState={viewState} onChangeView={handleChangeView} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
