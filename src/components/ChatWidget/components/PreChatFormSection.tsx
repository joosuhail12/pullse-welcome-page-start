
import React, { useState, useEffect } from 'react';
import { ChatWidgetConfig } from '../config';
import PreChatForm from './PreChatForm';

interface PreChatFormSectionProps {
  config?: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatFormSection = ({ config, onFormComplete }: PreChatFormSectionProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Subtle animation on mount with a slight delay for better sequencing
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 400);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply custom branding if available
  const themeStyles = {
    fontFamily: config?.branding?.fontFamily || 'inherit',
    backgroundGradient: config?.branding?.backgroundGradient || 'from-white via-gray-50 to-white',
  };
  
  return (
    <div 
      className={`mb-4 p-4 bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-xl shadow-md backdrop-blur-sm transition-all duration-500 ease-in-out`}
      style={{ 
        fontFamily: themeStyles.fontFamily,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)'
      }}
      role="region"
      aria-label="Pre-chat form"
      tabIndex={0}
    >
      <PreChatForm 
        config={config} 
        onFormComplete={onFormComplete} 
      />
    </div>
  );
};

export default PreChatFormSection;
