
import { useState, useCallback } from 'react';
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
  // Calculate visibility once during initialization
  const initialShouldShow = (config?.preChatForm?.enabled || false) && 
                           !(conversation.contactIdentified || false) && 
                           !userFormData;
                      
  // Set initial state only once at component mount
  const [showPreChatForm, setShowPreChatForm] = useState(initialShouldShow);

  // Manual visibility handler - safer than using effects
  const updateFormVisibility = useCallback(() => {
    const shouldShow = (config?.preChatForm?.enabled || false) && 
                      !(conversation.contactIdentified || false) && 
                      !userFormData;
                      
    setShowPreChatForm(shouldShow);
  }, [config?.preChatForm?.enabled, conversation.contactIdentified, userFormData]);
  
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
