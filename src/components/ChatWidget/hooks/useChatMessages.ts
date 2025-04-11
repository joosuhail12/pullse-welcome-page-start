
import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { useMessageActions } from './useMessageActions';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';
import { useLoadMoreMessages } from './useLoadMoreMessages';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void
) {
  // Local state
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Determine channel names based on conversation ID
  const ticketId = conversation.ticketId || '';
  const channelName = conversation.id.includes('ticket-')
    ? `widget:conversation:${conversation.id}`
    : `widget:contactevent:${conversation.sessionId || ''}`;

  // Set up callback for when a ticket is created
  const handleTicketCreated = useCallback((newTicketId: string) => {
    if (onUpdateConversation && conversation) {
      onUpdateConversation({
        ...conversation,
        ticketId: newTicketId,
        id: `ticket-${newTicketId}`
      });
    }
  }, [conversation, onUpdateConversation]);

  // Use message actions hook
  const {
    messageText,
    setMessageText,
    isUploading,
    isCreatingTicket,
    setIsCreatingTicket,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat
  } = useMessageActions(
    messages,
    setMessages,
    channelName,
    conversation.sessionId || '',
    config,
    setHasUserSentMessage,
    setIsTyping
  );

  // Use real-time subscriptions
  const {
    remoteIsTyping,
    readReceipts,
    deliveredReceipts
  } = useRealtimeSubscriptions(
    conversation.id,
    conversation.sessionId || '',
    setMessages,
    config,
    playMessageSound,
    setIsCreatingTicket,
    handleTicketCreated
  );

  // Use load more messages hook
  const {
    loadPreviousMessages,
    isLoading: isLoadingMoreMessages
  } = useLoadMoreMessages(
    conversation.id,
    messages,
    setMessages
  );

  // Update parent component when messages change
  useEffect(() => {
    if (onUpdateConversation && messages !== conversation.messages) {
      onUpdateConversation({
        ...conversation,
        messages,
        lastMessage: messages[messages.length - 1]?.text || ''
      });
    }
  }, [messages, conversation, onUpdateConversation]);

  return {
    messages,
    messageText,
    setMessageText,
    isTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    remoteIsTyping,
    readReceipts,
    isCreatingTicket,
    loadPreviousMessages: ticketId ? loadPreviousMessages : undefined,
    isLoadingMoreMessages
  };
}
