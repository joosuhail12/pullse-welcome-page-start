
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import PoweredByBar from './components/PoweredByBar'; // Import PoweredByBar

export const ChatWidget = React.memo(({ workspaceId }: ChatWidgetProps) => {
  const {
    viewState,
    activeConversation,
    handleStartChat,
    handleBackToMessages,
    handleChangeView,
    handleSelectConversation,
    handleUpdateConversation,
    userFormData,
    setUserFormData
  } = useChatState();
  
  const { config, loading } = useWidgetConfig(workspaceId);
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, clearUnreadMessages } = useUnreadMessages();
  const { playMessageSound } = useSound();
  
  // Initialize Ably only when needed and with proper cleanup
  useEffect(() => {
    let ablyCleanup: (() => void) | null = null;
    
    if (!loading && config.realtime?.enabled && workspaceId) {
      const authUrl = getAblyAuthUrl(workspaceId);
      
      initializeAbly(authUrl)
        .then(() => {
          ablyCleanup = cleanupAbly;
        })
        .catch(err => console.error('Failed to initialize Ably:', err));
    }
    
    return () => {
      if (ablyCleanup) ablyCleanup();
    };
  }, [loading, config.realtime?.enabled, workspaceId]);
  
  // Memoize styles to prevent recalculation
  const widgetStyle = useMemo(() => {
    return {
      ...(config.branding?.primaryColor && {
        '--vivid-purple': config.branding.primaryColor,
      } as React.CSSProperties)
    };
  }, [config.branding?.primaryColor]);

  // Clear unread messages when widget is opened
  useEffect(() => {
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      dispatchChatEvent('chat:open', undefined, config);
      clearUnreadMessages();
    } else {
      dispatchChatEvent('chat:close', undefined, config);
    }
  }, [isOpen, config, clearUnreadMessages]);

  const wrappedHandleStartChat = useCallback((formData?: Record<string, string>) => {
    if (formData) {
      setUserFormData(formData);
    }
    
    handleStartChat(formData);
    
    if (formData && Object.keys(formData).length > 0) {
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
  }, [handleStartChat, setUserFormData, config]);

  // Memoize footer component to prevent re-renders
  const renderFooter = useCallback(() => {
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
  }, [config.branding?.showBrandingBar]);

  // Memoize launcher button to prevent re-renders
  const renderLauncher = useCallback(() => {
    const buttonStyle = config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
    
    return (
      <div className="fixed bottom-4 right-4 flex flex-col items-end">
        <Button
          className="rounded-full w-14 h-14 flex items-center justify-center chat-widget-button relative transition-transform hover:scale-105"
          style={buttonStyle}
          onClick={toggleChat}
        >
          <MessageSquare size={24} className="text-white" />
          {!isOpen && unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2 animate-pulse" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }, [config.branding?.primaryColor, toggleChat, isOpen, unreadCount]);

  if (loading) {
    return (
      <div className="fixed bottom-24 right-4 w-80 sm:w-96 h-[600px] rounded-lg shadow-lg bg-gradient-to-br from-soft-purple-50 to-soft-purple-100 p-4 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-vivid-purple">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed bottom-24 right-4 w-80 sm:w-96 h-[600px] z-50 chat-widget-container animate-fade-in shadow-chat-widget flex flex-col" // Added flex-col to ensure footer is at bottom
          style={widgetStyle}
        >
          <div className="relative w-full h-full flex flex-col flex-grow">
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
                  {viewState === 'messages' && <MessagesView onSelectConversation={handleSelectConversation} />}
                </div>
                
                <TabBar viewState={viewState} onChangeView={handleChangeView} />
                
                {/* Removed the old renderFooter method */}
              </div>
            )}
          </div>
          
          {/* Always show PoweredByBar at the bottom of the widget */}
          {config.branding?.showBrandingBar !== false && <PoweredByBar />}
        </div>
      )}
      {renderLauncher()}
    </>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;
