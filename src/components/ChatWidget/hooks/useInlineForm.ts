
import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';

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
  console.log(conversation, userFormData, config)
  const [showInlineForm, setShowInlineForm] = useState(
    !userFormData && !conversation.contactIdentified
  );

  // Update form visibility when user data or contact status changes
  useEffect(() => {
    if (userFormData || conversation.contactIdentified) {
      setShowInlineForm(false);
    }
  }, [userFormData, conversation.contactIdentified]);

  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    setShowInlineForm(false);

    if (setUserFormData) {
      setUserFormData(formData);
    }

    // TODO: create a contact here!
    // if (onUpdateConversation) {
    //   onUpdateConversation({
    //     ...conversation,
    //     contactIdentified: true
    //   });
    // }

    dispatchChatEvent('contact:formCompleted', { formData }, config);
  }, [setUserFormData, onUpdateConversation, conversation, config]);

  return {
    showInlineForm,
    setShowInlineForm,
    handleFormComplete
  };
}
