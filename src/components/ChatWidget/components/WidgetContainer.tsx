
import React, { useMemo } from 'react';
import { Conversation, Ticket } from '../types';
import { ChatWidgetConfig } from '../config';
import HomeView from '../views/HomeView';
import MessagesView from '../views/MessagesView';
import ChatView from '../views/ChatView';
import TabBar from './TabBar';
import PoweredByBar from './PoweredByBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConnectionStatus } from '../utils/reconnectionManager';
import { useChatContext } from '../context/chatContext';
import { useWidgetPosition } from '../hooks/useWidgetPosition';

const WidgetContainer: React.FC = React.memo(() => {

  const isMobile = useIsMobile();
  const { config, viewState, isOpen, isDemo } = useChatContext();
  const { getWidgetContainerPositionStyles } = useWidgetPosition(config, isMobile);

  const widgetStyle = useMemo(() => ({
    ...(config?.colors?.primaryColor && {
      '--vivid-purple': config.colors.primaryColor,
    } as React.CSSProperties)
  }), [config?.colors?.primaryColor]);

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
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto">
          {viewState === 'home' && (
            <HomeView />
          )}
          {viewState === 'messages' && (
            <MessagesView />
          )}
        </div>

        <TabBar />
      </div>
    );
  }, [
    viewState
  ]);

  // Memoize the branding bar to prevent unnecessary re-renders
  const brandingBar = useMemo(() => {
    return config.interfaceSettings?.showBrandingBar !== false ? <PoweredByBar /> : null;
  }, [config.interfaceSettings?.showBrandingBar]);

  if (!isOpen) return null;

  return (
    <div
      className={`${widgetClasses} z-50 chat-widget-container animate-fade-in shadow-chat-widget flex flex-col rounded-xl sm:rounded-2xl overflow-hidden ${!isDemo ? 'fixed' : ''}`}
      style={{ ...widgetStyle, ...getWidgetContainerPositionStyles }}
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
