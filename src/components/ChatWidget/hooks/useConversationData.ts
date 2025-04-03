
import { useEffect, useState, useMemo } from 'react';
import { Conversation, Message } from '../types';
import { dispatchChatEvent } from '../utils/events';
import { useInlineForm } from './useInlineForm';

interface ConversationDataResult {
  messages: Message[];
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  loadMoreMessages: () => Promise<void>;
  showInlineForm: boolean;
  inlineFormComponent: React.ReactNode;
  messageReactions: {
    onMessageReaction: (messageId: string, reaction: string) => void;
  };
  readReceipts: Record<string, { status: 'sent' | 'delivered' | 'read'; timestamp?: Date }>;
}

export const useConversationData = (
  conversation: Conversation,
  config: any,
  userFormData?: Record<string, any>,
  setUserFormData?: (data: Record<string, any>) => void
): ConversationDataResult => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reactionsMap, setReactionsMap] = useState<Record<string, 'thumbsUp' | 'thumbsDown'>>({});
  
  const { 
    showInlineForm, 
    setShowInlineForm, 
    handleFormComplete,
    formType,
    formConfig
  } = useInlineForm(conversation);

  const messages = useMemo(() => conversation?.messages || [], [conversation?.messages]);

  // Generate inline form component when needed
  const inlineFormComponent = useMemo(() => {
    if (!showInlineForm) return null;
    
    // Dispatch event when form is displayed
    dispatchChatEvent('chat:inlineFormDisplayed', { formType });
    
    // Return appropriate form based on formType
    if (formType === 'contact') {
      return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          {/* Contact form would be implemented here */}
        </div>
      );
    }
    
    return null;
  }, [showInlineForm, formType, formConfig]);

  // Handle form auto-display based on conversation state
  useEffect(() => {
    if (!conversation.contactIdentified && !conversation.formData && !userFormData) {
      setShowInlineForm(true);
    }
  }, [conversation.contactIdentified, conversation.formData, userFormData]);

  // Handle message reactions
  const handleMessageReaction = (messageId: string, reaction: 'thumbsUp' | 'thumbsDown') => {
    setReactionsMap(prev => ({
      ...prev,
      [messageId]: reaction
    }));

    // Dispatch reaction event
    dispatchChatEvent('chat:messageReaction', {
      messageId,
      reaction,
      conversationId: conversation.id
    });
  };

  // Mock loading more messages
  const loadMoreMessages = async () => {
    setIsLoadingMore(true);
    
    try {
      // Simulate API call to load more messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch messages from an API
      // and add them to the conversation
      
    } finally {
      setIsLoadingMore(false);
    }
  };

  const messageReactions = useMemo(() => ({
    onMessageReaction: handleMessageReaction
  }), [conversation.id]);

  // Mock read receipts
  const readReceipts = useMemo(() => {
    const receipts: Record<string, { status: 'sent' | 'delivered' | 'read'; timestamp?: Date }> = {};
    
    messages.forEach(message => {
      if (message.sender === 'user') {
        receipts[message.id] = {
          status: message.status || 'sent',
          timestamp: new Date(message.timestamp.getTime() + 1000)
        };
      }
    });
    
    return receipts;
  }, [messages]);

  return {
    messages,
    hasMoreMessages: false, // Set to true if there are more messages to load
    isLoadingMore,
    loadMoreMessages,
    showInlineForm,
    inlineFormComponent,
    messageReactions,
    readReceipts
  };
};
