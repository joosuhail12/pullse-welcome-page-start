
import React, { useState } from 'react';
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

const HomeView = ({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  const [showForm, setShowForm] = useState(false);
  
  // Apply custom branding if available
  const buttonStyle = config.branding?.primaryColor 
    ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
    : {};
  
  // Handle direct chat start (no form)
  const handleStartChat = () => {
    if (config.preChatForm.enabled) {
      setShowForm(true);
    } else {
      dispatchChatEvent('contact:initiatedChat', undefined, config);
      onStartChat({});
    }
  };
  
  // Handle form completion
  const handleFormComplete = (formData: Record<string, string>) => {
    dispatchChatEvent('contact:initiatedChat', undefined, config);
    onStartChat(formData);
  };
  
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
      
      {showForm ? (
        <PreChatForm 
          config={config} 
          onFormComplete={handleFormComplete} 
        />
      ) : (
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
      )}
    </div>
  );
};

export default HomeView;
