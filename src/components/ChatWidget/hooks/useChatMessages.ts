
import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useMessageActions } from './useMessageActions';
import { useRealTime } from './useRealTime';
import { createSystemMessage } from '../utils/messageHandlers';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void
) {
  // Initialize with conversation messages or a welcome message
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || [
      createSystemMessage('Hello! How can I help you today?')
    ]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingPreviousMessages, setIsLoadingPreviousMessages] = useState(false);
  
  // Get session ID
  const sessionId = getChatSessionId();
  // Create channel name based on conversation
  const chatChannelName = `conversation:${conversation.id}`;
  
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
        timestamp: messages[messages.length - 1].timestamp,
        sessionId: sessionId
      };
      onUpdateConversation(updatedConversation);
    }
  }, [messages, conversation, onUpdateConversation, sessionId]);

  // Wrap the handleUserTyping function to also handle typing timeout
  const handleUserTyping = () => {
    baseHandleUserTyping();
    if (config?.realtime?.enabled) {
      handleTypingTimeout();
    }
  };

  // Function to load previous messages (for infinite scroll)
  const loadPreviousMessages = useCallback(async () => {
    // Set loading state
    setIsLoadingPreviousMessages(true);
    
    try {
      console.log('Loading previous messages for page:', page + 1);
      
      // Simulate API call to fetch older messages
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // In a real implementation, this would be fetching from an API
          // Mock creating older messages for demonstration
          const oldMessages: Message[] = [];
          
          // In a real implementation, you would fetch these from an API
          // For demo purposes, we're generating mock older messages
          if (page < 5) { // Limit to 5 pages of history for demo
            for (let i = 0; i < 10; i++) {
              const timestamp = new Date();
              timestamp.setMinutes(timestamp.getMinutes() - (page * 10) - i);
              
              const mockMessage: Message = {
                id: `old-msg-${page}-${i}`,
                text: `This is an older message #${i} from page ${page + 1}`,
                sender: i % 2 === 0 ? 'user' : 'system',
                timestamp,
                type: 'text',
                status: 'read',
              };
              
              oldMessages.push(mockMessage);
            }
            
            // Add these older messages to the beginning of our messages array
            setMessages(prevMessages => [...oldMessages.reverse(), ...prevMessages]);
            setPage(prevPage => prevPage + 1);
          }
          
          resolve();
        }, 1000); // Simulate network delay
      });
    } catch (error) {
      console.error("Error loading previous messages:", error);
    } finally {
      setIsLoadingPreviousMessages(false);
    }
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
    loadPreviousMessages,
    isLoadingMore: isLoadingPreviousMessages
  };
}
