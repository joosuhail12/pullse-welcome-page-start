
/**
 * Utility functions for cryptographic operations
 */
import CryptoJS from 'crypto-js';
import { securityLogger } from '@/lib/security/securityLogger';
import { SecurityEventType } from '@/lib/security/securityTypes';

// Secret key for local operations - in production this should come from environment variables
const CRYPTO_SECRET = 'chat-widget-local-key-2023';

/**
 * Generates a cryptographically secure random string
 */
export const generateRandomToken = (length = 32): string => {
  const randomBytes = CryptoJS.lib.WordArray.random(length);
  return CryptoJS.enc.Base64.stringify(randomBytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Signs a message with HMAC
 */
export const signMessage = (message: string, key = CRYPTO_SECRET): string => {
  try {
    const hmac = CryptoJS.HmacSHA256(message, key);
    return CryptoJS.enc.Base64.stringify(hmac);
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CRYPTO_OPERATION_FAILED,
      'FAILURE',
      { operation: 'signMessage', error: (error as Error).message },
      'HIGH'
    );
    throw new Error('Message signing failed');
  }
};

/**
 * Verifies a message signature
 */
export const verifySignature = (message: string, signature: string, key = CRYPTO_SECRET): boolean => {
  try {
    const computedHmac = signMessage(message, key);
    return computedHmac === signature;
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CRYPTO_OPERATION_FAILED,
      'FAILURE',
      { operation: 'verifySignature', error: (error as Error).message },
      'HIGH'
    );
    return false;
  }
};

/**
 * Encrypts a string using AES
 */
export const encryptString = (plaintext: string, key = CRYPTO_SECRET): string => {
  try {
    return CryptoJS.AES.encrypt(plaintext, key).toString();
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CRYPTO_OPERATION_FAILED,
      'FAILURE',
      { operation: 'encryptString', error: (error as Error).message },
      'HIGH'
    );
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypts an AES encrypted string
 */
export const decryptString = (ciphertext: string, key = CRYPTO_SECRET): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CRYPTO_OPERATION_FAILED,
      'FAILURE',
      { operation: 'decryptString', error: (error as Error).message },
      'HIGH'
    );
    throw new Error('Decryption failed');
  }
};

/**
 * Hashes a string using SHA-256
 */
export const hashString = (input: string): string => {
  try {
    return CryptoJS.SHA256(input).toString();
  } catch (error) {
    securityLogger.logSecurityEvent(
      SecurityEventType.CRYPTO_OPERATION_FAILED,
      'FAILURE',
      { operation: 'hashString', error: (error as Error).message },
      'HIGH'
    );
    throw new Error('Hashing failed');
  }
};

/**
 * Export utility functions
 */
export default {
  generateRandomToken,
  signMessage,
  verifySignature,
  encryptString,
  decryptString,
  hashString
};
