
import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChatWidgetConfig } from '../config';
import PreChatForm from './PreChatForm';

interface PreChatFormSectionProps {
  config?: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
  isProcessingForm?: boolean;
}

const PreChatFormSection = memo(({ config, onFormComplete, isProcessingForm }: PreChatFormSectionProps) => {
  const [mounted, setMounted] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<Record<string, string> | null>(null);
  
  // Subtle animation on mount with a slight delay for better sequencing
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Form submission handler with deduplication
  const handleFormSubmit = useCallback((formData: Record<string, string>) => {
    if (isProcessingForm) {
      console.log("Form already processing, preventing submission");
      return;
    }
    
    // Check for duplicate submissions
    const formDataString = JSON.stringify(formData);
    const prevDataString = lastSubmittedData ? JSON.stringify(lastSubmittedData) : null;
    
    if (prevDataString && prevDataString === formDataString) {
      console.log("Duplicate form data detected, ignoring");
      return;
    }
    
    // Store the submitted data and forward the submission
    setLastSubmittedData(formData);
    onFormComplete(formData);
  }, [onFormComplete, isProcessingForm, lastSubmittedData]);
  
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
      {config && (
        <PreChatForm 
          config={config} 
          onFormComplete={handleFormSubmit} 
          isProcessingForm={isProcessingForm}
        />
      )}
    </div>
  );
});

PreChatFormSection.displayName = 'PreChatFormSection';

export default PreChatFormSection;
