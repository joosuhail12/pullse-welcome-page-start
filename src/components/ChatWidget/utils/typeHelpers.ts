
import { MessageReadStatus, Message } from '../types';

/**
 * Type guard for MessageReadStatus
 */
export function isValidReadStatus(status: string): status is MessageReadStatus {
  return ['sent', 'delivered', 'read'].includes(status);
}

/**
 * Safely convert string to MessageReadStatus type
 */
export function toMessageReadStatus(status: string): MessageReadStatus {
  if (isValidReadStatus(status)) {
    return status as MessageReadStatus;
  }
  return 'sent';  // Default to sent for invalid statuses
}

/**
 * Type guard for Message object
 */
export function isMessage(obj: any): obj is Message {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'text' in obj &&
    'sender' in obj &&
    'timestamp' in obj
  );
}
