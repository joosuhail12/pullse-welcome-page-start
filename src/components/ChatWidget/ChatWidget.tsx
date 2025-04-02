
import React, { useState, useEffect } from 'react';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import TabBar from './components/TabBar';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';
import { initializeAbly, cleanupAbly } from './utils/ably';

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
  
  // Initialize Ably when config is loaded
  useEffect(() => {
    if (!loading && config.realtime?.enabled && config.realtime?.ablyApiKey) {
      initializeAbly(config.realtime.ablyApiKey)
        .catch(err => console.error('Failed to initialize Ably:', err));
      
      // Clean up Ably when component unmounts
      return () => {
        cleanupAbly();
      };
    }
  }, [loading, config.realtime?.enabled, config.realtime?.ablyApiKey]);
  
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

  // Render footer only if branding bar is enabled
  const renderFooter = () => {
    if (!config.branding?.showBrandingBar) return null;
    
    return (
      <div className="mt-auto border-t border-gray-100 p-2 flex items-center justify-center gap-1 text-xs text-gray-400">
        <span>Powered by</span>
        <img 
          src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
          alt="Pullse Logo" 
          className="h-4 w-auto"
        />
        <span>Pullse</span>
      </div>
    );
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
            
            {/* Render footer */}
            {renderFooter()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
