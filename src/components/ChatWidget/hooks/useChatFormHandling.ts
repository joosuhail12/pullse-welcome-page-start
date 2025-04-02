
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
  const formSubmissionRef = useRef(false);
  const lastSubmittedDataRef = useRef<Record<string, string> | null>(null);
  
  // Use the pre-chat form hook
  const { showPreChatForm, hidePreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Handle form submission with improved state management
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    console.log("Form submission in useChatFormHandling with data:", formData);
    
    // Check for duplicate submission with same data
    if (lastSubmittedDataRef.current && 
        JSON.stringify(lastSubmittedDataRef.current) === JSON.stringify(formData)) {
      console.log("Preventing duplicate submission with same data");
      return;
    }
    
    // Use ref to check if submission is already in progress
    if (formSubmissionRef.current || isProcessingForm) {
      console.log("Form submission already in progress, ignoring duplicate submission");
      return;
    }
    
    // Set refs before any state updates
    formSubmissionRef.current = true;
    lastSubmittedDataRef.current = formData;
    
    // Set processing state
    setIsProcessingForm(true);
    
    // First hide the form
    hidePreChatForm();
    
    // Batch updates to prevent cascading renders
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
      
      // Dispatch event if config exists
      if (config) {
        dispatchChatEvent('contact:formCompleted', { formData }, config);
      }
      
      // Reset processing flags after a delay
      setTimeout(() => {
        setIsProcessingForm(false);
        formSubmissionRef.current = false;
      }, 500);
    }, 0);
    
  }, [conversation, config, hidePreChatForm, isProcessingForm, onUpdateConversation, setUserFormData]);

  return {
    showPreChatForm,
    handleFormComplete,
    isProcessingForm
  };
}
