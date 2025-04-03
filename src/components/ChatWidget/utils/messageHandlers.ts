
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageSender, MessageType } from '../types';
import { publishToChannel } from './ably';
import { logger } from '@/lib/logger';
import { SecurityEventType } from './security/types';
import { securityLogger } from './security';

/**
 * Create a message with the given parameters
 */
export const createMessage = (
  text: string, 
  sender: MessageSender,
  type: MessageType = 'text',
  metadata?: any
): Message => {
  return {
    id: uuidv4(),
    text,
    sender,
    timestamp: new Date(),
    type,
    metadata,
    reactions: []
  };
};

/**
 * Create a user message
 */
export const createUserMessage = (text: string, metadata?: any): Message => {
  return createMessage(text, 'user', 'text', metadata);
};

/**
 * Create a system message
 */
export const createSystemMessage = (text: string, metadata?: any): Message => {
  return createMessage(text, 'system', 'status', metadata);
};

/**
 * Process a system message
 */
export const processSystemMessage = (
  message: Message, 
  channelName: string, 
  sessionId: string,
  config?: any,
  playMessageSound?: () => void
) => {
  // Play sound for system messages if enabled
  if (config?.sounds?.enabled !== false && playMessageSound) {
    playMessageSound();
  }

  // Send read receipt for system messages
  sendReadReceipt(message.id, channelName, sessionId);

  // Log system messages
  logger.info(`System message received: ${message.text}`, 'MessageHandler');

  // Track security-related messages
  if (message.text.toLowerCase().includes('security') || 
      message.text.toLowerCase().includes('blocked') ||
      message.text.toLowerCase().includes('suspicious')) {
    securityLogger.logSecurityEvent(
      SecurityEventType.SECURITY_NOTIFICATION,
      'SUCCESS',
      { messageId: message.id, text: message.text },
      'MEDIUM'
    );
  }
};

/**
 * Send a typing indicator
 */
export const sendTypingIndicator = (
  isTyping: boolean, 
  channelName: string, 
  sessionId: string
) => {
  publishToChannel(channelName, 'typing', {
    status: isTyping ? 'start' : 'stop',
    userId: sessionId,
    timestamp: new Date()
  });

  logger.debug(
    `Typing indicator sent: ${isTyping ? 'start' : 'stop'}`, 
    'MessageHandler',
    { channelName, sessionId }
  );
};

/**
 * Send a delivery receipt
 */
export const sendDeliveryReceipt = (
  messageId: string, 
  channelName: string, 
  sessionId: string
) => {
  publishToChannel(channelName, 'delivered', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });

  logger.debug(
    `Delivery receipt sent for message: ${messageId}`, 
    'MessageHandler',
    { channelName, sessionId }
  );
};

/**
 * Send a read receipt
 */
export const sendReadReceipt = (
  messageId: string, 
  channelName: string, 
  sessionId: string
) => {
  publishToChannel(channelName, 'read', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });

  logger.debug(
    `Read receipt sent for message: ${messageId}`, 
    'MessageHandler',
    { channelName, sessionId }
  );
};

/**
 * Get a random response for simulation purposes
 */
export const getRandomResponse = (): string => {
  const responses = [
    "Thank you for your message. How else can I help you today?",
    "I understand. Let me check that for you.",
    "That's a good question. Let me find the answer for you.",
    "I appreciate your patience. I'm working on resolving that issue.",
    "Is there anything else you'd like to know about this topic?",
    "Thank you for providing that information. Let me process this for you.",
    "I'll need a bit more information to help you with this request.",
    "I'm happy to assist with that. Let me guide you through the process."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get a message by ID from an array of messages
 */
export const getMessage = (messageId: string, messages: Message[]): Message | undefined => {
  return messages.find(msg => msg.id === messageId);
};
