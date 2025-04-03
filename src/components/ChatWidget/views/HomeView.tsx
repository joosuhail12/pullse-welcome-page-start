
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageCircle, HelpCircle, Users } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = React.memo(({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
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
  
  return (
    <div className="flex flex-col p-6 h-full animate-subtle-fade-in bg-gradient-to-br from-soft-purple-50 to-soft-purple-100">
      {/* Welcoming header with avatar */}
      <div className="flex flex-col items-center mb-7 transition-transform duration-300 hover:scale-[1.01]">
        <Avatar className="h-20 w-20 mb-5 shadow-md animate-subtle-scale border-2 border-white">
          <AvatarImage src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" />
          <AvatarFallback className="bg-soft-purple-100 text-vivid-purple-600 text-xl">
            <MessageCircle size={30} />
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-vivid-purple-600 to-vivid-purple-500 bg-clip-text text-transparent animate-subtle-slide-in mb-2">
          {config.welcomeMessage}
        </h1>
        
        <p className="text-base text-gray-600 text-center leading-relaxed max-w-xs animate-subtle-fade-in">
          Get help, ask questions, or start a conversation with our friendly support team.
        </p>
      </div>
      
      {/* Feature highlights */}
      <div className="mb-6 animate-subtle-fade-in space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm uppercase tracking-wide font-semibold text-gray-500">How We Can Help</h3>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={16} className="text-vivid-purple-500" />
              <span className="text-sm font-medium text-gray-700">Ask Questions</span>
            </div>
            <p className="text-xs text-gray-500">Get answers to your product questions</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-vivid-purple-500" />
              <span className="text-sm font-medium text-gray-700">Support Team</span>
            </div>
            <p className="text-xs text-gray-500">Talk to our friendly agents</p>
          </div>
        </div>
      </div>
      
      {/* Support status */}
      <div className="mb-6 animate-subtle-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm uppercase tracking-wide font-semibold text-gray-500">Support Status</h3>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm">
          <AgentPresence />
        </div>
      </div>
      
      <div className="mt-auto animate-subtle-fade-in">
        <Button 
          onClick={handleStartChatClick}
          className="chat-widget-button flex items-center gap-2 w-full py-3 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] rounded-lg"
          style={buttonStyle}
        >
          <MessageSquare size={18} />
          <span className="font-medium">Ask a question</span>
        </Button>
      </div>
    </div>
  );
});

// Add display name for debugging
HomeView.displayName = 'HomeView';

export default HomeView;
