import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageCircle, Clock } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = React.memo(({
  onStartChat,
  config = defaultConfig
}: HomeViewProps) => {
  const isMobile = useIsMobile();

  // Apply custom branding if available - use useMemo to prevent recalculation
  const buttonStyle = useMemo(() => {
    return config.colors?.primaryColor
      ? { backgroundColor: config.colors.primaryColor, borderColor: config.colors.primaryColor }
      : {};
  }, [config.colors?.primaryColor]);

  // Handle direct chat start
  const handleStartChatClick = useCallback(() => {
    // Dispatch event when chat button is clicked - using a custom event type to avoid TS errors
    dispatchChatEvent('contact:initiated', { showForm: true }, config);

    // Start the chat without form data, the form will be shown if needed
    onStartChat();
  }, [config, onStartChat]);

  // Responsive sizing
  const avatarSize = isMobile ? "h-14 w-14" : "h-16 w-16 sm:h-20 sm:w-20";
  const headingSize = isMobile ? "text-lg" : "text-xl sm:text-3xl";
  const paragraphSize = isMobile ? "text-2xs sm:text-xs" : "text-xs sm:text-base";
  const iconSize = isMobile ? 14 : 18;
  const paddingSize = isMobile ? "p-3" : "p-4 sm:p-6";

  return (
    <div
      style={{
        backgroundColor: config.colors?.backgroundColor || 'transparent'
      }}
      className={`
        flex flex-col 
        ${paddingSize} 
        h-full 
        animate-subtle-fade-in 
        ${!config.colors?.backgroundColor && 'bg-gradient-to-br from-soft-purple-50 to-soft-purple-100'}
      `}
    >
      {/* Welcoming header with avatar */}
      <div className="flex flex-col items-center mb-3 sm:mb-7 transition-transform duration-300 hover:scale-[1.01]">
        <Avatar className={`${avatarSize} mb-2 sm:mb-5 shadow-md animate-subtle-scale border-2 border-white`}>
          {config.brandAssets?.headerLogo ? (
            <AvatarImage src={config.brandAssets.headerLogo} alt="Company logo" />
          ) : config.brandAssets?.avatarUrl ? (
            <AvatarImage src={config.brandAssets.avatarUrl} alt="Avatar image" />
          ) : (
            <AvatarImage src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" />
          )}
          <AvatarFallback className="bg-soft-purple-100 text-vivid-purple-600 text-xl">
            <MessageCircle size={isMobile ? 20 : 24} />
          </AvatarFallback>
        </Avatar>
        <h1
          style={{ color: config.colors?.primaryColor }}
          className={`${headingSize} font-bold text-center bg-gradient-to-r bg-clip-text animate-subtle-slide-in mb-1 sm:mb-2`}>
          {config.labels.welcomeTitle}
        </h1>

        <p className={`${paragraphSize} text-gray-600 text-center leading-relaxed max-w-xs animate-subtle-fade-in`}>
          {config.labels.welcomeSubtitle}
        </p>
      </div>

      {/* Team Availability Section */}
      {
        config.interfaceSettings?.showOfficeHours && (<div className="mb-3 sm:mb-6 animate-subtle-fade-in space-y-2 sm:space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-3xs sm:text-xs uppercase tracking-wide font-semibold text-gray-500">Team Availability</h3>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-2 sm:p-4 rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="bg-soft-purple-100 p-1 sm:p-2 rounded-full">
                <Clock size={iconSize} className="text-vivid-purple-600" />
              </div>
              <span className="text-2xs sm:text-sm font-medium text-gray-700">Office Hours</span>
            </div>
            <p className="text-3xs sm:text-xs text-gray-600 pl-6 sm:pl-9">Mon-Fri: 9 AM - 5 PM EST</p>
          </div>
        </div>)
      }

      {/* Support status */}
      {
        config.interfaceSettings?.showAgentPresence && (<div className="mb-3 sm:mb-6 animate-subtle-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-3xs sm:text-xs uppercase tracking-wide font-semibold text-gray-500">Current Availability</h3>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-2 sm:p-4 rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-300 hover:bg-white/80">
            <AgentPresence />
          </div>
        </div>
        )}

      <div className="mt-auto animate-subtle-fade-in">
        <Button
          onClick={handleStartChatClick}
          className="chat-widget-button flex items-center justify-center gap-2 w-full py-3 sm:py-5 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg text-xs sm:text-base"
          style={buttonStyle}
        >
          <MessageSquare size={iconSize} className="shrink-0" />
          <span className="font-medium">{config?.labels?.askQuestionButtonText}</span>
        </Button>
      </div>
    </div>
  );
});

// Add display name for debugging
HomeView.displayName = 'HomeView';

export default HomeView;
