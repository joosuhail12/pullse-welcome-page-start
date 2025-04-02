import { useState, useCallback, useRef } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig, defaultConfig } from '../config';

interface UsePreChatFormOptions {
  conversation: Conversation;
  config?: ChatWidgetConfig;
  userFormData?: Record<string, string>;
}

export function usePreChatForm({ 
  conversation, 
  config = defaultConfig, 
  userFormData 
}: UsePreChatFormOptions) {
  // Use refs to track dependencies without triggering re-renders
  const conversationRef = useRef(conversation);
  const configRef = useRef(config);
  const userFormDataRef = useRef(userFormData);
  
  // Update refs when props change
  conversationRef.current = conversation;
  configRef.current = config;
  userFormDataRef.current = userFormData;
  
  // Calculate initial visibility only once
  const shouldShowInitial = (config?.preChatForm?.enabled || false) && 
                           !(conversation.contactIdentified || false) && 
                           !userFormData;
                           
  // Keep state in a single useState call to reduce complexity
  const [showPreChatForm, setShowPreChatForm] = useState(shouldShowInitial);
  
  // Safe visibility checker that doesn't cause re-renders
  const checkShouldShow = useCallback(() => {
    const currentConfig = configRef.current;
    const currentConversation = conversationRef.current;
    const currentUserFormData = userFormDataRef.current;
    
    return (currentConfig?.preChatForm?.enabled || false) && 
           !(currentConversation.contactIdentified || false) && 
           !currentUserFormData;
  }, []);
  
  // Manual visibility handler that doesn't depend on state
  const updateFormVisibility = useCallback(() => {
    const shouldShow = checkShouldShow();
    
    // Only update if the value actually changed
    if (shouldShow !== showPreChatForm) {
      setShowPreChatForm(shouldShow);
    }
  }, [checkShouldShow, showPreChatForm]);
  
  // Provide a manual way to hide the form
  const hidePreChatForm = useCallback(() => {
    setShowPreChatForm(false);
  }, []);

  return { 
    showPreChatForm, 
    updateFormVisibility,
    hidePreChatForm 
  };
}
