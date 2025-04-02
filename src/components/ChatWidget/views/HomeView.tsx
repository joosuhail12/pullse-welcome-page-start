
import React, { useMemo } from 'react';
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
  const buttonStyle = useMemo(() => {
    return config.branding?.primaryColor 
      ? { backgroundColor: config.branding.primaryColor, borderColor: config.branding.primaryColor }
      : {};
  }, [config.branding?.primaryColor]);

  // Custom styles from theme if available
  const themeStyles = useMemo(() => {
    return {
      fontFamily: config.branding?.fontFamily || 'inherit',
      backgroundGradient: config.branding?.backgroundGradient || 'from-white via-gray-50 to-white',
      headerGradient: config.branding?.headerGradient || 'from-vivid-purple-600 to-vivid-purple-400',
    };
  }, [config.branding]);
  
  // Handle direct chat start (no form)
  const handleStartChat = () => {
    // Always dispatch event when chat is initiated
    dispatchChatEvent('contact:initiatedChat', { showForm: config.preChatForm.enabled }, config);
    
    // Start chat - the form will be shown in ChatView if needed
    onStartChat();
  };
  
  return (
    <div 
      className={`flex flex-col p-6 h-full bg-gradient-to-br ${themeStyles.backgroundGradient} animate-fade-in rounded-lg backdrop-blur-sm bg-opacity-95`}
      style={{ fontFamily: themeStyles.fontFamily }}
    >
      {/* Brand logo if provided */}
      {config.branding?.logoUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={config.branding.logoUrl} 
            alt="Brand Logo" 
            className="h-10 object-contain animate-fade-in" 
          />
        </div>
      )}
      
      <div className="mb-6 animate-fade-in animation-delay-100">
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.headerGradient} bg-clip-text text-transparent`}>
          {config.welcomeMessage}
        </h2>
        
        {config.welcomeDescription && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {config.welcomeDescription}
          </p>
        )}
        
        {!config.welcomeDescription && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Get help, ask questions, or start a conversation with our support team.
          </p>
        )}
        
        <AgentPresence />
      </div>
      
      {config.welcomeImageUrl && (
        <div className="my-4 flex justify-center animate-fade-in animation-delay-200">
          <img 
            src={config.welcomeImageUrl} 
            alt="Welcome" 
            className="max-h-32 object-contain rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" 
            loading="lazy"
          />
        </div>
      )}
      
      <div className="mt-auto animate-fade-in animation-delay-400">
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button flex items-center gap-2 w-full py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl group"
          style={buttonStyle}
        >
          <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Ask a question</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
