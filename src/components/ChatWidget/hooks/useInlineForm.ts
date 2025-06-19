
import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { getChatSessionId, getAccessToken, isUserAuthenticated } from '../utils/storage';

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
  const accessToken = getAccessToken();
  const [showInlineForm, setShowInlineForm] = useState(
    // Check for accessToken and sessionId in local storage
    accessToken === null
  );

  const handleFormComplete = useCallback(async (formData: Record<string, string>) => {

    if (setUserFormData) {
      await setUserFormData(formData);
    }

    setShowInlineForm(false);

    if (onUpdateConversation) {
      onUpdateConversation({
        ...conversation,
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
