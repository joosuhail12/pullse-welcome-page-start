
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
  
  // Use the pre-chat form hook with stable references
  const { showPreChatForm, hidePreChatForm } = usePreChatForm({ 
    conversation, 
    config, 
    userFormData 
  });

  // Handle form submission with improved state management
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    console.log("Form submission in useChatFormHandling with data:", formData);
    
    // Use ref to check if submission is already in progress
    if (formSubmissionRef.current || isProcessingForm) {
      console.log("Form submission already in progress, ignoring duplicate submission");
      return;
    }
    
    // Set both state and ref to prevent multiple submissions
    formSubmissionRef.current = true;
    setIsProcessingForm(true);
    
    // First hide the form to prevent rendering issues
    hidePreChatForm();
    
    // Use setTimeout to batch state updates
    setTimeout(() => {
      if (setUserFormData) {
        setUserFormData(formData);
      }
      
      onUpdateConversation({
        ...conversation,
        contactIdentified: true
      });
      
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
