
import { useState, useRef, useCallback, useEffect } from 'react';
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
  // Use useRef for tracking state to prevent re-renders
  const formEnabledRef = useRef<boolean>(config?.preChatForm?.enabled || false);
  const contactIdentifiedRef = useRef<boolean>(conversation.contactIdentified || false);
  const hasUserFormDataRef = useRef<boolean>(!!userFormData);
  
  // Use state only for UI rendering purposes
  const [showPreChatForm, setShowPreChatForm] = useState(() => {
    const shouldShow = formEnabledRef.current && 
                      !contactIdentifiedRef.current && 
                      !hasUserFormDataRef.current;
                      
    console.log('Initial pre-chat form state:', shouldShow, {
      formEnabled: formEnabledRef.current,
      contactIdentified: contactIdentifiedRef.current,
      hasUserFormData: hasUserFormDataRef.current
    });
    return shouldShow;
  });

  // Track if effect has run to prevent multiple updates
  const hasEffectRunRef = useRef<boolean>(false);

  // Update refs when dependencies change, without causing re-renders
  useEffect(() => {
    // Update refs with latest values
    formEnabledRef.current = config?.preChatForm?.enabled || false;
    contactIdentifiedRef.current = conversation.contactIdentified || false;
    hasUserFormDataRef.current = !!userFormData;
    
    // Calculate new form visibility
    const shouldShowForm = formEnabledRef.current && 
                          !contactIdentifiedRef.current && 
                          !hasUserFormDataRef.current;
    
    // Only update state if necessary to prevent render loops
    if (shouldShowForm !== showPreChatForm) {
      console.log('Updating pre-chat form visibility:', { 
        from: showPreChatForm, 
        to: shouldShowForm,
        contactIdentified: contactIdentifiedRef.current,
        hasUserFormData: hasUserFormDataRef.current
      });
      setShowPreChatForm(shouldShowForm);
    }
    
    // Mark effect as run
    hasEffectRunRef.current = true;
  }, [config?.preChatForm?.enabled, conversation.contactIdentified, userFormData, showPreChatForm]);

  // Provide a manual way to hide the form
  const hidePreChatForm = useCallback(() => {
    console.log('Manually hiding pre-chat form');
    setShowPreChatForm(false);
  }, []);

  return { 
    showPreChatForm, 
    hidePreChatForm
  };
}
