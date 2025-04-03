
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageReadStatus } from '../types';
import { dispatchChatEvent } from './events';
import { ChatWidgetConfig } from '../config';
import { publishToChannel } from './ably';

/**
 * Create a message from the user
 */
export function createUserMessage(text: string, type: 'text' | 'file' = 'text', metadata?: Record<string, any>): Message {
  return {
    id: `msg-${Date.now()}-${uuidv4()}`,
    text,
    sender: 'user',
    timestamp: new Date(),
    type,
    metadata,
    status: 'sent'
  };
}

/**
 * Create a message from the system/bot
 */
export function createSystemMessage(text: string, type: 'text' | 'card' | 'quick_reply' = 'text', metadata?: Record<string, any>): Message {
  return {
    id: `msg-${Date.now()}-${uuidv4()}`,
    text,
    sender: 'system',
    timestamp: new Date(),
    type,
    metadata,
    status: 'delivered'
  };
}

/**
 * Send a typing indicator to the channel
 */
export function sendTypingIndicator(
  channelName: string, 
  userId: string, 
  status: 'start' | 'stop'
): void {
  publishToChannel(channelName, 'typing', {
    userId,
    status,
    timestamp: new Date()
  });
}

/**
 * Process a system message (notifications, delivery receipts, etc)
 */
export function processSystemMessage(
  message: Message, 
  channelName: string, 
  sessionId: string, 
  config?: ChatWidgetConfig,
  playSound?: () => void
): void {
  // Play sound if provided
  if (playSound) {
    playSound();
  }

  // Send delivery receipt
  sendDeliveryReceipt(channelName, sessionId, message.id);

  // Dispatch message received event
  if (config) {
    dispatchChatEvent('chat:messageReceived', { message }, config);
  }
}

/**
 * Send a delivery receipt
 */
export function sendDeliveryReceipt(channelName: string, sessionId: string, messageId: string): void {
  publishToChannel(channelName, 'delivered', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}

/**
 * Mark a message as read
 */
export function markMessageAsRead(channelName: string, sessionId: string, messageId: string): void {
  publishToChannel(channelName, 'read', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}

/**
 * Get formatted read status text
 */
export function getReadStatusText(status: MessageReadStatus, timestamp?: Date): string {
  switch (status) {
    case 'read':
      return timestamp ? `Read at ${formatTime(timestamp)}` : 'Read';
    case 'delivered':
      return timestamp ? `Delivered at ${formatTime(timestamp)}` : 'Delivered';
    case 'sent':
    default:
      return timestamp ? `Sent at ${formatTime(timestamp)}` : 'Sent';
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
