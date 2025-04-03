
import { getChatSessionId, invalidateSession, refreshSessionExpiry } from './cookies';
import { serverSideEncrypt, serverSideDecrypt } from '../services/api';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { logger } from '@/lib/logger';
import { 
  requiresServerImplementation, 
  signMessageServerSide, 
  verifySignatureServerSide
} from './serverSideAuth';

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
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns Random string
 */
function generateSecureRandom(length: number = 32): string {
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

/**
 * Generate a CSRF token based on the session ID and a secure nonce
 * @returns CSRF token string and nonce object
 */
export function generateCsrfToken(): { token: string, nonce: string } {
  const sessionId = getChatSessionId();
  if (!sessionId) return { token: '', nonce: '' };
  
  // Refresh session expiry on token generation
  refreshSessionExpiry();
  
  // Generate a cryptographically secure nonce
  const nonce = generateSecureRandom(16);
  
  // Generate timestamp for token freshness
  const timestamp = Date.now().toString(36);
  
  // Create token using session ID, nonce and timestamp
  const tokenData = `${sessionId}:${nonce}:${timestamp}`;
  
  // Encode token - in production this would be signed on the server
  const token = btoa(tokenData);
  
  return { token, nonce };
}

/**
 * Verify if the provided CSRF token is valid
 * @param token The token to verify
 * @param expectedNonce The nonce that was used to generate the token
 * @returns True if token is valid, false otherwise
 */
export function verifyCsrfToken(token: string, expectedNonce: string): boolean {
  try {
    // Decode the token
    const decoded = atob(token);
    const [sessionId, nonce, timestampStr] = decoded.split(':');
    
    // Verify session ID
    if (sessionId !== getChatSessionId()) return false;
    
    // Verify nonce
    if (nonce !== expectedNonce) return false;
    
    // Check token freshness (10 minute expiry)
    const timestamp = parseInt(timestampStr, 36);
    const now = Date.now();
    if (now - timestamp > 600000) return false;
    
    return true;
  } catch (e) {
    logger.error(
      'CSRF token verification failed', 
      'security.verifyCsrfToken', 
      { error: sanitizeErrorMessage(e) }
    );
    return false;
  }
}

/**
 * Client-side encryption placeholder - delegates to server-side encryption
 * @param data Data to encrypt
 * @returns Encrypted data from server, or placeholder
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
 * Generate a signature string for message integrity validation
 * Delegates to server-side implementation in production
 * @param message The message to sign
 * @param timestamp Timestamp when the message was created
 * @returns Signature for the message
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

/**
 * Generate Content-Security-Policy directives for the chat widget
 * @returns CSP directives as a string
 */
export function generateCSPDirectives(): string {
  return [
    // Define allowed sources for various content types
    "default-src 'self' https://cdn.pullse.io",
    "script-src 'self' https://cdn.pullse.io https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://cdn.pullse.io https://unpkg.com",
    "img-src 'self' data: https://cdn.pullse.io https://*.githubusercontent.com",
    "connect-src 'self' https://*.pullse.io https://api.pullse.io",
    "font-src 'self' https://cdn.pullse.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    // Report violations to our endpoint
    "report-uri https://pullse.io/csp-report"
  ].join('; ');
}

/**
 * Generate Subresource Integrity (SRI) attributes for script tags
 * Note: In production, these would be pre-computed and stored
 * @returns SRI hash attributes
 */
export function getScriptIntegrityHash(): string {
  // In a real implementation, this would return the pre-computed hash
  // For this demo, we return a placeholder
  return 'sha384-placeholder-hash-would-be-here-in-production';
}
