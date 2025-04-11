
import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useMessageActions } from './useMessageActions';
import { useRealTime } from './useRealTime';
import { createSystemMessage } from '../utils/messageHandlers';
import { markConversationAsRead } from '../utils/storage';
import { publishToChannel } from '../utils/ably/messaging';
import { getConversationChannelName, isNewConversation } from '../utils/conversationUtils';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void
) {
  // Initialize with conversation messages or a welcome message from config
  const [messages, setMessages] = useState<Message[]>(() => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages;
    } else {
      // Use welcome message from config or fallback
      const welcomeMessage = config?.welcomeMessage || 'Hello! How can I help you today?';
      return [createSystemMessage(welcomeMessage)];
    }
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [page, setPage] = useState(1);

  // Get session ID
  const sessionId = getChatSessionId();
  
  // Create channel name based on conversation using the utility function
  const chatChannelName = getConversationChannelName(conversation);
  
  // Flag to determine if this is a new conversation without a ticket
  const isNewConv = isNewConversation(conversation);

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

  // Wrap the original handleSendMessage to handle new conversation messages
  const sendMessageToContactEventChannel = useCallback((message: Message) => {
    if (isNewConv && sessionId) {
      // For new conversations, also send the message to contactevent channel
      const contactEventChannel = `widget:contactevent:${sessionId}`;
      
      publishToChannel(contactEventChannel, 'message', {
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.createdAt,
        type: message.type,
        status: message.status,
        conversationId: conversation.id
      });
      
      console.log(`Message sent to contact event channel ${contactEventChannel}:`, message.text);
    }
  }, [isNewConv, sessionId, conversation.id]);

  // Use the message actions hook
  const {
    messageText,
    setMessageText,
    handleSendMessage: originalHandleSendMessage,
    handleUserTyping: baseHandleUserTyping,
    handleFileUpload: originalHandleFileUpload,
    handleEndChat
  } = useMessageActions(
    messages,
    setMessages,
    chatChannelName,
    sessionId,
    config,
    setHasUserSentMessage,
    setIsTyping
  );

  // Wrap the original handleSendMessage
  const handleSendMessage = useCallback(() => {
    const result = originalHandleSendMessage();
    
    if (result && result.message) {
      // Send to contact event channel for new conversations
      sendMessageToContactEventChannel(result.message);
    }
    
    return result;
  }, [originalHandleSendMessage, sendMessageToContactEventChannel]);
  
  // Wrap the file upload function to handle the event and extract the file
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const result = originalHandleFileUpload(file);
      
      if (result && result.message) {
        // Send to contact event channel for new conversations
        sendMessageToContactEventChannel(result.message);
      }
      
      return result;
    }
    return { success: false };
  }, [originalHandleFileUpload, sendMessageToContactEventChannel]);

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
