
/**
 * Message signing utilities for security
 */

import { logger } from '@/lib/logger';

/**
 * Sign a message with the workspace ID and timestamp
 * @param workspaceId The workspace ID
 * @param timestamp Current timestamp
 * @returns Signature string
 */
export function signMessage(workspaceId: string, timestamp: number): string {
  try {
    // In a real implementation, this would use a proper HMAC
    // For now, we'll use a simple concatenation-based approach
    const message = `${workspaceId}:${timestamp}:${getSecretKey()}`;
    
    // Create base64 hash (in a real implementation, this would use crypto)
    return btoa(message).replace(/=/g, '').substring(0, 32);
  } catch (error) {
    logger.error('Error signing message', 'security.signing', error);
    return '';
  }
}

/**
 * Verify a message signature
 * @param signature The signature to verify
 * @param workspaceId The workspace ID
 * @param timestamp Timestamp when the message was signed
 * @param expirationMs Expiration time in milliseconds (default: 5 minutes)
 * @returns True if signature is valid, false otherwise
 */
export function verifySignature(
  signature: string,
  workspaceId: string,
  timestamp: number,
  expirationMs: number = 300000 // 5 minutes
): boolean {
  // Check if the timestamp is within the expiration window
  const now = Date.now();
  if (now - timestamp > expirationMs) {
    logger.warn('Signature expired', 'security.signing', {
      age: now - timestamp,
      maxAge: expirationMs
    });
    return false;
  }
  
  // Generate expected signature
  const expectedSignature = signMessage(workspaceId, timestamp);
  
  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(signature, expectedSignature);
}

/**
 * Get the secret key (in a real implementation, this would be securely stored)
 */
function getSecretKey(): string {
  // In a real implementation, this would fetch from environment variables
  // or a secure key management system
  return 'secure-signing-key-placeholder';
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns True if strings are identical
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
