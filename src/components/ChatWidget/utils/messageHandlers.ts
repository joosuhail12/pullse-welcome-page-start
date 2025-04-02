
import { Message } from '../types';
import { publishToChannel, getConnectionState } from './ably';
import { dispatchChatEvent } from './events';
import { ChatWidgetConfig } from '../config';
import { addMessageToQueue } from './offlineQueue';
import { saveOfflineMessage } from './storage';
import { toast } from '@/components/ui/use-toast';

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
    }).catch(err => {
      console.error('Error sending read receipt:', err);
      // Queue read receipt for when connection is restored
      const readReceipt = {
        id: `read-${messageId}`,
        messageId,
        userId: sessionId,
        timestamp: new Date(),
        type: 'status'
      };
      addMessageToQueue(readReceipt as any, chatChannelName, 'read');
    });
  } else {
    // Queue read receipt for when connection is restored
    const readReceipt = {
      id: `read-${messageId}`,
      messageId,
      userId: sessionId,
      timestamp: new Date(),
      type: 'status'
    };
    addMessageToQueue(readReceipt as any, chatChannelName, 'read');
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
    }).catch(err => {
      console.error('Error sending delivery receipt:', err);
      // Queue delivery receipt for when connection is restored
      const deliveryReceipt = {
        id: `delivery-${messageId}`,
        messageId,
        userId: sessionId,
        timestamp: new Date(),
        type: 'status'
      };
      addMessageToQueue(deliveryReceipt as any, chatChannelName, 'delivered');
    });
  } else {
    // Queue delivery receipt for when connection is restored
    const deliveryReceipt = {
      id: `delivery-${messageId}`,
      messageId,
      userId: sessionId,
      timestamp: new Date(),
      type: 'status'
    };
    addMessageToQueue(deliveryReceipt as any, chatChannelName, 'delivered');
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
  
  // Optimistically update message status to delivered
  const updatedMessage = { ...message, status: 'delivered' };
  
  // Update message status to delivered
  if (config?.features?.readReceipts) {
    // Check if we're online before sending receipts
    if (getConnectionState() === 'connected') {
      // Send delivered receipt immediately
      sendDeliveryReceipt(chatChannelName, message.id, sessionId);
      
      // Send read receipt after a short delay if the document is visible
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          sendReadReceipt(chatChannelName, message.id, sessionId);
          
          // Optimistically update message status to read in UI
          updatedMessage.status = 'read';
        }, 2000);
      }
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
  saveOfflineMessage(conversationId, updatedMessage);
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
    // We don't queue typing indicators when offline - not worth it
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
      .catch(err => {
        console.error('Error sending message reaction:', err);
        // Queue reaction for when connection is restored
        addMessageToQueue(reactionData as any, chatChannelName, 'reaction');
        
        // Show toast notification
        toast({
          title: "Reaction queued",
          description: "Your reaction will be sent when you're back online",
        });
      });
  } else {
    // Queue reaction for when connection is restored
    addMessageToQueue(reactionData as any, chatChannelName, 'reaction');
    
    // Show toast notification
    toast({
      title: "Reaction queued",
      description: "Your reaction will be sent when you're back online",
    });
  }
};

/**
 * Create optimistic response for offline mode
 */
export const createOptimisticResponse = (messageType: string): Message => {
  let responseText = '';
  
  switch (messageType) {
    case 'message':
      responseText = 'Your message has been queued and will be delivered when you\'re back online.';
      break;
    case 'file':
      responseText = 'Your file has been queued and will be processed when you\'re back online.';
      break;
    case 'reaction':
      responseText = 'Your reaction has been queued and will be sent when you\'re back online.';
      break;
    default:
      responseText = 'Your action has been queued for when you\'re back online.';
  }
  
  const optimisticMessage = createSystemMessage(responseText);
  optimisticMessage.status = 'pending';
  return optimisticMessage;
};
