/**
 * Utility for managing offline message queuing
 */
import { Message } from '../types';
import { encryptData, decryptData } from './security';
import { toast } from '@/hooks/use-toast';

// Storage key for offline message queue
const OFFLINE_QUEUE_KEY = 'pullse_chat_offline_queue';

// Queue message with conversation ID for later sending
export interface QueuedMessage {
  message: Message;
  channelName: string;
  eventType: string;
  timestamp: number;
  retryCount: number;
  status?: 'pending' | 'retrying' | 'failed';
}

/**
 * Add a message to the offline queue
 */
export function addMessageToQueue(
  message: Message, 
  channelName: string, 
  eventType: string = 'message'
): void {
  try {
    const queuedMessage: QueuedMessage = {
      message,
      channelName,
      eventType,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const queue = getMessageQueue();
    queue.push(queuedMessage);
    saveMessageQueue(queue);
    
    // Log the queue status
    console.log(`Message added to offline queue. Queue size: ${queue.length}`);
    
    // Notify the user visually that the message is queued
    if (queue.length === 1) {
      // Only show toast for first queued message to avoid spam
      // Fix: Use setTimeout to avoid re-render issues
      setTimeout(() => {
        toast.info("Message queued", "Will be sent automatically when connection is restored");
      }, 0);
    }
  } catch (error) {
    console.error('Error adding message to offline queue:', error);
  }
}

/**
 * Get all messages from the offline queue
 */
export function getMessageQueue(): QueuedMessage[] {
  try {
    const encryptedData = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!encryptedData) {
      return [];
    }

    const decryptedData = decryptData(encryptedData);
    if (!decryptedData) {
      return [];
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error getting message queue:', error);
    return [];
  }
}

/**
 * Save the message queue to localStorage
 */
export function saveMessageQueue(queue: QueuedMessage[]): void {
  try {
    const data = JSON.stringify(queue);
    const encryptedData = encryptData(data);
    localStorage.setItem(OFFLINE_QUEUE_KEY, encryptedData);
  } catch (error) {
    console.error('Error saving message queue:', error);
  }
}

/**
 * Remove a message from the queue
 */
export function removeMessageFromQueue(messageId: string): void {
  try {
    const queue = getMessageQueue();
    const updatedQueue = queue.filter(item => item.message.id !== messageId);
    saveMessageQueue(updatedQueue);
    
    // If queue is now empty and was previously not, show a toast
    if (queue.length > 0 && updatedQueue.length === 0) {
      // Fix: Use setTimeout to avoid re-render issues
      setTimeout(() => {
        toast.success("All messages sent", "Your queued messages have been delivered");
      }, 0);
    }
  } catch (error) {
    console.error('Error removing message from queue:', error);
  }
}

/**
 * Clear the entire message queue
 */
export function clearMessageQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    
    // Show a toast when queue is cleared manually
    // Fix: Use setTimeout to avoid re-render issues
    setTimeout(() => {
      toast.info("Queue cleared", "All pending messages have been removed");
    }, 0);
  } catch (error) {
    console.error('Error clearing message queue:', error);
  }
}

/**
 * Update retry count for a message
 */
export function incrementRetryCount(messageId: string): boolean {
  try {
    const queue = getMessageQueue();
    const messageIndex = queue.findIndex(item => item.message.id === messageId);
    
    if (messageIndex !== -1) {
      queue[messageIndex].retryCount += 1;
      queue[messageIndex].status = queue[messageIndex].retryCount > 3 ? 'failed' : 'retrying';
      saveMessageQueue(queue);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error incrementing retry count:', error);
    return false;
  }
}

/**
 * Get the number of pending messages in the queue
 */
export function getPendingMessageCount(): number {
  return getMessageQueue().length;
}

/**
 * Update message status in the queue
 */
export function updateMessageStatus(messageId: string, status: 'pending' | 'retrying' | 'failed'): boolean {
  try {
    const queue = getMessageQueue();
    const messageIndex = queue.findIndex(item => item.message.id === messageId);
    
    if (messageIndex !== -1) {
      queue[messageIndex].status = status;
      saveMessageQueue(queue);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating message status:', error);
    return false;
  }
}

/**
 * Get failed messages from the queue
 */
export function getFailedMessages(): QueuedMessage[] {
  try {
    const queue = getMessageQueue();
    return queue.filter(item => item.status === 'failed' || item.retryCount > 3);
  } catch (error) {
    console.error('Error getting failed messages:', error);
    return [];
  }
}
