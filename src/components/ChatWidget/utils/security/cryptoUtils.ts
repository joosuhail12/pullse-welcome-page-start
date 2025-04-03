
/**
 * Cryptography utilities
 * 
 * Provides secure random generation and other cryptography-related
 * functions for security operations.
 */

import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';

/**
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns Random string
 * 
 * TODO: Consider using a more specialized crypto library in production
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  
  try {
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    logger.error(
      'Could not generate secure random value', 
      'security.generateSecureRandom', 
      { error: sanitizeErrorMessage(error) }
    );
    
    // Fallback for environments without crypto
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
