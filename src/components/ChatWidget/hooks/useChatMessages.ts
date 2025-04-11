
import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation, Ticket } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/storage';
import { useMessageActions } from './useMessageActions';
import { useRealTime } from './useRealTime';
import { createSystemMessage } from '../utils/messageHandlers';
import { markConversationAsRead } from '../utils/storage';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void,
  handleSelectTicket?: (ticket: Ticket) => void
) {
  // Initialize with conversation messages or a welcome message from config
  const getInitialMessages = (): Message[] => {
    if (conversation.messages?.length) {
      return conversation.messages;
    }

    // Use welcomeMessage from config if available, otherwise use default
    const welcomeMessage = config?.labels?.welcomeMessage ||
      config?.welcomeMessage ||
      'Hello! How can I help you today?';

    return [createSystemMessage(welcomeMessage)];
  };

  // Initialize with conversation messages or a welcome message
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [page, setPage] = useState(1);

  // Get session ID
  const sessionId = getChatSessionId();
  // Determine if this is a new conversation (no ticket ID)
  const isNewConversation = !conversation.id.includes('ticket-');

  // Create channel name based on conversation
  // For new conversations, use contactevent channel for the session
  // For existing conversations, use the conversation ID
  const chatChannelName = isNewConversation
    ? `widget:contactevent:${sessionId}`
    : `widget:conversation:${conversation.id}`;

  // Mark the conversation as read when opened
  useEffect(() => {
    if (conversation.id && conversation.unread) {
      markConversationAsRead(conversation.id)
        .catch(err => console.error('Failed to mark conversation as read:', err));
    }
  }, [conversation.id, conversation.unread]);

  // Use the real-time hook
  const {
    remoteIsTyping,
    readReceipts,
    handleTypingTimeout
  } = useRealTime(
    messages,
    setMessages,
    conversation,
    hasUserSentMessage,
    setIsTyping,
    config,
    playMessageSound
  );

  // Use the message actions hook
  const {
    messageText,
    setMessageText,
    handleSendMessage,
    handleUserTyping: baseHandleUserTyping,
    handleFileUpload,
    handleEndChat
  } = useMessageActions(
    messages,
    setMessages,
    chatChannelName,
    handleSelectTicket,
    sessionId,
    config,
    setHasUserSentMessage,
    setIsTyping
  );

  // Update conversation in parent component when messages change
  useEffect(() => {
    if (messages.length > 0 && onUpdateConversation) {
      const updatedConversation = {
        ...conversation,
        messages: messages,
        lastMessage: messages[messages.length - 1].text,
        timestamp: messages[messages.length - 1].createdAt,
        sessionId: sessionId,
        unread: false // Mark as read when we update the conversation
      };
      onUpdateConversation(updatedConversation);
    }
  }, [messages, conversation, onUpdateConversation, sessionId]);

  // Wrap the handleUserTyping function to also handle typing timeout
  const handleUserTyping = () => {
    baseHandleUserTyping();
    if (config?.interfaceSettings?.showAgentPresence) {
      handleTypingTimeout();
    }
  };

  // Function to load previous messages (for infinite scroll)
  const loadPreviousMessages = useCallback(async () => {
    // Simulate loading previous messages with a delay
    // In a real implementation, this would make an API call with pagination
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
        // In a real implementation, you would fetch more messages here
        // and prepend them to the messages array

        // For now, we'll just resolve the Promise
        resolve();
      }, 1000);
    });
  }, [page]);

  return {
    messages,
    messageText,
    setMessageText,
    isTyping,
    remoteIsTyping,
    hasUserSentMessage,
    handleSendMessage,
    handleUserTyping,
    handleFileUpload,
    handleEndChat,
    readReceipts,
    loadPreviousMessages
  };
}
