
import { useState, useEffect, useMemo } from 'react';
import { Conversation, Message, MessageReadStatus } from '../types';
import { useInlineForm } from './useInlineForm';
import { useMessageReactions } from './useMessageReactions';

interface ConversationDataReturn {
  messages: Message[];
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  loadMoreMessages: () => Promise<void>;
  showInlineForm: boolean;
  inlineFormComponent: JSX.Element | null;
  messageReactions: {
    onMessageReaction: (messageId: string, reaction: string) => void;
  };
  readReceipts: Record<string, { status: MessageReadStatus; timestamp?: Date }>;
}

export const useConversationData = (
  conversation: Conversation,
  config: any,
  userFormData?: Record<string, any>,
  setUserFormData?: (data: Record<string, any>) => void
): ConversationDataReturn => {
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, { status: MessageReadStatus; timestamp?: Date }>>({});
  
  // Initialize inline form handling
  const { showInlineForm, inlineFormComponent } = useInlineForm(
    conversation, 
    config, 
    userFormData, 
    setUserFormData
  );
  
  // Initialize message reactions
  const messageReactions = useMessageReactions(conversation, messages, setMessages);
  
  // Update messages when conversation changes
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation]);
  
  // Mock function to load more messages
  const loadMoreMessages = async (): Promise<void> => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    try {
      setIsLoadingMore(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch older messages
      // For now, we'll just pretend we tried but there are no more
      setHasMoreMessages(false);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Generate read receipts for messages
  useEffect(() => {
    const receipts: Record<string, { status: MessageReadStatus; timestamp?: Date }> = {};
    
    // In a real implementation, this would come from the backend
    // For now, we'll generate random statuses for demo purposes
    messages.forEach(message => {
      if (message.sender === 'user') {
        const randomStatus = Math.random() > 0.5 ? 'read' : 'delivered';
        receipts[message.id] = {
          status: randomStatus as MessageReadStatus,
          timestamp: randomStatus === 'read' ? new Date(Date.now() - 60000) : undefined
        };
      }
    });
    
    setReadReceipts(receipts);
  }, [messages]);
  
  return {
    messages,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    showInlineForm,
    inlineFormComponent,
    messageReactions,
    readReceipts
  };
};
