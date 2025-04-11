
import { Conversation } from '../types';

/**
 * Get the correct conversation channel name for Ably
 * @param conversation The conversation object
 * @returns The formatted channel name or null if it's a new conversation
 */
export function getConversationChannelName(conversation: Conversation): string | null {
  // For new conversations (without a ticket ID), return null
  if (!conversation.ticketId) {
    return null;
  }
  
  // Return properly formatted channel name with widget: prefix
  return `widget:conversation:${conversation.ticketId}`;
}

/**
 * Check if this is a new conversation without a ticket ID
 * @param conversation The conversation object
 * @returns True if this is a new conversation
 */
export function isNewConversation(conversation: Conversation): boolean {
  return !conversation.ticketId;
}

/**
 * Get session-specific channels with the widget: prefix
 * @param sessionId The session ID
 * @returns Array of channel names
 */
export function getSessionChannels(sessionId: string | null): string[] {
  if (!sessionId) {
    return [];
  }
  
  return [
    `widget:events:${sessionId}`,
    `widget:notifications:${sessionId}`,
    `widget:contactevent:${sessionId}`
  ];
}
