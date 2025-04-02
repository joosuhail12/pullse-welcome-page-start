
import React from 'react';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import TabBar from './components/TabBar';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';

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
  
  // Apply custom branding if available
  const widgetStyle = {
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    } as React.CSSProperties)
  };

  if (loading) {
    return <div className="fixed bottom-4 right-4 w-80 sm:w-96 rounded-lg shadow-lg bg-white p-4">Loading...</div>;
  }

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
          />
        ) : (
          <div className="flex flex-col h-96">
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
    </div>
  );
};

export default ChatWidget;
