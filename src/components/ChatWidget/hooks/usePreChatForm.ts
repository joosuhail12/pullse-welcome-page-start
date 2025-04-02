import { useState, useCallback, useRef, useEffect } from 'react';
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
  // Store conversation and config data in refs to avoid re-renders
  const conversationRef = useRef(conversation);
  const configRef = useRef(config);
  const userFormDataRef = useRef(userFormData);
  
  // Update refs when props change without triggering re-renders
  useEffect(() => {
    conversationRef.current = conversation;
    configRef.current = config;
    userFormDataRef.current = userFormData;
  }, [conversation, config, userFormData]);
  
  // Calculate initial visibility only once
  const shouldShowInitial = Boolean(
    (config?.preChatForm?.enabled || false) && 
    !(conversation.contactIdentified || false) && 
    !userFormData
  );
                           
  // Keep state in a single useState call to reduce complexity
  const [showPreChatForm, setShowPreChatForm] = useState(shouldShowInitial);
  
  // Safe visibility checker that doesn't cause re-renders
  const checkShouldShow = useCallback(() => {
    const currentConfig = configRef.current;
    const currentConversation = conversationRef.current;
    const currentUserFormData = userFormDataRef.current;
    
    return Boolean(
      (currentConfig?.preChatForm?.enabled || false) && 
      !(currentConversation.contactIdentified || false) && 
      !currentUserFormData
    );
  }, []);
  
  // Manual visibility handler
  const updateFormVisibility = useCallback(() => {
    const shouldShow = checkShouldShow();
    setShowPreChatForm(shouldShow);
  }, [checkShouldShow]);
  
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
