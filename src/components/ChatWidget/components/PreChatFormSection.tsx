
import React from 'react';
import { ChatWidgetConfig } from '../config';
import PreChatForm from './PreChatForm';

interface PreChatFormSectionProps {
  config?: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
}

const PreChatFormSection = ({ config, onFormComplete }: PreChatFormSectionProps) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm animate-fade-in">
      <PreChatForm 
        config={config} 
        onFormComplete={onFormComplete} 
      />
    </div>
  );
};

export default PreChatFormSection;
