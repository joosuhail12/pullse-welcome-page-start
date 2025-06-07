
import { v4 as uuidv4 } from 'uuid';
import { Message, MessageReadReceipt, MessageReadStatus } from '../types';
import { publishToChannel } from './ably';
import { dispatchChatEvent } from './events';
import { ChatWidgetConfig } from '../config';
import { toast } from '@/components/ui/use-toast';
import DOMPurify from 'dompurify';

/**
 * Create a user message
 * @param text Message text
 * @param type Message type (text, file, etc.)
 * @param metadata Optional metadata for the message
 */
export function createUserMessage(
  text: string,
  type: 'text' | 'file' | 'card' = 'text',
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-${uuidv4().slice(0, 8)}`,
    text: DOMPurify.sanitize(text),
    sender: 'user',
    createdAt: now,
    timestamp: now,
    type,
    status: 'sent',
    ...(metadata && { metadata })
  };
}

/**
 * Create a system message
 * @param text Message text
 * @param type Message type (text, file, etc.)
 * @param metadata Optional metadata for the message
 */
export function createSystemMessage(
  text: string,
  type: 'text' | 'file' | 'card' | 'quick_reply' = 'text',
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-system-${uuidv4().slice(0, 8)}`,
    text: DOMPurify.sanitize(text),
    sender: 'system',
    createdAt: now,
    timestamp: now,
    type,
    status: 'sent',
    ...(metadata && { metadata })
  };
}

export function createMessage(
  text: string,
  sender: 'user' | 'agent' | 'system',
  type: 'text' | 'file' | 'card' | 'quick_reply' = 'text',
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-${uuidv4().slice(0, 8)}`,
    text: DOMPurify.sanitize(text),
    sender,
    createdAt: now,
    timestamp: now,
    type,
  }
}

/*Create agent message */
export function createAgentMessage(
  text: string,
  type: 'text' | 'file' | 'card' | 'quick_reply' = 'text',
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-agent-${uuidv4().slice(0, 8)}`,
    text: DOMPurify.sanitize(text),
    sender: 'agent',
    createdAt: now,
    timestamp: now,
  };
}

/**
 * Send typing indicator to a channel
 * @param channelName Channel name
 * @param userId User ID
 * @param status 'start' or 'stop'
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
 * Process a system message
 * @param message The message to process
 * @param channelName Optional channel name for real-time updates
 * @param sessionId Optional session ID
 * @param config Optional widget configuration
 */
export function processSystemMessage(
  message: Message,
  channelName?: string,
  sessionId?: string,
  config?: ChatWidgetConfig
): void {
  // Show toast notification for system messages if enabled
  if (config?.features?.notifications) {
    toast({
      title: "New message",
      description: message.text,
      duration: 4000
    });
  }

  // Dispatch event for the message
  dispatchChatEvent('chat:messageReceived', { message }, config);

  // Publish to real-time channel if provided
  if (channelName && sessionId && config?.realtime) {
    publishToChannel(channelName, 'message', {
      id: message.id,
      text: message.text,
      sender: message.sender,
      timestamp: message.createdAt,
      type: message.type
    });
  }
}

/**
 * Mark a message as read
 * @param messageId The ID of the message to mark as read
 * @param status The new status of the message
 * @param setReadReceipts Function to update read receipts
 */
export function markMessageAsRead(
  messageId: string,
  status: MessageReadStatus,
  setReadReceipts: React.Dispatch<React.SetStateAction<Record<string, MessageReadReceipt>>>
): void {
  setReadReceipts(prevReceipts => ({
    ...prevReceipts,
    [messageId]: {
      status,
      timestamp: new Date()
    }
  }));
}

/**
 * Send delivery receipt
 * This is a stub function that will be implemented later
 */
export function sendDeliveryReceipt(): void {
  // This function will be implemented later
  console.log("Delivery receipt functionality not yet implemented");
}
