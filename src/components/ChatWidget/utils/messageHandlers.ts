
/**
 * Message handlers for the chat widget
 */
import { Message, MessageType, UserType } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Process system messages
 */
export function processSystemMessage(message: Message, channelName: string, sessionId: string, config: any, playMessageSound?: () => void): void {
  // Play sound for new messages
  if (playMessageSound) {
    playMessageSound();
  }

  // Additional message processing logic can be added here
}

/**
 * Send delivery receipt for a message
 */
export function sendDeliveryReceipt(messageId: string, channelName: string, sessionId: string): void {
  // Delivery receipt sending logic
}

/**
 * Get message by ID
 */
export function getMessage(messageId: string, messages: Message[]): Message | undefined {
  return messages.find(message => message.id === messageId);
}

/**
 * Create a system message
 */
export function createSystemMessage(text: string, type: MessageType = 'text', metadata?: Record<string, any>): Message {
  return {
    id: `system-${uuidv4()}`,
    text,
    sender: 'system',
    timestamp: new Date(),
    type,
    metadata
  };
}

/**
 * Create a user message
 */
export function createUserMessage(text: string, type: MessageType = 'text', metadata?: Record<string, any>): Message {
  return {
    id: `user-${uuidv4()}`,
    text,
    sender: 'user',
    timestamp: new Date(),
    type,
    metadata
  };
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(channelName: string, sessionId: string, state: 'start' | 'stop'): void {
  // Typing indicator logic
}

/**
 * Get random response for demo purposes
 */
export function getRandomResponse(): string {
  const responses = [
    "Thank you for your message. How can I help you further?",
    "I understand. Is there anything specific you'd like to know?",
    "That's interesting. Could you tell me more about your needs?",
    "I'm here to help. What other questions do you have?",
    "Thanks for sharing that information. How else can I assist you today?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
