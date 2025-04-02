
import { useState, useEffect } from 'react';
import { Message, Conversation } from '../types';
import { ChatWidgetConfig } from '../config';
import { getChatSessionId } from '../utils/cookies';
import { useMessageActions } from './useMessageActions';
import { useRealTime } from './useRealTime';

export function useChatMessages(
  conversation: Conversation,
  config?: ChatWidgetConfig,
  onUpdateConversation?: (updatedConversation: Conversation) => void,
  playMessageSound?: () => void
) {
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages || [
      {
        id: 'msg-1',
        text: 'Hello! How can I help you today?',
        sender: 'system',
        timestamp: new Date(),
        type: 'text'
      }
    ]
  );
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  
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
    readReceipts
  };
}
