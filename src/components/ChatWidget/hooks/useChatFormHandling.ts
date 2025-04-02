
import { useCallback, useRef, useState, useEffect } from 'react';
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
  const formSubmissionRef = useRef(false);
  const lastSubmittedDataRef = useRef<Record<string, string> | null>(null);
  
  // Use the pre-chat form hook
  const { showPreChatForm, updateFormVisibility, hidePreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Update visibility when dependencies change
  useEffect(() => {
    updateFormVisibility();
  }, [updateFormVisibility]);

  // Handle form submission with improved state management
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    // Check for processing state or duplicate submission
    if (formSubmissionRef.current || isProcessingForm) {
      console.log("Form submission already in progress, ignoring duplicate");
      return;
    }
    
    // Compare with last submission to prevent duplicates
    if (lastSubmittedDataRef.current && 
        JSON.stringify(lastSubmittedDataRef.current) === JSON.stringify(formData)) {
      console.log("Preventing duplicate submission with same data");
      return;
    }
    
    // Set flags before starting the process
    formSubmissionRef.current = true;
    lastSubmittedDataRef.current = formData;
    setIsProcessingForm(true);
    
    console.log("Processing form completion with data:", formData);
    
    // Hide the form first
    hidePreChatForm();
    
    // Update all state in batches
    setTimeout(() => {
      // Update user data
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
      
      // Reset processing flags after a delay
      setTimeout(() => {
        setIsProcessingForm(false);
        formSubmissionRef.current = false;
      }, 300);
    }, 0);
    
  }, [conversation, config, hidePreChatForm, onUpdateConversation, setUserFormData, isProcessingForm]);

  return {
    showPreChatForm,
    handleFormComplete,
    isProcessingForm
  };
}
