
import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { isUserAuthenticated } from '../utils/storage';

/**
 * Hook for managing pre-chat form state and interactions
 */
export function useInlineForm(
  conversation: Conversation,
  config: ChatWidgetConfig,
  userFormData?: Record<string, string>,
  setUserFormData?: (data: Record<string, string>) => void,
  onUpdateConversation?: (updatedConversation: Conversation) => void
) {
  // Check if conversation already has contact identified or user form data exists
  const [showInlineForm, setShowInlineForm] = useState(
    !userFormData && !conversation.contactIdentified && !config.contact && !isUserAuthenticated()
  );

  // Update form visibility when user data, contact status, or config contact changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified || config.contact || isUserAuthenticated()) {
      setShowInlineForm(false);
    }
  }, [userFormData, conversation.contactIdentified, config.contact]);

  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    setShowInlineForm(false);

    if (setUserFormData) {
      setUserFormData(formData);
    }

    if (onUpdateConversation) {
      onUpdateConversation({
        ...conversation,
        contactIdentified: true
      });
    }

    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, onUpdateConversation, conversation, config]);

  return {
    showInlineForm,
    setShowInlineForm,
    handleFormComplete
  };
}
