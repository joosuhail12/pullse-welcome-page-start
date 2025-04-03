
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType, MessageSender } from '../types';
import { publishToChannel } from './ably';
import { dispatchChatEvent } from './events';

/**
 * Create a message with standard properties
 */
export const createMessage = (messageProps: Partial<Message> & { text: string; sender: MessageSender }): Message => {
  const now = new Date();
  
  return {
    id: messageProps.id || `msg-${uuidv4()}`,
    text: messageProps.text,
    sender: messageProps.sender,
    timestamp: messageProps.timestamp || now,
    type: messageProps.type || 'text',
    status: messageProps.status || 'sent',
    reactions: messageProps.reactions || [],
    metadata: messageProps.metadata || {},
    // Optional fields
    fileName: messageProps.fileName,
    fileUrl: messageProps.fileUrl,
    cardData: messageProps.cardData,
    quickReplies: messageProps.quickReplies
  };
};

/**
 * Create a user message
 */
export const createUserMessage = (text: string, type: MessageType = 'text', fileDetails?: { fileName: string; fileUrl: string }): Message => {
  return createMessage({
    text,
    sender: 'user',
    type,
    ...(fileDetails && { fileName: fileDetails.fileName, fileUrl: fileDetails.fileUrl })
  });
};

/**
 * Create a system message
 */
export const createSystemMessage = (text: string, type: MessageType = 'text'): Message => {
  return createMessage({
    text,
    sender: 'system',
    type
  });
};

/**
 * Process system message (handle notifications, etc)
 */
export const processSystemMessage = (
  message: Message, 
  channelName: string, 
  sessionId: string
): void => {
  // Play sound notification if enabled
  const audio = new Audio('/message-notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.warn('Could not play notification sound', e));
  
  // Dispatch message received event
  dispatchChatEvent('chat:messageReceived', { message });
};

/**
 * Send typing indicator to the channel
 */
export const sendTypingIndicator = (
  channelName: string, 
  userId: string, 
  action: 'start' | 'stop'
): void => {
  publishToChannel(channelName, 'typing', {
    userId,
    action,
    timestamp: new Date()
  });
};

/**
 * Send delivery receipt
 */
export const sendDeliveryReceipt = (
  channelName: string,
  messageId: string,
  userId: string
): void => {
  publishToChannel(channelName, 'receipt', {
    messageId,
    userId,
    status: 'delivered',
    timestamp: new Date()
  });
};

/**
 * Get a random agent response (for simulating conversations)
 */
export const getRandomResponse = (): string => {
  const responses = [
    "How can I assist you further with that?",
    "Is there anything else you'd like to know about this topic?",
    "I'm here to help if you have more questions.",
    "Would you like me to elaborate on any specific aspect?",
    "Let me know if you need additional information on this.",
    "Is there something else I can help you with today?",
    "Please feel free to ask if you have any other questions.",
    "Is there another topic you'd like to discuss?",
    "How else can I be of assistance today?",
    "Do you need help with anything else?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get message by ID from a conversation
 */
export const getMessage = (messages: Message[], messageId: string): Message | undefined => {
  return messages.find(message => message.id === messageId);
};

export default {
  createMessage,
  createUserMessage,
  createSystemMessage,
  processSystemMessage,
  sendTypingIndicator,
  sendDeliveryReceipt,
  getRandomResponse,
  getMessage
};
