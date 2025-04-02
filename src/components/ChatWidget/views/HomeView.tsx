
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = ({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  // Apply custom branding if available
  const buttonStyle = config.branding?.primaryColor 
    ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
    : {};
  
  // Handle direct chat start (no form)
  const handleStartChat = () => {
    // Always dispatch event when chat is initiated
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    // Start chat - the form will be shown in ChatView if needed
    onStartChat();
  };
  
  return (
    <div className="flex flex-col p-6 h-full bg-gradient-to-br from-white to-gray-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-vivid-purple-600 to-vivid-purple-400 bg-clip-text text-transparent">
          {config.welcomeMessage}
        </h2>
        
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Get help, ask questions, or start a conversation with our support team.
          We now support chat history with pagination.
        </p>
        
        <AgentPresence />
      </div>
      
      <div className="mt-auto">
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button flex items-center gap-2 w-full py-3 rounded-lg shadow-md transition-all hover:shadow-lg"
          style={buttonStyle}
        >
          <MessageSquare size={20} />
          <span className="font-medium">Ask a question</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
