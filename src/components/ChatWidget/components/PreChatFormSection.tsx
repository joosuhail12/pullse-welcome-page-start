
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
    backgroundGradient: config?.branding?.backgroundGradient || 'from-white to-gray-50',
  };
  
  return (
    <div 
      className={`mb-4 p-4 bg-gradient-to-br ${themeStyles.backgroundGradient} rounded-lg shadow-sm animate-fade-in`}
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
