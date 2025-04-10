
import React, { useMemo } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import TabBar from './TabBar';
import PoweredByBar from './PoweredByBar';
import { useIsMobile } from '@/hooks/use-mobile';

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

const WidgetContainer: React.FC<WidgetContainerProps> = React.memo(({
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


  const isMobile = useIsMobile();


  // Enhanced responsive width and height classes - memoized to prevent recalculation
  const widgetClasses = useMemo(() => {
    const widgetWidth = isMobile
      ? "w-[95vw] max-w-[100vw]" // Nearly full width on very small screens
      : "w-[90vw] sm:w-80 md:w-96"; // Percentage based with breakpoints

    const widgetHeight = isMobile
      ? "h-[90vh]" // Taller on mobile to use more screen space
      : "h-[500px] sm:h-[600px]";

    const widgetMaxHeight = "max-h-[90vh] sm:max-h-[85vh]"; // Increased max height for small screens

    return `${widgetWidth} ${widgetHeight} ${widgetMaxHeight}`;
  }, [isMobile]);

  // Memoize view components to prevent unnecessary re-renders
  const currentView = useMemo(() => {
    if (viewState === 'chat') {
      return (
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
      );
    }


    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto">
          {viewState === 'home' && (
            <HomeView
              onStartChat={handleStartChat}
              config={config}
            />
          )}
          {viewState === 'messages' && (
            <MessagesView onSelectConversation={handleSelectConversation} />
          )}
        </div>

        <TabBar viewState={viewState} onChangeView={handleChangeView} />
      </div>
    );
  }, [
    viewState,
    activeConversation,
    handleBackToMessages,
    handleUpdateConversation,
    config,
    playMessageSound,
    userFormData,
    setUserFormData,
    handleStartChat,
    handleSelectConversation,
    handleChangeView
  ]);

  // Memoize the branding bar to prevent unnecessary re-renders
  const brandingBar = useMemo(() => {
    return config.interfaceSettings?.showBrandingBar !== false ? <PoweredByBar /> : null;
  }, [config.interfaceSettings?.showBrandingBar]);

  return (
    <div
      className={`fixed ${widgetClasses} z-50 chat-widget-container animate-fade-in shadow-chat-widget flex flex-col rounded-xl sm:rounded-2xl overflow-hidden`}
      style={{ ...widgetStyle, ...containerStyles }}
    >
      <div className="relative w-full h-full flex flex-col flex-1 overflow-hidden">
        {currentView}
      </div>
      {brandingBar}
    </div>
  );
});

WidgetContainer.displayName = 'WidgetContainer';

export default WidgetContainer;
