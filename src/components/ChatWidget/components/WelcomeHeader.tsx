
import React, { useEffect, useRef } from 'react';
import { ChatWidgetConfig } from '../config';
import LazyImage from './LazyImage';

interface WelcomeHeaderProps {
  config: ChatWidgetConfig;
  typingComplete: boolean;
  themeStyles: {
    fontFamily: string;
    backgroundGradient: string;
    headerGradient: string;
  };
}

const WelcomeHeader = ({ config, typingComplete, themeStyles }: WelcomeHeaderProps) => {
  const welcomeTextRef = useRef<HTMLHeadingElement>(null);

  // Ensure proper focus management for accessibility
  useEffect(() => {
    if (typingComplete && welcomeTextRef.current) {
      welcomeTextRef.current.setAttribute('tabindex', '0');
      welcomeTextRef.current.setAttribute('aria-label', config.welcomeMessage || 'Welcome message');
    }
  }, [typingComplete, config.welcomeMessage]);

  return (
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
  );
};

export default WelcomeHeader;

// Need to import AgentPresence explicitly in this file
import AgentPresence from './AgentPresence';
