
import React, { useEffect } from 'react';
import { useChatState } from './hooks/useChatState';
import useWidgetConfig from './hooks/useWidgetConfig';
import { dispatchChatEvent } from './utils/events';
import { initializeAbly, cleanupAbly } from './utils/ably';
import { getAblyAuthUrl } from './services/ablyAuth';
import { useUnreadMessages } from './hooks/useUnreadMessages';
import { useSound } from './hooks/useSound';
import { useChatWidgetContext } from './ChatWidgetProvider';
import WidgetLauncher from './components/WidgetLauncher';
import WidgetContainer from './components/WidgetContainer';
import WidgetFooter from './components/WidgetFooter';
import { 
  getPositionClass, 
  getMessageStyleClass, 
  getButtonStyleClass,
  getWidgetStyles,
  getButtonStyle
} from './utils/widgetStyles';

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
  
  // When widget loads, dispatch event
  useEffect(() => {
    if (!loading) {
      dispatchChatEvent('widget:loaded', { workspaceId: config.workspaceId }, config);
    }
  }, [loading, config.workspaceId]);
  
  // Apply widget styling
  const widgetStyle = getWidgetStyles(config);

  useEffect(() => {
    // Apply theme preference if set
    if (config.branding?.theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode = 
        config.branding.theme === 'dark' || 
        (config.branding.theme === 'auto' && prefersDark);
      
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
    
    // Clear unread messages when chat is opened
    if (isOpen) {
      clearUnreadMessages();
    }
  }, [isOpen, clearUnreadMessages, config.branding?.theme]);

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

  // Render footer using the dedicated component
  const renderFooter = () => (
    <WidgetFooter showBrandingBar={config.branding?.showBrandingBar} />
  );

  // Get position and style classes
  const positionClass = getPositionClass(config.position);
  const messageStyleClass = getMessageStyleClass(config.branding?.messageStyle);
  const buttonStyleClass = getButtonStyleClass(config.branding?.buttonStyle);
  const buttonStyle = getButtonStyle(config.branding?.primaryColor);

  return (
    <>
      {isOpen && (
        <WidgetContainer
          viewState={viewState}
          activeConversation={activeConversation}
          onBackToMessages={handleBackToMessages}
          onChangeView={handleChangeView}
          onSelectConversation={handleSelectConversation}
          onUpdateConversation={handleUpdateConversation}
          onStartChat={wrappedHandleStartChat}
          config={config}
          positionClass={positionClass}
          messageStyleClass={messageStyleClass}
          widgetStyle={widgetStyle}
          playMessageSound={playMessageSound}
          renderFooter={renderFooter}
        />
      )}
      <WidgetLauncher
        unreadCount={unreadCount}
        isOpen={isOpen}
        onClick={toggleChat}
        buttonStyle={buttonStyle}
        positionClass={positionClass}
        buttonStyleClass={buttonStyleClass}
      />
    </>
  );
};

export default ChatWidget;
