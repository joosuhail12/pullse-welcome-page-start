
import React from 'react';
import { ChatWidgetConfig } from '../config';
import PreChatForm from './PreChatForm';

interface PreChatFormSectionProps {
  config?: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatFormSection = ({ config, onFormComplete }: PreChatFormSectionProps) => {
  // Apply custom branding if available
  const themeStyles = {
    fontFamily: config?.branding?.fontFamily || 'inherit',
    backgroundGradient: config?.branding?.backgroundGradient || 'from-white via-gray-50 to-white',
  };
  
  return (
    <div 
      className={`mb-4 p-4 bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-xl shadow-md animate-fade-in backdrop-blur-sm`}
      style={{ fontFamily: themeStyles.fontFamily }}
    >
      <PreChatForm 
        config={config} 
        onFormComplete={onFormComplete} 
      />
    </div>
  );
};

export default PreChatFormSection;
