
import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation } from '../types';
import { useWidgetConfig } from './useWidgetConfig';
import { dispatchChatEvent } from '../utils/events';
import { createMessage } from '../utils/messageHandlers';

export const useConversationData = (
  conversation: Conversation,
  setConversation: React.Dispatch<React.SetStateAction<Conversation>>,
  workspaceId: string
) => {
  const { config } = useWidgetConfig(workspaceId);
  const [inlineFormState, setInlineFormState] = useState<{
    showInlineForm: boolean;
    formType?: string;
    formConfig?: Record<string, any>;
  }>({
    showInlineForm: false
  });
  
  // Message reactions state
  const [reactionsMap, setReactionsMap] = useState<Record<string, "thumbsUp" | "thumbsDown">>({});

  // Handle inline form display
  const handleShowInlineForm = useCallback((formType: string, formConfig?: Record<string, any>) => {
    setInlineFormState({
      showInlineForm: true,
      formType,
      formConfig
    });
    
    // Dispatch event for inline form display
    dispatchChatEvent('chat:inlineFormDisplayed', { 
      formType, 
      formConfig 
    }, config);
  }, [config]);
  
  // Handle form completion
  const handleFormComplete = useCallback((formData: Record<string, string>) => {
    setInlineFormState({ showInlineForm: false });
    
    // Update conversation with form data
    setConversation(prev => ({
      ...prev,
      contactIdentified: true,
      formData: {
        ...(prev.formData || {}),
        ...formData
      }
    }));
    
    // Add system message acknowledging form completion
    const message = createMessage({
      id: `msg-${Date.now()}`,
      text: 'Thank you for providing your information.',
      sender: 'system',
      timestamp: new Date(),
      type: 'status'
    });
    
    addMessage(message);
    
    // Dispatch event for form submission
    dispatchChatEvent('chat:formSubmitted', { 
      formData,
      conversationId: conversation.id
    }, config);
  }, [conversation.id, config, setConversation]);
  
  // Add a message to the conversation
  const addMessage = useCallback((message: Message) => {
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: message.text,
      lastMessageTimestamp: message.timestamp
    }));
    
    // Dispatch message event
    dispatchChatEvent(
      message.sender === 'user' ? 'chat:messageSent' : 'chat:messageReceived',
      { message }, 
      config
    );
  }, [config, setConversation]);
  
  // Handle message reaction
  const handleMessageReaction = useCallback((messageId: string, reaction: "thumbsUp" | "thumbsDown") => {
    setReactionsMap(prev => ({
      ...prev,
      [messageId]: reaction
    }));
    
    // Dispatch event for message reaction
    dispatchChatEvent('chat:messageReaction', { 
      messageId, 
      reaction,
      conversationId: conversation.id
    }, config);
  }, [conversation.id, config]);
  
  return {
    // Inline form state and handlers
    inlineForm: {
      showInlineForm: inlineFormState.showInlineForm,
      setShowInlineForm: (show: boolean) => setInlineFormState(prev => ({ ...prev, showInlineForm: show })),
      handleFormComplete,
      formType: inlineFormState.formType,
      formConfig: inlineFormState.formConfig,
    },
    
    // Message handling
    addMessage,
    
    // Message reactions
    reactionsMap,
    handleMessageReaction,
    
    // Additional handlers that might be needed
    onMessageReaction: handleMessageReaction
  };
};

export default useConversationData;
