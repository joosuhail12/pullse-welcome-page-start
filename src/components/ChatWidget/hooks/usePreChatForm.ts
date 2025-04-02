
import { useState, useEffect, useCallback } from 'react';
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
  // Calculate initial state once
  const [showPreChatForm, setShowPreChatForm] = useState(() => {
    const shouldShow = (config?.preChatForm?.enabled || false) && 
                      !(conversation.contactIdentified || false) && 
                      !userFormData;
                      
    console.log('Initial pre-chat form state:', shouldShow, {
      formEnabled: config?.preChatForm?.enabled || false,
      contactIdentified: conversation.contactIdentified || false,
      hasUserFormData: !!userFormData
    });
    return shouldShow;
  });

  // Update form visibility when dependencies change, but not when the state itself changes
  useEffect(() => {
    const shouldShowForm = (config?.preChatForm?.enabled || false) && 
                        !(conversation.contactIdentified || false) && 
                        !userFormData;
    
    // Only update if needed
    if (shouldShowForm !== showPreChatForm) {
      console.log('Updating pre-chat form visibility:', { 
        from: showPreChatForm, 
        to: shouldShowForm,
        contactIdentified: conversation.contactIdentified,
        hasUserFormData: !!userFormData
      });
      
      setShowPreChatForm(shouldShowForm);
    }
  // Importantly, we DON'T include showPreChatForm in deps
  }, [config?.preChatForm?.enabled, conversation.contactIdentified, userFormData]);

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
