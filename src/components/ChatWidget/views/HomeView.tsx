
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageCircle } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import PreChatForm from '../components/PreChatForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = React.memo(({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  const [showForm, setShowForm] = useState(false);
  
  // Apply custom branding if available - use useMemo to prevent recalculation
  const buttonStyle = useMemo(() => {
    return config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
  }, [config.branding?.primaryColor]);
  
  // Handle form submission
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    // Always dispatch event when form is completed
    dispatchChatEvent('contact:formCompleted', { formData }, config);
    
    // Pass form data to start chat
    onStartChat(formData);
  }, [onStartChat, config]);
  
  // Handle direct chat start (show form if enabled)
  const handleStartChatClick = useCallback(() => {
    // Dispatch event when chat button is clicked
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    if (config.preChatForm.enabled) {
      setShowForm(true);
    } else {
      // If no form is enabled, start chat directly
      onStartChat({});
    }
  }, [onStartChat, config]);
  
  return (
    <div className="flex flex-col p-5 h-full">
      {/* New welcoming header with avatar */}
      <div className="flex flex-col items-center mb-6 animate-fade-in">
        <Avatar className="h-20 w-20 mb-4 shadow-md">
          <AvatarImage src="https://framerusercontent.com/images/9N8Z1vTRbJsHlrIuTjm6Ajga4dI.png" />
          <AvatarFallback className="bg-vivid-purple-100 text-vivid-purple-600 text-xl">
            <MessageCircle size={30} />
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-vivid-purple-600 to-vivid-purple-500 bg-clip-text text-transparent">
          {config.welcomeMessage}
        </h1>
        
        <p className="text-base text-gray-600 mt-3 text-center leading-relaxed max-w-xs">
          Get help, ask questions, or start a conversation with our friendly support team.
        </p>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm uppercase tracking-wide font-semibold text-gray-500">Support Status</h3>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        
        <div className="mt-2 bg-gray-50 p-3 rounded-lg">
          <AgentPresence />
        </div>
      </div>
      
      {showForm && config.preChatForm.enabled ? (
        <div className="mt-2">
          <PreChatForm config={config} onFormComplete={handleFormComplete} />
        </div>
      ) : (
        <div className="mt-auto">
          <Button 
            onClick={handleStartChatClick}
            className="chat-widget-button flex items-center gap-2 w-full py-2.5 shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={buttonStyle}
          >
            <MessageSquare size={18} />
            <span className="font-medium">Ask a question</span>
          </Button>
        </div>
      )}
    </div>
  );
});

// Add display name for debugging
HomeView.displayName = 'HomeView';

export default HomeView;
