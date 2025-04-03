
import { MessageReadStatus } from '../types';

/**
 * Helper to convert string status to MessageReadStatus type
 */
export function ensureMessageReadStatus(status: string | MessageReadStatus): MessageReadStatus {
  const validStatuses: MessageReadStatus[] = ['sent', 'delivered', 'read', 'failed'];
  
  if (validStatuses.includes(status as MessageReadStatus)) {
    return status as MessageReadStatus;
  }
  
  return 'sent';
}

/**
 * Helper to convert Record<string, Date> to Record<string, { status: MessageReadStatus, timestamp?: Date }>
 */
export function convertToReadReceipts(receipts: Record<string, Date>): Record<string, { status: MessageReadStatus; timestamp?: Date }> {
  const formattedReceipts: Record<string, { status: MessageReadStatus; timestamp?: Date }> = {};
  
  Object.entries(receipts).forEach(([messageId, timestamp]) => {
    formattedReceipts[messageId] = {
      status: 'read',
      timestamp
    };
  });
  
  return formattedReceipts;
}

/**
 * Helper to ensure agent status includes all valid values
 */
export function validateAgentStatus(status?: string): 'online' | 'offline' | 'away' | 'busy' | undefined {
  if (!status) return undefined;
  
  const validStatuses = ['online', 'offline', 'away', 'busy'];
  if (validStatuses.includes(status)) {
    return status as 'online' | 'offline' | 'away' | 'busy';
  }
  
  return 'offline';
}
