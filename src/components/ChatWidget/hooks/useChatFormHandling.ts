
import { useCallback, useRef, useState } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { usePreChatForm } from './usePreChatForm';

interface UseChatFormHandlingProps {
  conversation: Conversation;
  config?: ChatWidgetConfig;
  userFormData?: Record<string, string>;
  setUserFormData?: (data: Record<string, string>) => void;
  onUpdateConversation: (updatedConversation: Conversation) => void;
}

export function useChatFormHandling({
  conversation,
  config,
  userFormData,
  setUserFormData,
  onUpdateConversation
}: UseChatFormHandlingProps) {
  const [isProcessingForm, setIsProcessingForm] = useState(false);
  
  // Use refs to track submission state without triggering re-renders
  const formSubmissionRef = useRef(false);
  const lastSubmittedDataRef = useRef<Record<string, string> | null>(null);
  
  // Get the pre-chat form visibility state
  const { showPreChatForm, hidePreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Handle form submission with improved state management
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    // Prevent duplicate submissions or processing during submission
    if (formSubmissionRef.current || isProcessingForm) {
      console.log("Form submission already in progress, ignoring duplicate");
      return;
    }
    
    // Compare with last submission to prevent duplicates
    const currentDataString = JSON.stringify(formData);
    const lastDataString = lastSubmittedDataRef.current ? 
                           JSON.stringify(lastSubmittedDataRef.current) : null;
    
    if (lastDataString && lastDataString === currentDataString) {
      console.log("Preventing duplicate submission with same data");
      return;
    }
    
    // Lock submission state
    formSubmissionRef.current = true;
    lastSubmittedDataRef.current = formData;
    setIsProcessingForm(true);
    
    console.log("Processing form completion with data:", formData);
    
    // Hide the form immediately to prevent further submissions
    hidePreChatForm();
    
    // Update user data if handler provided
    if (setUserFormData) {
      setUserFormData(formData);
    }
    
    // Update conversation
    onUpdateConversation({
      ...conversation,
      contactIdentified: true
    });
    
    // Dispatch event
    if (config) {
      dispatchChatEvent('contact:formCompleted', { formData }, config);
    }
    
    // Reset processing flags after a small delay
    setTimeout(() => {
      setIsProcessingForm(false);
      formSubmissionRef.current = false;
    }, 300);
  }, [conversation, config, hidePreChatForm, isProcessingForm, onUpdateConversation, setUserFormData]);

  return {
    showPreChatForm,
    handleFormComplete,
    isProcessingForm
  };
}
