
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import PreChatForm from '../components/PreChatForm';

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
      <div className="mb-5">
        <h2 className="text-xl font-bold text-vivid-purple-500">
          {config.welcomeMessage}
        </h2>
        
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Get help, ask questions, or start a conversation.
        </p>
        
        <AgentPresence />
      </div>
      
      {showForm && config.preChatForm.enabled ? (
        <div className="mt-2">
          <PreChatForm config={config} onFormComplete={handleFormComplete} />
        </div>
      ) : (
        <div className="mt-auto">
          <Button 
            onClick={handleStartChatClick}
            className="chat-widget-button flex items-center gap-2 w-full py-2.5"
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
