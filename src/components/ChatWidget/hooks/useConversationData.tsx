
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Conversation, Message, MessageReadStatus } from '../types';
import { useInlineForm } from './useInlineForm';
import { useLoadMoreMessages } from './useLoadMoreMessages';
import { ChatWidgetConfig } from '../config';
import { dispatchValidatedEvent } from '../events';

export const useConversationData = (
  conversation: Conversation,
  config: ChatWidgetConfig,
  userFormData?: Record<string, any>,
  setUserFormData?: (data: Record<string, any>) => void
) => {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [reactionsMap, setReactionsMap] = useState<Record<string, 'thumbsUp' | 'thumbsDown'>>({});
  const [readReceipts, setReadReceipts] = useState<Record<string, { status: MessageReadStatus; timestamp?: Date }>>({});
  
  // Handle inline forms
  const inlineForm = useInlineForm(conversation, config);
  
  // Add inlineFormComponent to the returned object
  const inlineFormComponent = inlineForm.formType ? (
    <div className="inline-form-container">
      {/* Form component would be rendered here */}
      <p>Form: {inlineForm.formType}</p>
    </div>
  ) : null;
  
  // Dispatch event when inline form is displayed
  useEffect(() => {
    if (inlineForm.showInlineForm) {
      dispatchValidatedEvent('message:sent', {
        conversationId: conversation.id,
        formType: inlineForm.formType,
        formConfig: inlineForm.formConfig
      });
    }
  }, [inlineForm.showInlineForm, conversation.id, inlineForm.formType, inlineForm.formConfig]);
  
  // Update messages when conversation changes
  useEffect(() => {
    if (conversation && conversation.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);
  
  // Handle form data
  useEffect(() => {
    if (conversation && conversation.formData && setUserFormData) {
      setUserFormData(conversation.formData);
    }
  }, [conversation, setUserFormData]);
  
  // Handle message reactions
  const handleMessageReaction = useCallback((messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    setReactionsMap(prev => ({
      ...prev,
      [messageId]: reaction
    }));
    
    // Dispatch event for message reaction
    dispatchValidatedEvent('message:reaction', {
      conversationId: conversation.id,
      messageId,
      reaction
    });
  }, [conversation.id]);
  
  // Load more messages functionality
  const { 
    hasMoreMessages, 
    isLoadingMore, 
    loadMoreMessages 
  } = useLoadMoreMessages(conversation.id, messages, setMessages);
  
  // Message reactions object
  const messageReactions = useMemo(() => ({
    reactionsMap,
    handleMessageReaction,
    onMessageReaction: handleMessageReaction
  }), [reactionsMap, handleMessageReaction]);
  
  return {
    messages,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    showInlineForm: inlineForm.showInlineForm,
    inlineFormComponent,
    messageReactions,
    readReceipts,
    addMessage: (message: Message) => {
      setMessages(prev => [...prev, message]);
    },
    inlineForm
  };
};
