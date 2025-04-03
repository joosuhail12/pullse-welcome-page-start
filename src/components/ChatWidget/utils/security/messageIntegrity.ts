
/**
 * Message Integrity utilities
 * 
 * Provides functions for signing and verifying messages
 * to ensure data integrity across the system.
 */

import { getChatSessionId } from '../cookies';
import { logger } from '@/lib/logger';
import { 
  signMessageServerSide, 
  verifySignatureServerSide 
} from '../serverSideAuth';

/**
 * Generate a signature string for message integrity validation
 * Delegates to server-side implementation in production
 * @param message The message to sign
 * @param timestamp Timestamp when the message was created
 * @returns Signature for the message
 * 
 * SECURITY NOTICE: Client-side signatures provide minimal security.
 * Production code should use server-side signing with proper key management.
 */
export function signMessage(message: string, timestamp: number): string {
  const sessionId = getChatSessionId() || '';
  
  if (import.meta.env.DEV) {
    // For development only, return a mock signature
    logger.debug('Using mock signature in development mode', 'security.signMessage');
    return `SERVER_SIGN:${sessionId}:${timestamp}:${message.length}`;
  }
  
  // In production, we'll make an API call to sign server-side
  return signMessageServerSide(message, timestamp);
}

/**
 * Verify message signature to ensure data integrity
 * Delegates to server-side implementation in production
 * @param message Original message
 * @param timestamp Original timestamp
 * @param signature Signature to verify
 * @returns True if signature is valid, false otherwise
 * 
 * SECURITY NOTICE: Client-side verification is insecure and easily bypassed.
 * Production code should use server-side verification with proper key management.
 */
export function verifyMessageSignature(message: string, timestamp: number, signature: string): boolean {
  if (import.meta.env.DEV) {
    // For development only, simulate verification
    const expectedSignature = signMessage(message, timestamp);
    logger.debug('Using mock signature verification in development mode', 'security.verifyMessageSignature');
    return signature === expectedSignature;
  }
  
  // In production, we'll make an API call to verify server-side
  return verifySignatureServerSide(message, timestamp, signature);
}
