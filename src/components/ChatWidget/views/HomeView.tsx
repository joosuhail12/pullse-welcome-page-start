
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';

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
  
  // Handle direct chat start (no form) - memoized to prevent recreation on each render
  const handleStartChat = useCallback(() => {
    // Always dispatch event when chat is initiated
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    // Pass empty object if no form is enabled, the ChatView will handle showing the form
    onStartChat({});
  }, [onStartChat, config]);
  
  return (
    <div className="flex flex-col p-5 h-full">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-vivid-purple-500">
          {config.welcomeMessage}
        </h2>
        
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Get help, ask questions, or start a conversation.
        </p>
        
        <AgentPresence />
      </div>
      
      <div className="mt-auto">
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button flex items-center gap-2 w-full py-2.5"
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
