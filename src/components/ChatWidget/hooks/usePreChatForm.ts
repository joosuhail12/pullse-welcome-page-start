
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
  // Calculate initial state once using a factory function
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

  // Update form visibility only when relevant props change, not when showPreChatForm changes
  useEffect(() => {
    const shouldShowForm = (config?.preChatForm?.enabled || false) && 
                        !(conversation.contactIdentified || false) && 
                        !userFormData;
    
    // Only update if the calculated value is different from current state
    if (shouldShowForm !== showPreChatForm) {
      console.log('Updating pre-chat form visibility:', { 
        from: showPreChatForm, 
        to: shouldShowForm,
        contactIdentified: conversation.contactIdentified,
        hasUserFormData: !!userFormData
      });
      
      // Update state in the next tick to avoid render cycles
      setTimeout(() => {
        setShowPreChatForm(shouldShowForm);
      }, 0);
    }
  }, [config?.preChatForm?.enabled, conversation.contactIdentified, userFormData]);
  // Importantly, we removed showPreChatForm from dependencies to break the cycle

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
