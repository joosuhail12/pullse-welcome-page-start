
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
  // Initialize form visibility state just once - don't update it automatically
  const [showPreChatForm, setShowPreChatForm] = useState(() => {
    const shouldShow = config?.preChatForm?.enabled && 
                      !conversation.contactIdentified && 
                      !userFormData;
                      
    console.log('Initial pre-chat form state:', shouldShow);
    return shouldShow;
  });

  // Use this effect to log state changes but not update state directly
  useEffect(() => {
    console.log('Pre-chat form dependencies changed:', { 
      formEnabled: config?.preChatForm?.enabled,
      contactIdentified: conversation.contactIdentified,
      hasUserFormData: !!userFormData,
      currentlyShowing: showPreChatForm
    });
  }, [userFormData, conversation.contactIdentified, config?.preChatForm?.enabled, showPreChatForm]);

  // Provide a manual way to hide the form that doesn't depend on effect
  const hidePreChatForm = useCallback(() => {
    console.log('Manually hiding pre-chat form');
    setShowPreChatForm(false);
  }, []);

  return { 
    showPreChatForm, 
    setShowPreChatForm, // Expose setter for explicit control
    hidePreChatForm // Convenience method to hide the form
  };
}
