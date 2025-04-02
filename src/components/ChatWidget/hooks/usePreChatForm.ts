
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
  // Initialize form visibility state just once using useState with a function
  const [showPreChatForm, setShowPreChatForm] = useState(() => {
    const shouldShow = config?.preChatForm?.enabled && 
                      !conversation.contactIdentified && 
                      !userFormData;
                      
    console.log('Initial pre-chat form state:', shouldShow);
    return shouldShow;
  });

  // Only update showPreChatForm when dependencies actually change - using refs to prevent 
  // unnecessary updates that could cause render loops
  useEffect(() => {
    const shouldShowForm = config?.preChatForm?.enabled && 
                          !conversation.contactIdentified && 
                          !userFormData;
    
    // Only update if the calculated state is different from current state
    if (shouldShowForm !== showPreChatForm) {
      console.log('Updating pre-chat form visibility:', { 
        from: showPreChatForm, 
        to: shouldShowForm,
        contactIdentified: conversation.contactIdentified,
        hasUserFormData: !!userFormData
      });
      setShowPreChatForm(shouldShowForm);
    }
  }, [userFormData, conversation.contactIdentified, config?.preChatForm?.enabled, showPreChatForm]);

  // Provide a manual way to hide the form that doesn't depend on effect
  const hidePreChatForm = useCallback(() => {
    console.log('Manually hiding pre-chat form');
    setShowPreChatForm(false);
  }, []);

  return { 
    showPreChatForm, 
    hidePreChatForm // Only expose the hide method, not the direct setter
  };
}
