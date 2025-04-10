
import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { isUserLoggedIn } from '../utils/storage';

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
  // Only show inline form if user is not logged in and conversation doesn't have contact identified
  const [showInlineForm, setShowInlineForm] = useState(
    !userFormData && !conversation.contactIdentified && !isUserLoggedIn() && !config.isLoggedIn
  );

  // Update form visibility when user data, contact status, or login state changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified || isUserLoggedIn() || config.isLoggedIn) {
      setShowInlineForm(false);
    }
  }, [userFormData, conversation.contactIdentified, config.isLoggedIn]);

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
