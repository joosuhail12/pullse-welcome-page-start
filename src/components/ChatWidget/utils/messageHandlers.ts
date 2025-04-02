
import { Message } from '../types';
import { publishToChannel, getConnectionState } from './ably';
import { dispatchChatEvent } from './events';
import { ChatWidgetConfig } from '../config';
import { addMessageToQueue } from './offlineQueue';
import { saveOfflineMessage } from './storage';

/**
 * Handles sending a read receipt for a message
 */
export const sendReadReceipt = (
  chatChannelName: string,
  messageId: string,
  sessionId: string
): void => {
  // Check connection before sending
  if (getConnectionState() === 'connected') {
    publishToChannel(chatChannelName, 'read', {
      messageId,
      userId: sessionId,
      timestamp: new Date()
    }).catch(err => console.error('Error sending read receipt:', err));
  }
};

/**
 * Handles sending a delivery receipt for a message
 */
export const sendDeliveryReceipt = (
  chatChannelName: string,
  messageId: string,
  sessionId: string
): void => {
  // Check connection before sending
  if (getConnectionState() === 'connected') {
    publishToChannel(chatChannelName, 'delivered', {
      messageId,
      userId: sessionId,
      timestamp: new Date()
    }).catch(err => console.error('Error sending delivery receipt:', err));
  }
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
    // Check if we're online before sending receipts
    if (getConnectionState() === 'connected') {
      // Send delivered receipt immediately
      sendDeliveryReceipt(chatChannelName, message.id, sessionId);
      
      // Send read receipt after a short delay
      setTimeout(() => {
        sendReadReceipt(chatChannelName, message.id, sessionId);
      }, 2000);
    } else {
      // Queue read receipts for later
      const deliveryReceipt = {
        id: `delivery-${message.id}`,
        messageId: message.id,
        userId: sessionId,
        timestamp: new Date(),
        type: 'status'
      };
      
      const readReceipt = {
        id: `read-${message.id}`,
        messageId: message.id,
        userId: sessionId,
        timestamp: new Date(),
        type: 'status'
      };
      
      addMessageToQueue(deliveryReceipt as any, chatChannelName, 'delivered');
      addMessageToQueue(readReceipt as any, chatChannelName, 'read');
    }
  }
  
  // Store message for offline persistence
  const conversationId = chatChannelName.replace('conversation:', '');
  saveOfflineMessage(conversationId, message);
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (
  chatChannelName: string,
  sessionId: string,
  status: 'start' | 'stop'
): void => {
  // Only send if connected
  if (getConnectionState() === 'connected') {
    publishToChannel(chatChannelName, 'typing', {
      status,
      userId: sessionId
    }).catch(err => console.error('Error sending typing indicator:', err));
  }
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
  const reactionData = {
    messageId,
    reaction,
    userId: sessionId,
    timestamp: new Date()
  };

  // Check if connected before sending
  if (getConnectionState() === 'connected') {
    publishToChannel(chatChannelName, 'reaction', reactionData)
      .catch(err => console.error('Error sending message reaction:', err));
  } else {
    // Queue reaction for when connection is restored
    addMessageToQueue(reactionData as any, chatChannelName, 'reaction');
  }
};
