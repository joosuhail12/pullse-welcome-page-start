
/**
 * Message handling utilities
 */
import { Message, MessageType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

/**
 * Create a user message
 * @param text Message text
 * @param metadata Optional metadata
 * @returns Message object
 */
export const createUserMessage = (text: string, metadata?: Record<string, any>): Message => {
  const message: Message = {
    id: uuidv4(),
    text,
    sender: 'user',
    timestamp: new Date(),
    type: 'text',
    metadata
  };
  
  logger.debug('Created user message', 'messageHandlers', { messageId: message.id });
  return message;
};

/**
 * Create a system message
 * @param text Message text
 * @param metadata Optional metadata
 * @returns Message object
 */
export const createSystemMessage = (text: string, metadata?: Record<string, any>): Message => {
  const message: Message = {
    id: uuidv4(),
    text,
    sender: 'system',
    timestamp: new Date(),
    type: 'status',
    metadata
  };
  
  logger.debug('Created system message', 'messageHandlers', { messageId: message.id });
  return message;
};

/**
 * Create an agent/bot message
 * @param text Message text
 * @param isAgent Whether the sender is an agent (true) or bot (false)
 * @param metadata Optional metadata
 * @returns Message object
 */
export const createAgentMessage = (text: string, isAgent = false, metadata?: Record<string, any>): Message => {
  const message: Message = {
    id: uuidv4(),
    text,
    sender: isAgent ? 'agent' : 'bot',
    timestamp: new Date(),
    type: 'text',
    metadata
  };
  
  logger.debug('Created agent/bot message', 'messageHandlers', { messageId: message.id, isAgent });
  return message;
};

/**
 * Create a message with a specific type
 * @param text Message text
 * @param sender Message sender
 * @param type Message type
 * @param metadata Optional metadata
 * @returns Message object
 */
export const createTypedMessage = (
  text: string,
  sender: 'user' | 'bot' | 'agent' | 'system',
  type: MessageType,
  metadata?: Record<string, any>
): Message => {
  const message: Message = {
    id: uuidv4(),
    text,
    sender,
    timestamp: new Date(),
    type,
    metadata
  };
  
  logger.debug('Created typed message', 'messageHandlers', { messageId: message.id, sender, type });
  return message;
};

/**
 * Get a message by ID from a list of messages
 * @param messages Message list
 * @param messageId ID of the message to find
 * @returns The message if found, undefined otherwise
 */
export const getMessage = (messages: Message[], messageId: string): Message | undefined => {
  return messages.find(msg => msg.id === messageId);
};

/**
 * Send typing indicator (simulated)
 * @param conversationId Conversation ID
 * @param isTyping Whether typing is active
 * @returns Promise resolving when the typing indicator is sent
 */
export const sendTypingIndicator = async (conversationId: string, isTyping: boolean): Promise<void> => {
  // In a real implementation, this would send the typing status to the server
  logger.debug('Sending typing indicator', 'messageHandlers', { conversationId, isTyping });
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate a network request
};

/**
 * Generate random responses for testing (simulated agent typing)
 * @returns Random response text
 */
export const getRandomResponse = (): string => {
  const responses = [
    "That's an interesting point. Let me look into that for you.",
    "Thank you for your patience. I'm checking our system now.",
    "I understand your concern. Let me see what we can do to help.",
    "That's a great question. Here's what I found for you.",
    "I appreciate your feedback. Let me share that with our team.",
    "I'm happy to assist with that request."
  ];
  
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};
