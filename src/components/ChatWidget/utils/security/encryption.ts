
/**
 * Encryption and Decryption utilities
 * 
 * Provides functions for data encryption and decryption,
 * delegating to secure server-side implementations in production.
 */

import { serverSideEncrypt, serverSideDecrypt } from '../../services/api';
import { logger } from '@/lib/logger';

/**
 * Client-side encryption placeholder - delegates to server-side encryption
 * @param data Data to encrypt
 * @returns Encrypted data from server, or placeholder
 * 
 * SECURITY NOTICE: Never implement encryption in client-side code for production.
 * This function should always delegate to a secure server-side implementation.
 */
export function encryptData(data: string): string {
  if (import.meta.env.DEV) {
    // For development only, return a mock encrypted value
    logger.debug('Using mock encryption in development mode', 'security.encryptData');
    return `SERVER_ENCRYPT:${btoa(data)}`;
  }
  
  // In production, we'll make an API call to encrypt server-side
  return serverSideEncrypt(data);
}

/**
 * Client-side decryption placeholder - delegates to server-side decryption
 * @param encryptedData Data to decrypt
 * @returns Decrypted data from server, or original if not encrypted
 * 
 * SECURITY NOTICE: Never implement decryption in client-side code for production.
 * This function should always delegate to a secure server-side implementation.
 */
export function decryptData(encryptedData: string): string {
  if (!encryptedData || !encryptedData.startsWith('SERVER_ENCRYPT:')) {
    return encryptedData;
  }
  
  if (import.meta.env.DEV) {
    // For development only, simulate decryption
    logger.debug('Using mock decryption in development mode', 'security.decryptData');
    try {
      return atob(encryptedData.substring(14));
    } catch (error) {
      logger.error(
        'Failed to process development data', 
        'security.decryptData', 
        { error: sanitizeErrorMessage(error) }
      );
      return '';
    }
  }
  
  // In production, we'll make an API call to decrypt server-side
  return serverSideDecrypt(encryptedData);
}

/**
 * Import necessary function for sanitizing error messages
 */
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
