
/**
 * Chat Widget Security API Service
 * 
 * Provides secure encryption and decryption services with
 * built-in resilience and circuit breaking.
 * 
 * SECURITY NOTICE: Handles encryption/decryption with server-side operations
 * and includes fallbacks for development environments.
 */

import { SECURITY_CIRCUIT, createSecureHeaders, handleApiError, verifyResponseIntegrity, validateJsonResponse } from './apiCore';
import { withResilience, isCircuitOpen } from '../utils/resilience';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { requiresServerImplementation } from '../utils/serverSideAuth';

/**
 * Server-side encryption API call
 * @param data Data to encrypt
 * @returns Encrypted data or placeholder in development
 * 
 * TODO: Implement proper encryption with key rotation
 * TODO: Add additional input validation for encryption requests
 * TODO: Consider using Web Crypto API where available
 */
export async function serverSideEncrypt(data: string): Promise<string> {
  try {
    // Check if circuit is open
    if (isCircuitOpen(SECURITY_CIRCUIT)) {
      logger.warn('Security API circuit is open, using fallback', 'securityApi.serverSideEncrypt');
      return `SERVER_ENCRYPT:${btoa(data)}`;
    }
    
    // Development fallback
    if (import.meta.env.DEV) {
      return `SERVER_ENCRYPT:${btoa(data)}`;
    }
    
    return await withResilience(
      async () => {
        const headers = createSecureHeaders(data);
        
        const response = await fetch('/api/chat-widget/encrypt', {
          method: 'POST',
          headers,
          body: JSON.stringify({ data })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        validateJsonResponse(response);
        const result = await response.json();
        
        // Verify response integrity
        if (!verifyResponseIntegrity(response, result)) {
          logger.error('Response signature verification failed', 'securityApi.serverSideEncrypt');
          throw new Error('Response integrity check failed');
        }
        
        return result.encryptedData;
      },
      SECURITY_CIRCUIT,
      // Security API retry options
      {
        maxRetries: 1,
        initialDelayMs: 200,
        maxDelayMs: 500
      }
    );
  } catch (error) {
    logger.error(
      'Server-side encryption failed', 
      'securityApi.serverSideEncrypt', 
      { error: sanitizeErrorMessage(error) }
    );
    
    // Fallback for failures
    return requiresServerImplementation('encrypt', { dataLength: data.length });
  }
}

/**
 * Server-side decryption API call
 * @param encryptedData Data to decrypt
 * @returns Decrypted data or original if not encrypted
 * 
 * TODO: Add additional validation of decrypted data
 * TODO: Implement key versioning for seamless key rotation
 */
export async function serverSideDecrypt(encryptedData: string): Promise<string> {
  // If not encrypted data, return as is
  if (!encryptedData || !encryptedData.startsWith('SERVER_ENCRYPT:')) {
    return encryptedData;
  }
  
  try {
    // Check if circuit is open
    if (isCircuitOpen(SECURITY_CIRCUIT)) {
      logger.warn('Security API circuit is open, using fallback', 'securityApi.serverSideDecrypt');
      // For development fallback only
      return atob(encryptedData.substring(14));
    }
    
    // Development fallback
    if (import.meta.env.DEV) {
      return atob(encryptedData.substring(14));
    }
    
    return await withResilience(
      async () => {
        const headers = createSecureHeaders(encryptedData);
        
        const response = await fetch('/api/chat-widget/decrypt', {
          method: 'POST',
          headers,
          body: JSON.stringify({ encryptedData })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        validateJsonResponse(response);
        const result = await response.json();
        
        // Verify response integrity
        if (!verifyResponseIntegrity(response, result)) {
          logger.error('Response signature verification failed', 'securityApi.serverSideDecrypt');
          throw new Error('Response integrity check failed');
        }
        
        return result.decryptedData;
      },
      SECURITY_CIRCUIT,
      // Security API retry options
      {
        maxRetries: 1,
        initialDelayMs: 200,
        maxDelayMs: 500
      }
    );
  } catch (error) {
    logger.error(
      'Server-side decryption failed', 
      'securityApi.serverSideDecrypt', 
      { error: sanitizeErrorMessage(error) }
    );
    
    // Return original encrypted data on failure
    return encryptedData;
  }
}
