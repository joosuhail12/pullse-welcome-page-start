
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

  // Use an additional ref to prevent effect from causing state updates during rendering
  const shouldUpdateRef = useRef<boolean>(false);

  // Update refs when dependencies change, without causing re-renders
  useEffect(() => {
    // Update refs with latest values
    const newFormEnabled = config?.preChatForm?.enabled || false;
    const newContactIdentified = conversation.contactIdentified || false;
    const newHasUserFormData = !!userFormData;
    
    // Only update if values have actually changed to prevent unnecessary calculations
    if (formEnabledRef.current !== newFormEnabled || 
        contactIdentifiedRef.current !== newContactIdentified || 
        hasUserFormDataRef.current !== newHasUserFormData) {
      
      // Update refs
      formEnabledRef.current = newFormEnabled;
      contactIdentifiedRef.current = newContactIdentified;
      hasUserFormDataRef.current = newHasUserFormData;
      
      // Calculate new form visibility
      const shouldShowForm = newFormEnabled && !newContactIdentified && !newHasUserFormData;
      
      // Only update state when necessary and in the next tick to avoid render loops
      if (shouldShowForm !== showPreChatForm) {
        console.log('Updating pre-chat form visibility:', { 
          from: showPreChatForm, 
          to: shouldShowForm,
          contactIdentified: newContactIdentified,
          hasUserFormData: newHasUserFormData
        });
        
        shouldUpdateRef.current = true;
      }
    }
  }, [config?.preChatForm?.enabled, conversation.contactIdentified, userFormData, showPreChatForm]);

  // Separate effect to apply state updates to avoid conflicts during render phase
  useEffect(() => {
    // Only update if needed
    if (shouldUpdateRef.current) {
      shouldUpdateRef.current = false;
      const shouldShow = formEnabledRef.current && 
                        !contactIdentifiedRef.current && 
                        !hasUserFormDataRef.current;
      setShowPreChatForm(shouldShow);
    }
  }, [showPreChatForm]);

  // Provide a manual way to hide the form
  const hidePreChatForm = useCallback(() => {
    console.log('Manually hiding pre-chat form');
    shouldUpdateRef.current = false; // Reset update flag to prevent conflicts
    setShowPreChatForm(false);
  }, []);

  return { 
    showPreChatForm, 
    hidePreChatForm
  };
}
