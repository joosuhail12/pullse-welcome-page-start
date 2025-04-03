
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
    return config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
  }, [config.branding?.primaryColor]);
  
  // Handle direct chat start
  const handleStartChatClick = useCallback(() => {
    // Dispatch event when chat button is clicked
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    // Always start the chat view, the pre-chat form will be handled there
    onStartChat();
  }, [onStartChat, config]);
  
  const avatarSize = isMobile ? "h-16 w-16" : "h-20 w-20";
  const headingSize = isMobile ? "text-xl sm:text-3xl" : "text-3xl";
  const paragraphSize = isMobile ? "text-xs sm:text-base" : "text-base";
  
  return (
    <div className="flex flex-col p-4 sm:p-6 h-full animate-subtle-fade-in bg-gradient-to-br from-soft-purple-50 to-soft-purple-100">
      {/* Welcoming header with avatar */}
      <div className="flex flex-col items-center mb-4 sm:mb-7 transition-transform duration-300 hover:scale-[1.01]">
        <Avatar className={`${avatarSize} mb-3 sm:mb-5 shadow-md animate-subtle-scale border-2 border-white`}>
          <AvatarImage src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" />
          <AvatarFallback className="bg-soft-purple-100 text-vivid-purple-600 text-xl">
            <MessageCircle size={isMobile ? 24 : 30} />
          </AvatarFallback>
        </Avatar>
        
        <h1 className={`${headingSize} font-bold text-center bg-gradient-to-r from-vivid-purple-600 to-vivid-purple-500 bg-clip-text text-transparent animate-subtle-slide-in mb-2`}>
          {config.welcomeMessage}
        </h1>
        
        <p className={`${paragraphSize} text-gray-600 text-center leading-relaxed max-w-xs animate-subtle-fade-in`}>
          Get help, ask questions, or start a conversation with our friendly support team.
        </p>
      </div>
      
      {/* Team Availability Section */}
      <div className="mb-4 sm:mb-6 animate-subtle-fade-in space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-wide font-semibold text-gray-500">Team Availability</h3>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          <div className="bg-white/60 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Clock size={isMobile ? 14 : 16} className="text-vivid-purple-500" />
              <span className="text-2xs sm:text-sm font-medium text-gray-700">Office Hours</span>
            </div>
            <p className="text-3xs sm:text-xs text-gray-500">Mon-Fri: 9 AM - 5 PM EST</p>
          </div>
        </div>
      </div>
      
      {/* Support status */}
      <div className="mb-4 sm:mb-6 animate-subtle-fade-in">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <h3 className="text-xs sm:text-sm uppercase tracking-wide font-semibold text-gray-500">Current Availability</h3>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-sm">
          <AgentPresence />
        </div>
      </div>
      
      <div className="mt-auto animate-subtle-fade-in">
        <Button 
          onClick={handleStartChatClick}
          className="chat-widget-button flex items-center gap-2 w-full py-2 sm:py-3 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] rounded-lg text-xs sm:text-sm"
          style={buttonStyle}
        >
          <MessageSquare size={isMobile ? 16 : 18} />
          <span className="font-medium">Ask a question</span>
        </Button>
      </div>
    </div>
  );
});

// Add display name for debugging
HomeView.displayName = 'HomeView';

export default HomeView;

