
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
import PoweredByBar from './components/PoweredByBar';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
  
  const widgetStyle = useMemo(() => {
    return {
      ...(config.branding?.primaryColor && {
        '--vivid-purple': config.branding.primaryColor,
      } as React.CSSProperties)
    };
  }, [config.branding?.primaryColor]);

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

  const getPositionStyles = useMemo(() => {
    const position = config.position?.placement || 'bottom-right';
    const offsetX = config.position?.offsetX !== undefined ? config.position.offsetX : 1;
    const offsetY = config.position?.offsetY !== undefined ? config.position.offsetY : 1;
    
    let positionStyle: React.CSSProperties = {};
    
    switch(position) {
      case 'bottom-left':
        positionStyle = { 
          bottom: `${offsetY}rem`, 
          left: `${offsetX}rem`, 
          right: 'auto'
        };
        break;
      case 'top-right':
        positionStyle = { 
          top: `${offsetY}rem`, 
          right: `${offsetX}rem`,
          bottom: 'auto'
        };
        break;
      case 'top-left':
        positionStyle = { 
          top: `${offsetY}rem`, 
          left: `${offsetX}rem`,
          bottom: 'auto',
          right: 'auto'
        };
        break;
      case 'bottom-right':
      default:
        positionStyle = { 
          bottom: `${offsetY}rem`, 
          right: `${offsetX}rem`
        };
    }
    
    return positionStyle;
  }, [config.position]);

  if (loading) {
    return (
      <div className="fixed bottom-16 sm:bottom-24 right-4 w-[90vw] sm:w-80 md:w-96 h-[500px] sm:h-[600px] max-h-[80vh] rounded-lg shadow-lg bg-gradient-to-br from-soft-purple-50 to-soft-purple-100 p-4 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm sm:text-base text-vivid-purple">Loading...</p>
        </div>
      </div>
    );
  }

  const widgetWidth = isMobile ? "90vw" : "sm:w-80 md:w-96";
  const widgetHeight = isMobile ? "500px" : "600px";
  const widgetMaxHeight = isMobile ? "80vh" : "85vh";

  // Calculate launcher position for when widget is open
  const getLauncherPositionStyles = () => {
    if (!isOpen) return getPositionStyles;
    
    // Clone the position styles
    const positionStyle = {...getPositionStyles};
    
    // Add extra bottom margin to position launcher below the widget
    const widgetHeight = isMobile ? 500 : 600;
    const extraMargin = 1; // Extra space between widget and launcher in rem
    
    // Adjust bottom position for bottom placements
    if (positionStyle.bottom !== undefined && positionStyle.bottom !== 'auto') {
      const currentBottom = parseFloat(positionStyle.bottom as string);
      const heightInRem = (widgetHeight / 16) + extraMargin; // Convert px to rem (16px = 1rem)
      positionStyle.bottom = `${currentBottom + heightInRem}rem`;
    }
    
    // For top placements, we need different logic
    if (positionStyle.top !== undefined && positionStyle.top !== 'auto') {
      const currentTop = parseFloat(positionStyle.top as string);
      const heightInRem = (widgetHeight / 16) + extraMargin;
      positionStyle.top = `${currentTop + heightInRem}rem`;
    }
    
    return positionStyle;
  };

  return (
    <>
      {isOpen && (
        <div 
          className={`fixed ${widgetWidth} h-[${widgetHeight}] max-h-[${widgetMaxHeight}] z-50 chat-widget-container animate-fade-in shadow-chat-widget flex flex-col rounded-xl sm:rounded-2xl overflow-hidden`}
          style={{...widgetStyle, ...getPositionStyles}}
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
          
          {config.branding?.showBrandingBar !== false && <PoweredByBar />}
        </div>
      )}
      <div className="fixed flex flex-col items-end" style={getLauncherPositionStyles()}>
        <Button
          className="rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center chat-widget-button relative transition-transform hover:scale-105"
          style={config.branding?.primaryColor ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor } : {}}
          onClick={toggleChat}
        >
          <MessageSquare size={isMobile ? 20 : 24} className="text-white" />
          {!isOpen && unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-red-500 text-white border-white border-2 animate-pulse text-xs" 
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    </>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;
