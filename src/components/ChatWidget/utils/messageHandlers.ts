
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType, MessageSender } from '../types';
import { sanitizeInput } from './validation';

/**
 * Creates a new message object with the specified text and sender
 */
export const createMessage = (
  text: string,
  sender: MessageSender,
  type: MessageType = 'text',
  metadata?: Record<string, any>
): Message => {
  return {
    id: uuidv4(),
    text: sanitizeInput(text),
    sender,
    timestamp: new Date(),
    type,
    metadata,
  };
};

/**
 * Get message object by ID from the API or fallback
 */
export const getMessage = async (messageId: string): Promise<Message | null> => {
  try {
    // In a real implementation, this would fetch from API
    // For now, we'll just return a mock message
    return {
      id: messageId,
      text: 'Message content not available',
      sender: 'system',
      timestamp: new Date(),
      type: 'text'
    };
  } catch (error) {
    console.error('Failed to fetch message:', error);
    return null;
  }
};

/**
 * Process system message with templating
 */
export const processSystemMessage = (template: string, data: Record<string, any>): string => {
  let processed = template;
  
  // Simple template replacement
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(placeholder, String(value));
  });
  
  return processed;
};

/**
 * Send a message delivery receipt
 */
export const sendDeliveryReceipt = async (messageId: string, status: 'delivered' | 'read'): Promise<boolean> => {
  try {
    // In a real implementation, this would send to API
    console.log(`Sending ${status} receipt for message ${messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send delivery receipt:', error);
    return false;
  }
};

/**
 * Get random response for simulation purposes
 */
export const getRandomResponse = (messages: string[]): string => {
  if (!messages.length) {
    return "I'm not sure how to respond to that.";
  }
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Format message for display
 */
export const formatMessageForDisplay = (message: Message): Message => {
  // Apply any formatting rules needed
  return {
    ...message,
    text: message.text || ''
  };
};
