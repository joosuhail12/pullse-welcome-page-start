
import { Message } from '../types';
import { ChatWidgetConfig } from '../config';
import { publishToChannel } from './ably';

/**
 * Process system message by sending a read receipt, playing sound, etc.
 * @param message System message to process
 * @param chatChannelName Channel to send read receipt to
 * @param sessionId Session ID of the current user
 * @param config Chat widget configuration
 * @param playMessageSound Function to play message sound
 */
export function processSystemMessage(
  message: Message,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig,
  playMessageSound?: () => void
): void {
  // Play message sound if available
  if (playMessageSound) {
    playMessageSound();
  }
  
  // Send read receipt
  sendReadReceipt(message.id, chatChannelName, sessionId, config);
}

/**
 * Send a read receipt for a message
 * @param messageId Message ID
 * @param chatChannelName Channel to send receipt to
 * @param sessionId Session ID of the current user
 * @param config Chat widget configuration
 */
export function sendReadReceipt(
  messageId: string,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig
): void {
  if (!config?.realtime?.enabled) {
    return;
  }
  
  publishToChannel(chatChannelName, 'read', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}

/**
 * Send a delivery receipt for a message
 * @param messageId Message ID
 * @param chatChannelName Channel to send receipt to
 * @param sessionId Session ID of the current user
 * @param config Chat widget configuration
 */
export function sendDeliveryReceipt(
  messageId: string,
  chatChannelName: string,
  sessionId: string,
  config?: ChatWidgetConfig
): void {
  if (!config?.realtime?.enabled) {
    return;
  }
  
  publishToChannel(chatChannelName, 'delivered', {
    messageId,
    userId: sessionId,
    timestamp: new Date()
  });
}
