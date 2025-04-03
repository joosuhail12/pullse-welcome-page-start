import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { v4 as uuidv4 } from 'uuid';
import { auditLogger } from '@/lib/audit-logger';
import { SecurityEventType } from '@/lib/securityTypes';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

// Store request timestamps for rate limiting
const requestTimestamps: number[] = [];

/**
 * Checks if the request is rate limited based on the number of requests
 * within a defined time window.
 * 
 * SECURITY NOTICE: Rate limiting is essential to prevent abuse and
 * denial-of-service attacks. Adjust the window and max requests based
 * on your application's needs and traffic patterns.
 * 
 * TODO: Implement more sophisticated rate limiting (e.g., token bucket)
 * TODO: Add IP-based rate limiting
 * TODO: Implement adaptive rate limiting based on server load
 */
export function isRateLimited(): boolean {
  const now = Date.now();
  
  // Remove timestamps older than the rate limit window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  
  // Check if the number of requests exceeds the limit
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    logger.warn('Rate limit exceeded', 'security.isRateLimited', {
      limit: RATE_LIMIT_MAX_REQUESTS,
      window: RATE_LIMIT_WINDOW_MS
    });
    return true;
  }
  
  // Add the current timestamp to the request timestamps
  requestTimestamps.push(now);
  return false;
}

/**
 * Enforces HTTPS by redirecting to the HTTPS version of the page if
 * the current connection is not secure.
 * 
 * SECURITY NOTICE: Running a website over HTTP exposes users to
 * man-in-the-middle attacks. Always enforce HTTPS in production.
 */
export function enforceHttps(): boolean {
  // Skip for local development
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' || 
      import.meta.env.DEV) {
    return true;
  }
  
  if (window.location.protocol === 'https:') {
    return true;
  }
  
  try {
    // Log the security event
    auditLogger.logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      'ATTEMPT',
      { action: 'enforce_https', currentProtocol: window.location.protocol }
    );
    
    // Redirect to HTTPS version of the same URL
    window.location.href = window.location.href.replace('http:', 'https:');
    return false;
  } catch (error) {
    console.error('Failed to redirect to HTTPS', error);
    return false;
  }
}

/**
 * Generates a CSRF token and a nonce for mitigating Cross-Site Request
 * Forgery attacks.
 * 
 * SECURITY NOTICE: CSRF tokens should be unique per user session and
 * should be validated on every state-changing request.
 * 
 * TODO: Implement server-side validation of CSRF tokens
 * TODO: Rotate CSRF tokens regularly
 */
export function generateCsrfToken(): { token: string, nonce: string } {
  try {
    // Generate a cryptographically secure random token
    const token = uuidv4();
    
    // Generate a cryptographically secure random nonce
    const nonce = uuidv4();
    
    // Log token generation for security auditing
    auditLogger.logSecurityEvent(
      SecurityEventType.TOKEN_ISSUED,
      'SUCCESS',
      { 
        tokenType: 'csrf',
        tokenLength: token.length,
        nonceLength: nonce.length
      },
      'LOW'
    );
    
    return { token, nonce };
  } catch (error) {
    // Handle errors during token generation
    console.error('CSRF token generation failed', error);
    
    // Log token generation failure
    auditLogger.logSecurityEvent(
      SecurityEventType.TOKEN_REJECTED,
      'FAILURE',
      { 
        tokenType: 'csrf',
        error: sanitizeErrorMessage(error instanceof Error ? error : new Error('Unknown error'))
      },
      'MEDIUM'
    );
    
    // Return a placeholder token to prevent further errors
    return { token: 'CSRF_TOKEN_FAILED', nonce: 'CSRF_NONCE_FAILED' };
  }
}

/**
 * Signs a message using a secret key to ensure integrity and
 * authenticity.
 * 
 * SECURITY NOTICE: Keep the signing key secret and rotate it
 * regularly. Use a strong hashing algorithm.
 * 
 * @param message The message to sign
 * @param timestamp Timestamp of the request
 * @returns The signature of the message
 * 
 * TODO: Implement key rotation
 * TODO: Use a Hardware Security Module (HSM) for key storage
 */
export function signMessage(message: string, timestamp: number): string {
  // In a real implementation, this would use a server-side secret key
  // and a secure hashing algorithm (e.g., HMAC-SHA256)
  const signingKey = import.meta.env.VITE_SIGNING_KEY || 'insecureFallbackKey';
  const data = `${message}:${timestamp}:${signingKey}`;
  
  // Use a simple hash for demonstration purposes
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}

/**
 * Verifies the signature of a message to ensure it has not been
 * tampered with.
 * 
 * SECURITY NOTICE: Always verify signatures before processing
 * sensitive data.
 * 
 * @param message The message to verify
 * @param timestamp Timestamp of the request
 * @param signature The signature to verify against
 * @returns True if the signature is valid, false otherwise
 */
export function verifyMessageSignature(message: string, timestamp: number, signature: string): boolean {
  try {
    // Re-calculate the signature
    const expectedSignature = signMessage(message, timestamp);
    
    // Compare the signatures
    if (expectedSignature === signature) {
      return true;
    } else {
      logger.warn('Invalid message signature', 'security.verifyMessageSignature', {
        expected: expectedSignature,
        actual: signature,
        message,
        timestamp
      });
      return false;
    }
  } catch (error) {
    logger.error('Error verifying message signature', 'security.verifyMessageSignature', {
      error: sanitizeErrorMessage(error)
    });
    return false;
  }
}
