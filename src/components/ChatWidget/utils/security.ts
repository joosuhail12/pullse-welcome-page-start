
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
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns Random string
 */
function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
  // Note: In a full implementation, the server would verify this token
  const tokenData = `${sessionId}:${nonce}:${timestamp}`;
  
  // For client-side demo purposes, we encode the token
  // In production, this would be signed by the server
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
    return false;
  }
}

/**
 * Client-side encryption placeholder - to be replaced with server-side encryption
 * @param data Data to encrypt
 * @returns Placeholder for encrypted data
 */
export function encryptData(data: string): string {
  // This is just a placeholder - this operation should be performed on the server
  // We'll just mark the data as needing server-side encryption
  return `SERVER_ENCRYPT:${btoa(data)}`;
}

/**
 * Client-side decryption placeholder - to be replaced with server-side decryption
 * @param encryptedData Data to decrypt
 * @returns Placeholder for decrypted data
 */
export function decryptData(encryptedData: string): string {
  // This is just a placeholder - this operation should be performed on the server
  // We'll assume data from server is already decrypted
  if (encryptedData.startsWith('SERVER_ENCRYPT:')) {
    try {
      // For development purposes only, simulate decryption
      return atob(encryptedData.substring(14));
    } catch (error) {
      console.error('Failed to process data', error);
      return '';
    }
  }
  
  return encryptedData;
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
 * This should ultimately be replaced with server-side signature generation
 * @param message The message to sign
 * @param timestamp Timestamp when the message was created
 * @returns Signature for the message
 */
export function signMessage(message: string, timestamp: number): string {
  const sessionId = getChatSessionId() || '';
  return `SERVER_SIGN:${sessionId}:${timestamp}:${message.length}`;
}

/**
 * Verify message signature to ensure data integrity
 * This should ultimately be replaced with server-side signature verification
 * @param message Original message
 * @param timestamp Original timestamp
 * @param signature Signature to verify
 * @returns True if signature is valid, false otherwise
 */
export function verifyMessageSignature(message: string, timestamp: number, signature: string): boolean {
  // This is a placeholder - actual verification should happen server-side
  const expectedSignature = signMessage(message, timestamp);
  return signature === expectedSignature;
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
