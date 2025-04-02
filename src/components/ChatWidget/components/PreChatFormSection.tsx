
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { ChatWidgetConfig } from '../config';
import PreChatForm from './PreChatForm';

interface PreChatFormSectionProps {
  config?: ChatWidgetConfig;
  onFormComplete: (formData: Record<string, string>) => void;
  isProcessingForm?: boolean;
}

// Use memo to prevent unnecessary re-renders
const PreChatFormSection = memo(({ config, onFormComplete, isProcessingForm }: PreChatFormSectionProps) => {
  const [mounted, setMounted] = useState(false);
  const handledSubmissionRef = useRef(false);
  const submittedDataRef = useRef<Record<string, string> | null>(null);
  
  // Subtle animation on mount with a slight delay for better sequencing
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 400);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Reset submission handling when processing state changes to false
  useEffect(() => {
    if (isProcessingForm === false) {
      handledSubmissionRef.current = false;
    }
  }, [isProcessingForm]);
  
  // Memoize the handler to prevent recreation on each render
  const handleFormSubmit = useCallback((formData: Record<string, string>) => {
    // Prevent multiple submissions
    if (isProcessingForm || handledSubmissionRef.current) {
      console.log("Preventing duplicate form submission");
      return;
    }
    
    // Check for duplicate data
    const formDataString = JSON.stringify(formData);
    const prevDataString = submittedDataRef.current ? JSON.stringify(submittedDataRef.current) : null;
    
    if (prevDataString && prevDataString === formDataString) {
      console.log("Same form data submitted again, ignoring");
      return;
    }
    
    console.log("PreChatFormSection handling form submission");
    handledSubmissionRef.current = true;
    submittedDataRef.current = formData;
    
    // Call the callback with the form data
    onFormComplete(formData);
  }, [onFormComplete, isProcessingForm]);
  
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
        onFormComplete={handleFormSubmit} 
        isProcessingForm={isProcessingForm}
      />
    </div>
  );
});

// Add display name for debugging
PreChatFormSection.displayName = 'PreChatFormSection';

export default PreChatFormSection;
