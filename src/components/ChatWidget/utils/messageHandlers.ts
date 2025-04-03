
import { Message } from '../types';
import { publishToChannel } from './ably';
import { dispatchChatEvent } from './events';
import { ChatWidgetConfig } from '../config';

/**
 * Handles sending a read receipt for a message
 */
export const sendReadReceipt = (
  chatChannelName: string,
  messageId: string,
  sessionId: string
): void => {
  publishToChannel(chatChannelName, 'read', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
};

/**
 * Handles sending a delivery receipt for a message
 */
export const sendDeliveryReceipt = (
  chatChannelName: string,
  messageId: string,
  sessionId: string
): void => {
  publishToChannel(chatChannelName, 'delivered', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
};

/**
 * Creates a system response message
 */
export const createSystemMessage = (text: string): Message => {
  return {
    id: `msg-${Date.now()}-system`,
    text,
    sender: 'system',
    timestamp: new Date(),
    type: 'text',
    status: 'sent'
  };
};

/**
 * Creates a user message
 */
export const createUserMessage = (text: string, type: 'text' | 'file' = 'text', fileData?: {
  fileName: string;
  fileUrl: string;
}): Message => {
  return {
    id: `msg-${Date.now()}-user${type === 'file' ? '-file' : ''}`,
    text,
    sender: 'user',
    timestamp: new Date(),
    type,
    status: 'sent',
    ...(fileData && {
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl
    })
  };
};

/**
 * Get a random response message for non-realtime mode
 */
export const getRandomResponse = (): string => {
  const responses = [
    "Thank you for your message. Is there anything else I can help with?",
    "I appreciate your inquiry. Let me know if you need further assistance.",
    "I've made a note of your request. Is there any other information you'd like to provide?",
    "Thanks for sharing that information. Do you have any other questions?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Process system message and handle side effects
 */
export const processSystemMessage = (
  message: Message,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): void => {
  // Play sound notification if provided and chat is not visible
  if (playMessageSound && document.visibilityState !== 'visible') {
    playMessageSound();
  }
  
  // Dispatch message received event
  dispatchChatEvent('chat:messageReceived', { message }, config);
  
  // Update message status to delivered
  if (config?.features?.readReceipts) {
    // Send delivered receipt immediately
    sendDeliveryReceipt(chatChannelName, message.id, sessionId);
    
    // Send read receipt after a short delay
    setTimeout(() => {
      sendReadReceipt(chatChannelName, message.id, sessionId);
    }, 2000);
  }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (
  chatChannelName: string,
  sessionId: string,
  status: 'start' | 'stop'
): void => {
  publishToChannel(chatChannelName, 'typing', {
    status,
    userId: sessionId
  });
};

/**
 * Send message reaction
 */
export const sendMessageReaction = (
  chatChannelName: string,
  messageId: string,
  sessionId: string,
  reaction: 'thumbsUp' | 'thumbsDown' | null
): void => {
  publishToChannel(chatChannelName, 'reaction', {
    messageId,
    reaction,
    userId: sessionId,
    timestamp: new Date()
  });
};
