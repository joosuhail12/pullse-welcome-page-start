
import { getChatSessionId } from './cookies';
import CryptoJS from 'crypto-js';

// Store rate limiting data in memory
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10;     // 10 messages per minute

/**
 * Check if the current request exceeds rate limits
 * @returns True if rate limit is exceeded, false otherwise
 */
export function isRateLimited(): boolean {
  const sessionId = getChatSessionId();
  if (!sessionId) return false; // No session, can't rate limit
  
  const now = Date.now();
  
  // Initialize or reset expired entry
  if (!rateLimitStore[sessionId] || rateLimitStore[sessionId].resetTime < now) {
    rateLimitStore[sessionId] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    };
  }
  
  // Increment the counter
  rateLimitStore[sessionId].count++;
  
  // Check if limit is exceeded
  return rateLimitStore[sessionId].count > MAX_REQUESTS_PER_WINDOW;
}

/**
 * Generate a CSRF token based on the session ID
 * @returns CSRF token string
 */
export function generateCsrfToken(): string {
  const sessionId = getChatSessionId();
  if (!sessionId) return '';
  
  // Secret should ideally be stored securely on the server
  // For client-side demo purposes only
  const clientSecret = 'chat-widget-csrf-protection';
  
  // Generate token using HMAC with SHA-256
  return CryptoJS.HmacSHA256(sessionId, clientSecret).toString();
}

/**
 * Verify if the provided CSRF token is valid
 * @param token The token to verify
 * @returns True if token is valid, false otherwise
 */
export function verifyCsrfToken(token: string): boolean {
  return token === generateCsrfToken();
}

// Encryption key (in a real app, this would be securely managed)
const ENCRYPTION_KEY = 'chat-widget-encryption-key-2025';

/**
 * Encrypt sensitive data
 * @param data The data to encrypt
 * @returns Encrypted string
 */
export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt encrypted data
 * @param encryptedData The encrypted data to decrypt
 * @returns Decrypted string or empty if decryption fails
 */
export function decryptData(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt data', error);
    return '';
  }
}
