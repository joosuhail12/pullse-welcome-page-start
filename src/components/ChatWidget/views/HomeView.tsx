
import React, { useMemo, useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  
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

  // More subtle typing animation effect for the welcome message
  useEffect(() => {
    setMounted(true);
    
    if (config.welcomeMessage && !typingComplete) {
      const initialDelay = setTimeout(() => {
        const interval = setInterval(() => {
          if (typingIndex < config.welcomeMessage.length) {
            setTypingIndex(prev => prev + 1);
          } else {
            setTypingComplete(true);
            clearInterval(interval);
          }
        }, 50); // Slightly faster typing speed for better UX
        
        return () => clearInterval(interval);
      }, 400); // Slightly longer delay before typing starts for a more natural feel
      
      return () => clearTimeout(initialDelay);
    }
    
    return undefined;
  }, [config.welcomeMessage, typingIndex, typingComplete]);
  
  return (
    <div 
      className={`flex flex-col p-6 h-full bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-lg backdrop-blur-sm bg-opacity-95 transition-opacity duration-700 ease-in-out ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ fontFamily: themeStyles.fontFamily }}
    >
      {/* Brand logo if provided */}
      {config.branding?.logoUrl && (
        <div className="mb-4 flex justify-center">
          <img 
            src={config.branding.logoUrl} 
            alt="Brand Logo" 
            className="h-10 object-contain transition-transform duration-500 hover:scale-105" 
          />
        </div>
      )}
      
      <div className="mb-6">
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.headerGradient} bg-clip-text text-transparent overflow-hidden focus:outline-none focus:ring-2 focus:ring-vivid-purple-300 focus:ring-offset-2 rounded-md tabindex="0"`}>
          {typingComplete 
            ? config.welcomeMessage 
            : config.welcomeMessage?.substring(0, typingIndex) || ''}
          {!typingComplete && (
            <span className="inline-block w-1 h-5 ml-0.5 bg-vivid-purple-500 animate-pulse"></span>
          )}
        </h2>
        
        <div className={`text-sm text-gray-800 mt-3 leading-relaxed transition-opacity duration-700 ease-in-out ${typingComplete ? 'opacity-100' : 'opacity-0'}`}>
          {config.welcomeDescription ? (
            <p>{config.welcomeDescription}</p>
          ) : (
            <p>Get help, ask questions, or start a conversation with our support team.</p>
          )}
          
          <AgentPresence />
        </div>
      </div>
      
      {config.welcomeImageUrl && (
        <div className="my-4 flex justify-center transition-all duration-700 ease-in-out opacity-0 transform translate-y-4" 
             style={{ opacity: typingComplete ? 1 : 0, transform: typingComplete ? 'translateY(0)' : 'translateY(10px)' }}>
          <img 
            src={config.welcomeImageUrl} 
            alt="Welcome" 
            className="max-h-32 object-contain rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" 
            loading="lazy"
          />
        </div>
      )}
      
      <div className="mt-auto transition-all duration-700 delay-200 ease-in-out opacity-0 transform translate-y-4" 
           style={{ opacity: typingComplete ? 1 : 0, transform: typingComplete ? 'translateY(0)' : 'translateY(10px)' }}>
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button flex items-center justify-center gap-2 w-full py-3 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl group focus:ring-2 focus:ring-vivid-purple-300 focus:ring-offset-2 focus:outline-none"
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
