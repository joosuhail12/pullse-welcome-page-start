
import { useState, useEffect } from 'react';
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
  // Check if pre-chat form should be shown based on config and conversation state
  const [showPreChatForm, setShowPreChatForm] = useState(
    config?.preChatForm?.enabled && !conversation.contactIdentified && !userFormData
  );

  // Effect to update the showPreChatForm state when userFormData changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified) {
      setShowPreChatForm(false);
    } else if (config?.preChatForm?.enabled && !conversation.contactIdentified) {
      // Ensure form shows when conditions are met
      setShowPreChatForm(true);
    }
  }, [userFormData, conversation.contactIdentified, config?.preChatForm?.enabled]);

  // Debug log for form visibility state
  useEffect(() => {
    console.log('Pre-chat form visibility:', { 
      showPreChatForm,
      formEnabled: config?.preChatForm?.enabled,
      contactIdentified: conversation.contactIdentified,
      hasUserFormData: !!userFormData
    });
  }, [showPreChatForm, config?.preChatForm?.enabled, conversation.contactIdentified, userFormData]);

  return { showPreChatForm };
}
