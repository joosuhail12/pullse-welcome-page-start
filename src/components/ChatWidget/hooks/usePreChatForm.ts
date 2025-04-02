
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
  // Initial state depends on whether form is enabled and contact isn't identified yet
  const [showPreChatForm, setShowPreChatForm] = useState(() => {
    return config?.preChatForm?.enabled && 
           !conversation.contactIdentified && 
           !userFormData;
  });

  // Effect to update the showPreChatForm state when dependencies change
  useEffect(() => {
    const shouldShowForm = config?.preChatForm?.enabled && 
                         !conversation.contactIdentified && 
                         !userFormData;
                         
    setShowPreChatForm(shouldShowForm);
    
    // Debug log for form visibility state
    console.log('Pre-chat form visibility updated:', { 
      showPreChatForm: shouldShowForm,
      formEnabled: config?.preChatForm?.enabled,
      contactIdentified: conversation.contactIdentified,
      hasUserFormData: !!userFormData
    });
  }, [userFormData, conversation.contactIdentified, config?.preChatForm?.enabled]);

  return { showPreChatForm };
}
