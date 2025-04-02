
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';
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
      backgroundGradient: config.branding?.backgroundGradient || 'from-white to-gray-50',
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
      className={`flex flex-col p-6 h-full bg-gradient-to-br ${themeStyles.backgroundGradient} animate-fade-in`}
      style={{ fontFamily: themeStyles.fontFamily }}
    >
      {/* Brand logo if provided */}
      {config.branding?.logoUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={config.branding.logoUrl} 
            alt="Brand Logo" 
            className="h-10 object-contain" 
          />
        </div>
      )}
      
      <div className="mb-6">
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
        <div className="my-4 flex justify-center">
          <img 
            src={config.welcomeImageUrl} 
            alt="Welcome" 
            className="max-h-32 object-contain rounded-lg shadow-sm" 
            loading="lazy"
          />
        </div>
      )}
      
      {config.features?.quickPrompts && config.quickPrompts?.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs text-gray-500 mb-1">Quick questions:</p>
          <div className="space-y-2">
            {config.quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  onStartChat();
                  // Note: This assumes there's a way to pre-fill the message input
                  // This would need to be implemented in the ChatView component
                  dispatchChatEvent('quickPrompt:selected', { prompt }, config);
                }}
                className="w-full text-left text-sm py-2 px-3 rounded-md bg-white bg-opacity-70 hover:bg-opacity-100 transition-colors flex items-center justify-between border border-gray-100 shadow-sm"
              >
                <span>{prompt}</span>
                <ArrowRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto">
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button flex items-center gap-2 w-full py-3 rounded-lg shadow-md transition-all hover:shadow-lg group"
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
