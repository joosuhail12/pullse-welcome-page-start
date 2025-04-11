
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageReadStatus } from '../types';
import { publishToChannel } from './ably/messaging';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from './events';

/**
 * Create a system message
 */
export function createSystemMessage(text: string, type: 'text' | 'status' = 'text'): Message {
  return {
    id: `sys-${uuidv4()}`,
    text,
    sender: 'system',
    createdAt: new Date(),
    type,
    status: 'sent'
  };
}

/**
 * Create a user message
 */
export function createUserMessage(text: string, type: 'text' | 'file' = 'text'): Message {
  return {
    id: `usr-${uuidv4()}`,
    text,
    sender: 'user',
    createdAt: new Date(),
    type,
    status: 'sending'
  };
}

/**
 * Create an agent message
 */
export function createAgentMessage(text: string, type: 'text' | 'file' = 'text'): Message {
  return {
    id: `agt-${uuidv4()}`,
    text,
    sender: 'agent',
    createdAt: new Date(),
    type,
    status: 'sent'
  };
}

/**
 * Process incoming system message
 * - Play sound
 * - Dispatch events
 * - Send read receipt
 */
export function processSystemMessage(
  message: Message,
  channelName: string | null,
  sessionId: string,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): void {
  // Play sound for new messages if enabled
  if (playMessageSound) {
    playMessageSound();
  }

  // Dispatch event for new messages
  dispatchChatEvent('message:received', {
    messageId: message.id,
    text: message.text,
    timestamp: message.createdAt
  });

  // Only send read receipt if enabled and channel exists
  if (config?.features?.readReceipts && channelName && sessionId) {
    sendReadReceipt(channelName, message.id, sessionId);
  }
}

/**
 * Process a status change for a message
 */
export function processMessageStatusChange(
  messageId: string,
  status: 'sent' | 'sending' | 'delivered' | 'read',
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): void {
  // Update message status
  setMessages(
    messages.map(msg =>
      msg.id === messageId
        ? { ...msg, status }
        : msg
    )
  );

  // Dispatch event for status change
  if (status === 'read') {
    dispatchChatEvent('message:read', { messageId });
  } else if (status === 'delivered') {
    dispatchChatEvent('message:delivered', { messageId });
  }
}

/**
 * Send a read receipt for a message
 */
export function sendReadReceipt(
  channelName: string,
  messageId: string,
  sessionId: string
): void {
  // Skip if any required parameter is missing
  if (!channelName || !messageId || !sessionId) {
    return;
  }

  // Send read receipt to the channel
  publishToChannel(channelName, 'read', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}

/**
 * Send a delivery receipt for a message
 */
export function sendDeliveryReceipt(
  channelName: string,
  messageId: string,
  sessionId: string
): void {
  // Skip if any required parameter is missing
  if (!channelName || !messageId || !sessionId) {
    return;
  }

  // Send delivery receipt to the channel
  publishToChannel(channelName, 'delivered', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}

/**
 * Format a message for display
 */
export function formatMessageText(text: string): string {
  // Replace URLs with clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}
