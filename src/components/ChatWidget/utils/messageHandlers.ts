
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { publishToChannel } from './ably';
import { dispatchChatEvent } from './events';
import { debounce } from '../utils/debounce';

// Create and return a user message
export function createUserMessage(
  text: string,
  type: 'text' | 'file' | 'card' = 'text',
  metadata?: Record<string, any>
): Message {
  return {
    id: uuidv4(),
    text,
    sender: 'user',
    createdAt: new Date(),
    type,
    status: 'sent',
    ...(metadata && { metadata })
  };
}

// Create and return a system message
export function createSystemMessage(
  text: string,
  type: 'text' | 'status' = 'text'
): Message {
  return {
    id: uuidv4(),
    text,
    sender: 'system',
    createdAt: new Date(),
    type,
    status: 'sent'
  };
}

// Create and return an agent message
export function createAgentMessage(
  text: string,
  type: 'text' | 'file' | 'card' | 'quickReply' = 'text',
  metadata?: Record<string, any>
): Message {
  return {
    id: uuidv4(),
    text,
    sender: 'agent',
    createdAt: new Date(),
    type,
    status: 'sent',
    ...(metadata && { metadata })
  };
}

// Process system messages with special handling
export function processSystemMessage(
  message: Message,
  channelName: string,
  sessionId: string,
  config?: ChatWidgetConfig
): void {
  // Play notification sound if enabled
  if (config?.features?.notifications) {
    const audio = new Audio('/message-notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('Could not play notification sound:', err);
    });
  }

  // Dispatch message received event
  dispatchChatEvent('chat:messageReceived', { message }, config);
  
  // Mark message as read
  publishToChannel(channelName, 'read', {
    messageId: message.id,
    userId: sessionId,
    timestamp: new Date()
  });
}

// Create a debounced function for typing indicator
const debouncedSendTypingStop = debounce((channelName: string, sessionId: string) => {
  publishToChannel(channelName, 'typing', {
    status: 'stop',
    userId: sessionId,
    timestamp: new Date()
  });
}, 1000);

// Send typing indicator with debouncing for stop events
export function sendTypingIndicator(
  channelName: string,
  sessionId: string,
  status: 'start' | 'stop'
): void {
  if (!channelName || !sessionId) return;
  
  if (status === 'start') {
    // Cancel any pending stop events when starting typing
    debouncedSendTypingStop.cancel();
    
    // Immediately publish start typing
    publishToChannel(channelName, 'typing', {
      status: 'start',
      userId: sessionId,
      timestamp: new Date()
    });
  } else {
    // Debounce stop typing events to prevent rapid toggling
    debouncedSendTypingStop(channelName, sessionId);
  }
}
