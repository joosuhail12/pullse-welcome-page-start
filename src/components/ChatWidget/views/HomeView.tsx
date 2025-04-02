
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { defaultConfig, ChatWidgetConfig } from '../config';
import AgentPresence from '../components/AgentPresence';
import { dispatchChatEvent } from '../utils/events';
import LazyImage from '../components/LazyImage';

interface HomeViewProps {
  onStartChat: (formData?: Record<string, string>) => void;
  config?: ChatWidgetConfig;
}

const HomeView = ({ 
  onStartChat, 
  config = defaultConfig 
}: HomeViewProps) => {
  const [mounted, setMounted] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const welcomeTextRef = useRef<HTMLHeadingElement>(null);
  
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
    
    // Start chat with selected prompt if available
    onStartChat(selectedPrompt ? { initialPrompt: selectedPrompt } : undefined);
  };

  // Handle quick prompt selection
  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    // Dispatch event for prompt selection
    dispatchChatEvent('quickPrompt:selected', { prompt }, config);
    // Start chat with the selected prompt
    onStartChat({ initialPrompt: prompt });
  };

  // More subtle typing animation effect for the welcome message
  useEffect(() => {
    setMounted(true);
    
    if (config.welcomeMessage) {
      // Immediately set typing as complete
      setTypingComplete(true);
    }
  }, [config.welcomeMessage]);

  // Ensure proper focus management for accessibility
  useEffect(() => {
    if (typingComplete && welcomeTextRef.current) {
      welcomeTextRef.current.setAttribute('tabindex', '0');
      welcomeTextRef.current.setAttribute('aria-label', config.welcomeMessage || 'Welcome message');
    }
  }, [typingComplete, config.welcomeMessage]);
  
  return (
    <div 
      className={`flex flex-col p-6 h-full bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-lg backdrop-blur-sm bg-opacity-95 transition-all duration-700 ease-in-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ fontFamily: themeStyles.fontFamily }}
      role="dialog"
      aria-labelledby="welcome-heading"
    >
      {/* Brand logo if provided */}
      {config.branding?.logoUrl && (
        <div className="mb-5 flex justify-center">
          <LazyImage 
            src={config.branding.logoUrl} 
            alt="Brand Logo" 
            className="h-12 object-contain transition-transform duration-500 hover:scale-105" 
          />
        </div>
      )}
      
      <div className="mb-6">
        <h2 
          id="welcome-heading"
          ref={welcomeTextRef}
          className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.headerGradient} bg-clip-text text-transparent overflow-hidden focus:outline-none focus:ring-2 focus:ring-vivid-purple-300 focus:ring-offset-2 rounded-md`}
        >
          {config.welcomeMessage || ''}
        </h2>
        
        <div 
          className={`text-sm text-gray-800 mt-3 leading-relaxed transition-all duration-700 ease-in-out ${typingComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          aria-hidden={!typingComplete}
        >
          {config.welcomeDescription ? (
            <p className="text-gray-700">{config.welcomeDescription}</p>
          ) : (
            <p className="text-gray-700">Get help, ask questions, or start a conversation with our support team.</p>
          )}
          
          <AgentPresence />
        </div>
      </div>
      
      {/* Welcome image with subtle entrance animation */}
      {config.welcomeImageUrl && (
        <div 
          className={`my-4 flex justify-center overflow-hidden rounded-lg transition-all duration-700 ease-in-out`}
          style={{ 
            opacity: typingComplete ? 1 : 0,
            transform: typingComplete ? 'translateY(0)' : 'translateY(10px)',
            maxHeight: typingComplete ? '160px' : '0px',
          }}
        >
          <LazyImage 
            src={config.welcomeImageUrl} 
            alt="Welcome" 
            className="max-h-40 w-auto object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            onLoad={() => setImageLoaded(true)}
            placeholderColor="#f3f4f6"
          />
        </div>
      )}

      {/* Quick prompts section - shown when available and typing is complete */}
      {config.features?.quickPrompts && config.quickPrompts && config.quickPrompts.length > 0 && typingComplete && (
        <div className="mt-2 mb-4 transition-all duration-500" style={{
          opacity: typingComplete ? 1 : 0,
          transform: typingComplete ? 'translateY(0)' : 'translateY(8px)'
        }}>
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Sparkles size={14} className="text-vivid-purple-500" /> 
            Quick questions
          </p>
          <div className="flex flex-col gap-2">
            {config.quickPrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptSelect(prompt)}
                className="text-sm text-left py-2 px-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors duration-150 text-gray-700 focus:outline-none focus:ring-2 focus:ring-vivid-purple-300"
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`Ask: ${prompt}`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Button with micro-interaction */}
      <div 
        className="mt-auto transition-all duration-700 delay-200 ease-in-out"
        style={{ 
          opacity: typingComplete ? 1 : 0,
          transform: typingComplete ? 'translateY(0)' : 'translateY(10px)'
        }}
      >
        <Button 
          onClick={handleStartChat}
          className="chat-widget-button group flex items-center justify-center gap-2 w-full py-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] focus:ring-2 focus:ring-vivid-purple-300 focus:ring-offset-2 focus:outline-none"
          style={buttonStyle}
        >
          <MessageSquare 
            size={20} 
            className="transition-transform duration-300 group-hover:rotate-12" 
          />
          <span className="font-medium">Start a conversation</span>
        </Button>
      </div>
    </div>
  );
};

export default HomeView;
