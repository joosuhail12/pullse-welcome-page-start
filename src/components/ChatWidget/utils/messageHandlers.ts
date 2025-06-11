import { v4 as uuidv4 } from 'uuid';
import { Message, MessageReadReceipt, MessageReadStatus, DataCollectionField } from '../types';
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
  metadata?: Record<string, any>,
  messageId: string | null = null
): Message {
  const now = new Date();
  return {
    id: messageId,
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

/**
 * Create a data collection message
 * @param title Title of the form
 * @param description Optional description
 * @param fields Array of form fields
 * @param metadata Optional metadata for the message
 */
export function createDataCollectionMessage(
  title: string,
  description?: string,
  fields: DataCollectionField[] = [],
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-datacollection-${uuidv4().slice(0, 8)}`,
    text: title,
    sender: 'agent',
    senderType: 'agent',
    messageType: 'data_collection',
    messageConfig: {
      title,
      description,
      fields
    },
    createdAt: now,
    timestamp: now,
    type: 'data_collection',
    status: 'sent',
    ...(metadata && { metadata })
  };
}

/**
 * Create a CSAT message
 * @param title Title of the CSAT form
 * @param question CSAT question
 * @param ratingScale Rating scale type
 * @param followUpQuestion Optional follow-up question
 * @param metadata Optional metadata for the message
 */
export function createCSATMessage(
  title: string,
  question: string,
  ratingScale: '1-5 Stars' | '1-10 Scale' | 'Emoji Scale',
  followUpQuestion?: string,
  followUpOptional: boolean = true,
  metadata?: Record<string, any>
): Message {
  const now = new Date();
  return {
    id: `msg-${now.getTime()}-csat-${uuidv4().slice(0, 8)}`,
    text: title,
    sender: 'agent',
    senderType: 'agent',
    messageType: 'csat',
    messageConfig: {
      title,
      question,
      ratingScale,
      followUpQuestion,
      followUpOptional
    },
    createdAt: now,
    timestamp: now,
    type: 'data_collection',
    status: 'sent',
    ...(metadata && { metadata })
  };
}

export function createMessage(
  id: string,
  text: string,
  senderType: 'user' | 'agent' | 'system',
  type: 'text' | 'file' | 'card' | 'quick_reply' = 'text',
  messageConfig?: Record<string, any>,
  messageType?: 'text' | 'data_collection' | 'action_buttons' | 'csat' | 'mention' | 'note'
): Message {
  const now = new Date();
  return {
    id: id,
    text: DOMPurify.sanitize(text),
    sender: senderType,
    createdAt: now,
    timestamp: now,
    type,
    messageType: messageType,
    messageConfig: messageConfig
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
