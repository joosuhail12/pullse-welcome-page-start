
import React, { useEffect } from 'react';
import HomeView from './views/HomeView';
import MessagesView from './views/MessagesView';
import ChatView from './views/ChatView';
import TabBar from './components/TabBar';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';
import { initializeAbly, cleanupAbly } from './utils/ably';
import { getAblyAuthUrl } from './services/ablyAuth';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useChatWidgetContext } from './ChatWidgetProvider';

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
  
  // Use the context for configuration and open state
  const { config, isOpen, setIsOpen } = useChatWidgetContext();
  const { loading } = useWidgetConfig(workspaceId ?? config.workspaceId);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  
  // Initialize Ably when config is loaded
  useEffect(() => {
    const effectiveWorkspaceId = workspaceId ?? config.workspaceId;
    
    if (!loading && config.realtime?.enabled && effectiveWorkspaceId) {
      // Use token auth URL instead of API key
      const authUrl = getAblyAuthUrl(effectiveWorkspaceId);
      
      initializeAbly(authUrl)
        .catch(err => console.error('Failed to initialize Ably:', err));
      
      // Clean up Ably when component unmounts
      return () => {
        cleanupAbly();
      };
    }
  }, [loading, config.realtime?.enabled, workspaceId, config.workspaceId]);
  
  // Apply custom branding if available
  const widgetStyle = {
    ...(config.branding?.primaryColor && {
      '--vivid-purple': config.branding.primaryColor,
    } as React.CSSProperties)
  };

  useEffect(() => {
    // Clear unread messages when chat is opened
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  if (loading) {
    return <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[600px] rounded-lg shadow-lg bg-white p-4 font-sans">Loading...</div>;
  }

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      dispatchChatEvent('chat:open', undefined, config);
      clearUnreadMessages();
    } else {
      dispatchChatEvent('chat:close', undefined, config);
    }
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

  // Render launcher button that can both open and close the widget
  const renderLauncher = () => {
    // Apply custom branding if available
    const buttonStyle = config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
    
    return (
      <div className="fixed bottom-4 right-4 flex flex-col items-end">
        <Button
          className="rounded-full w-14 h-14 flex items-center justify-center chat-widget-button relative"
          style={buttonStyle}
          onClick={toggleChat}
        >
          <MessageSquare size={24} className="text-white" />
          {!isOpen && unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 w-80 sm:w-96 h-[600px] z-50 chat-widget-container"
          style={widgetStyle}
        >
          <div className="relative w-full h-full flex flex-col">
            {viewState === 'chat' ? (
              <ChatView 
                conversation={activeConversation!} 
                onBack={handleBackToMessages} 
                onUpdateConversation={handleUpdateConversation}
                config={config}
                playMessageSound={playMessageSound}
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
                  {viewState === 'messages' && <MessagesView onSelectConversation={handleSelectConversation} />}
                </div>
                
                <TabBar viewState={viewState} onChangeView={handleChangeView} />
                
                {/* Render footer */}
                {renderFooter()}
              </div>
            )}
          </div>
        </div>
      )}
      {renderLauncher()}
    </>
  );
};

export default ChatWidget;
