
import { getChatSessionId, invalidateSession, refreshSessionExpiry } from './cookies';

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
 * Simple hash function for generating CSRF tokens
 * @param str String to hash
 * @returns Hashed string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Generate a CSRF token based on the session ID
 * @returns CSRF token string
 */
export function generateCsrfToken(): string {
  const sessionId = getChatSessionId();
  if (!sessionId) return '';
  
  // Refresh session expiry on token generation
  refreshSessionExpiry();
  
  // Secret should ideally be stored securely on the server
  // For client-side demo purposes only
  const clientSecret = 'chat-widget-csrf-protection';
  
  // Generate token using a simple hash function
  return simpleHash(sessionId + clientSecret + new Date().getDate());
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
 * Encode data for basic obfuscation
 * @param data The data to encode
 * @returns Encoded string
 */
export function encryptData(data: string): string {
  try {
    // Simple base64 encoding with a prefix for basic obfuscation
    const encoded = btoa(ENCRYPTION_KEY.substring(0, 8) + data);
    return encoded;
  } catch (error) {
    console.error('Failed to encrypt data', error);
    return '';
  }
}

/**
 * Decode encrypted data
 * @param encryptedData The encoded data to decode
 * @returns Decoded string or empty if decoding fails
 */
export function decryptData(encryptedData: string): string {
  try {
    // Decode and remove the prefix
    const decoded = atob(encryptedData);
    return decoded.substring(8);
  } catch (error) {
    console.error('Failed to decrypt data', error);
    return '';
  }
}

/**
 * Enforce HTTPS by redirecting HTTP requests to HTTPS
 * @returns True if already on HTTPS, false if redirection occurred
 */
export function enforceHttps(): boolean {
  if (
    typeof window !== 'undefined' && 
    window.location.protocol === 'http:' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    window.location.href = window.location.href.replace('http:', 'https:');
    return false;
  }
  return true;
}

/**
 * Sign a message to ensure data integrity
 * @param message The message to sign
 * @param timestamp Timestamp when the message was created
 * @returns Signature for the message
 */
export function signMessage(message: string, timestamp: number): string {
  const sessionId = getChatSessionId() || '';
  const signatureKey = 'message-integrity-key';
  const dataToSign = `${message}|${timestamp}|${sessionId}|${signatureKey}`;
  return simpleHash(dataToSign);
}

/**
 * Verify message signature to ensure data integrity
 * @param message Original message
 * @param timestamp Original timestamp
 * @param signature Signature to verify
 * @returns True if signature is valid, false otherwise
 */
export function verifyMessageSignature(message: string, timestamp: number, signature: string): boolean {
  const generatedSignature = signMessage(message, timestamp);
  return generatedSignature === signature;
}

/**
 * Logout user and invalidate session
 */
export function logout(): void {
  // Clear rate limiting data for the current session
  const sessionId = getChatSessionId();
  if (sessionId && rateLimitStore[sessionId]) {
    delete rateLimitStore[sessionId];
  }
  
  // Invalidate the session
  invalidateSession();
}

/**
 * Check if the session has expired and needs renewal
 * @returns True if session is valid, false otherwise
 */
export function checkSessionValidity(): boolean {
  const sessionId = getChatSessionId();
  return !!sessionId;
}
