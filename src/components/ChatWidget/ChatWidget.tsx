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
import { MessageSquare, WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useConnectionState } from './hooks/useConnectionState';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { getPendingMessageCount } from './utils/offlineQueue';

interface ChatWidgetProps {
  workspaceId?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = React.memo(({ workspaceId }) => {
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
  const { isConnected, connectionState } = useConnectionState();
  const [pendingMessages, setPendingMessages] = useState(getPendingMessageCount());
  
  useEffect(() => {
    const checkPendingInterval = setInterval(() => {
      setPendingMessages(getPendingMessageCount());
    }, 3000);
    
    return () => clearInterval(checkPendingInterval);
  }, []);
  
  useEffect(() => {
    if (!loading && config?.realtime?.enabled && workspaceId) {
      const authUrl = getAblyAuthUrl(workspaceId);
      
      initializeAbly(authUrl)
        .then(() => {
          console.log('Ably initialized successfully');
          setTimeout(() => {
            toast.success('Chat connection established');
          }, 0);
        })
        .catch(err => {
          console.error('Failed to initialize Ably:', err);
          setTimeout(() => {
            toast.error('Failed to establish chat connection');
          }, 0);
        });
      
      return () => {
        cleanupAbly();
      };
    }
  }, [loading, config?.realtime?.enabled, workspaceId]);
  
  const widgetStyle = useMemo(() => {
    return {
      ...(config?.branding?.primaryColor && {
        '--vivid-purple': config.branding.primaryColor,
      } as React.CSSProperties)
    };
  }, [config?.branding?.primaryColor]);

  useEffect(() => {
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      const newIsOpen = !prev;
      
      if (newIsOpen) {
        dispatchChatEvent('chat:open', undefined, config);
        clearUnreadMessages();
      } else {
        dispatchChatEvent('chat:close', undefined, config);
      }
      
      return newIsOpen;
    });
  }, [config, clearUnreadMessages]);

  const handleReconnect = useCallback(() => {
    if (connectionState === 'disconnected' || connectionState === 'suspended' || connectionState === 'failed') {
      setTimeout(() => {
        toast.loading('Attempting to reconnect...', { id: 'reconnecting' } as any);
      }, 0);
      
      cleanupAbly();
      
      setTimeout(() => {
        if (workspaceId) {
          const authUrl = getAblyAuthUrl(workspaceId);
          
          initializeAbly(authUrl)
            .then(() => {
              setTimeout(() => {
                toast.success('Successfully reconnected', { id: 'reconnecting' } as any);
              }, 0);
            })
            .catch(err => {
              setTimeout(() => {
                toast.error('Failed to reconnect', { id: 'reconnecting' } as any);
              }, 0);
              console.error('Failed to reconnect:', err);
            });
        }
      }, 1000);
    }
  }, [connectionState, workspaceId]);

  const wrappedHandleStartChat = useCallback(() => {
    handleStartChat();
    dispatchChatEvent('contact:initiatedChat', undefined, config);
  }, [handleStartChat, config]);

  const renderFooter = useCallback(() => {
    if (!config?.branding?.showBrandingBar) return null;
    
    return (
      <div className="mt-auto border-t border-gray-100 p-2 flex items-center justify-center gap-1 text-xs text-gray-400">
        <span>Powered by</span>
        <img 
          src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" 
          alt="Pullse Logo" 
          className="h-4 w-auto"
        />
        <span>Pullse</span>
        
        {config?.realtime?.enabled && (
          <div 
            className={`ml-1 w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'
            }`} 
            title={`Connection: ${connectionState}`}
            onClick={!isConnected ? handleReconnect : undefined}
            style={{ cursor: !isConnected ? 'pointer' : 'default' }}
          />
        )}
      </div>
    );
  }, [config?.branding?.showBrandingBar, config?.realtime?.enabled, isConnected, connectionState, handleReconnect]);

  const renderLauncher = useCallback(() => {
    const buttonStyle = config?.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
    
    return (
      <div className="fixed bottom-4 right-4 flex flex-col items-end">
        {pendingMessages > 0 && (
          <div 
            className="mb-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs flex items-center gap-1 cursor-help"
            title="Messages waiting to be sent when connection is restored"
            aria-live="polite"
          >
            <CloudOff size={12} aria-hidden="true" /> {pendingMessages} pending
          </div>
        )}
        
        <Button
          className="rounded-full w-14 h-14 flex items-center justify-center chat-widget-button relative"
          style={buttonStyle}
          onClick={toggleChat}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          aria-expanded={isOpen}
          aria-controls="chat-widget-container"
          aria-haspopup="dialog"
        >
          {config?.realtime?.enabled && !isConnected ? (
            <WifiOff size={24} className="text-white animate-pulse" aria-hidden="true" />
          ) : (
            <MessageSquare size={24} className="text-white" aria-hidden="true" />
          )}
          {!isOpen && unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2" 
              variant="destructive"
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }, [config?.branding?.primaryColor, config?.realtime?.enabled, isConnected, isOpen, pendingMessages, toggleChat, unreadCount]);

  if (loading) {
    return <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[600px] rounded-lg shadow-lg bg-white p-4 font-sans">Loading...</div>;
  }

  return (
    <>
      {isOpen && (
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
                
                {renderFooter()}
              </div>
            )}
            
            {config?.realtime?.enabled && !isConnected && (
              <div 
                className="absolute top-0 left-0 w-full bg-red-500 text-white text-xs py-1 px-2 text-center cursor-pointer"
                onClick={handleReconnect}
                role="alert"
                aria-live="assertive"
              >
                Connection lost. Click to reconnect.
              </div>
            )}
          </div>
        </div>
      )}
      {renderLauncher()}
      
      <Toaster />
    </>
  );
});

ChatWidget.displayName = 'ChatWidget';

export { ChatWidget };
export default ChatWidget;
