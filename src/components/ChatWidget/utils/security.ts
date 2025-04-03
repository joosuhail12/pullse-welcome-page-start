/**
 * Security-related utilities for the chat widget
 */

import { v4 as uuidv4 } from 'uuid';
import { dispatchChatEvent } from './events';
import { logger } from '@/lib/logger';
import { auditLogger, SecurityEventType } from '@/lib/audit-logger';
import { EventPriority } from './eventValidation';

// Constants
const TOKEN_STORAGE_KEY = 'pullse_secure_token';
const SESSION_STORAGE_KEY = 'pullse_session_id';
const RATE_LIMIT_STORAGE_KEY = 'pullse_rate_limit';
const TOKEN_VERSION = 'v1';
const TOKEN_EXPIRY_DAYS = 14; // Two weeks

// Rate limiting defaults
const DEFAULT_MAX_MESSAGES_PER_MINUTE = 30;
const DEFAULT_MESSAGE_COOLDOWN_MS = 500; // 500ms between messages

// Internal state
let lastMessageTimestamp = 0;

/**
 * Generate secure token for client authentication
 */
export function generateSecureToken(): string {
  try {
    const timestamp = Date.now();
    const randomPart = uuidv4();
    
    // Browser fingerprinting would ideally be added here
    // for additional security in a production environment
    
    // Create token payload
    const payload = {
      id: randomPart,
      created: timestamp,
      expires: timestamp + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      version: TOKEN_VERSION
    };
    
    // Encode and store the token
    const token = btoa(JSON.stringify(payload));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    
    // Log security event
    auditLogger.logSecurityEvent(
      SecurityEventType.SECURITY_SETTING_CHANGE,
      'SUCCESS',
      { action: 'token_generated', tokenId: randomPart.substring(0, 8) },
      'LOW'
    );
    
    return token;
  } catch (err) {
    logger.error('Failed to generate secure token', 'security.generateSecureToken', err);
    
    // Return a basic token as fallback
    return `${TOKEN_VERSION}.fallback.${Date.now()}`;
  }
}

/**
 * Validate a secure token
 */
export function validateToken(token: string): boolean {
  try {
    // Parse the token
    const payload = JSON.parse(atob(token));
    
    // Check if token has expired
    if (payload.expires < Date.now()) {
      auditLogger.logSecurityEvent(
        SecurityEventType.AUTH_FAILURE,
        'FAILURE',
        { reason: 'token_expired', tokenId: payload.id.substring(0, 8) },
        'MEDIUM'
      );
      return false;
    }
    
    // Check token version
    if (payload.version !== TOKEN_VERSION) {
      auditLogger.logSecurityEvent(
        SecurityEventType.AUTH_FAILURE,
        'FAILURE',
        { reason: 'token_version_mismatch', tokenVersion: payload.version },
        'MEDIUM'
      );
      return false;
    }
    
    return true;
  } catch (err) {
    auditLogger.logSecurityEvent(
      SecurityEventType.AUTH_FAILURE,
      'FAILURE',
      { reason: 'token_validation_error', error: String(err) },
      'MEDIUM'
    );
    
    return false;
  }
}

/**
 * Check if the current session is valid
 */
export function isSessionValid(): boolean {
  // Check if token exists
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    // No token found, create a new one
    generateSecureToken();
    return true;
  }
  
  // Validate the token
  const isValid = validateToken(token);
  
  if (!isValid) {
    // Token invalid, generate a new one
    generateSecureToken();
    
    // Dispatch security event
    dispatchChatEvent('chat:error', {
      error: 'session_expired',
      message: 'Your session has expired. A new session has been created.'
    }, EventPriority.HIGH);
  }
  
  return true;
}

/**
 * Get CSRF token for API requests
 */
export function getCsrfToken(): { token: string, nonce: string } {
  const token = `csrf-${uuidv4()}-${Date.now()}`;
  const nonce = uuidv4().substring(0, 8);
  return { token, nonce };
}

/**
 * Sign a message for security verification
 */
export function signMessage(message: string, timestamp: number): string {
  // In a real implementation, this would use HMAC or a similar approach
  return `sig-${uuidv4()}-${timestamp}`;
}

/**
 * Verify a message signature
 */
export function verifyMessageSignature(message: string, timestamp: number, signature: string): boolean {
  // This is a simplified implementation
  // In a real world scenario, this would verify the signature cryptographically
  return signature.startsWith('sig-') && timestamp > 0;
}

/**
 * Generate a client ID for real-time communication
 */
export function generateClientId(): string {
  // Get or create session ID
  const sessionId = getOrCreateSessionId();
  
  // Return the session ID as the client ID
  return sessionId;
}

/**
 * Get or create a session ID
 */
export function getOrCreateSessionId(): string {
  // Check if session ID exists
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  
  if (!sessionId) {
    // Create a new session ID
    sessionId = `session-${uuidv4()}`;
    
    // Store the session ID
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    
    // Log security event
    auditLogger.logSecurityEvent(
      SecurityEventType.AUTH_SUCCESS,
      'SUCCESS',
      { action: 'session_created', sessionId: sessionId.substring(0, 16) },
      'LOW'
    );
    
    // Trigger security check
    isSessionValid();
  }
  
  return sessionId;
}

// Alias for backward compatibility
export const checkSessionValidity = isSessionValid;

/**
 * Check if the user is being rate limited
 */
export function isRateLimited(): boolean {
  // Get current time
  const now = Date.now();
  
  // Check if enough time has passed since the last message
  if (now - lastMessageTimestamp < DEFAULT_MESSAGE_COOLDOWN_MS) {
    // Log rate limit event
    auditLogger.logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      'ATTEMPT',
      { cooldownMs: DEFAULT_MESSAGE_COOLDOWN_MS },
      'LOW'
    );
    
    return true;
  }
  
  // Check rate limit data from storage
  const rateLimitData = getRateLimitData();
  
  // Update timestamp of last message
  lastMessageTimestamp = now;
  
  // Check if the user has exceeded the rate limit
  if (rateLimitData.messageCount >= DEFAULT_MAX_MESSAGES_PER_MINUTE) {
    // Log rate limit event
    auditLogger.logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      'FAILURE',
      { 
        messageCount: rateLimitData.messageCount,
        maxMessagesPerMinute: DEFAULT_MAX_MESSAGES_PER_MINUTE
      },
      'MEDIUM'
    );
    
    return true;
  }
  
  // Increment message count
  updateRateLimitData({
    ...rateLimitData,
    messageCount: rateLimitData.messageCount + 1
  });
  
  return false;
}

/**
 * Get rate limit data from storage
 */
function getRateLimitData() {
  // Initialize with defaults
  const defaultData = {
    messageCount: 0,
    lastReset: Date.now()
  };
  
  try {
    // Get data from session storage
    const data = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    
    if (data) {
      const parsedData = JSON.parse(data);
      
      // Check if we need to reset the counter (after 1 minute)
      if (Date.now() - parsedData.lastReset > 60000) {
        return {
          messageCount: 0,
          lastReset: Date.now()
        };
      }
      
      return parsedData;
    }
    
    return defaultData;
  } catch (err) {
    logger.error('Failed to get rate limit data', 'security.getRateLimitData', err);
    return defaultData;
  }
}

/**
 * Update rate limit data in storage
 */
function updateRateLimitData(data: { messageCount: number; lastReset: number }) {
  try {
    // Store data in session storage
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    logger.error('Failed to update rate limit data', 'security.updateRateLimitData', err);
  }
}

/**
 * Enforce HTTPS connection
 */
export function enforceHttps(): boolean {
  // Skip in development
  if (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local')
  ) {
    return true;
  }
  
  // Check if the connection is secure
  if (window.location.protocol !== 'https:') {
    // Log security event
    auditLogger.logSecurityEvent(
      SecurityEventType.SECURITY_SETTING_CHANGE,
      'ATTEMPT',
      { action: 'enforce_https', currentProtocol: window.location.protocol },
      'HIGH'
    );
    
    // Redirect to HTTPS
    window.location.href = window.location.href.replace('http:', 'https:');
    return false;
  }
  
  return true;
}

/**
 * Clear security data (for logout)
 */
export function logout() {
  // Clear token
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  
  // Clear session ID
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  
  // Clear rate limit data
  sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  
  // Log security event
  auditLogger.logSecurityEvent(
    SecurityEventType.SECURITY_SETTING_CHANGE,
    'SUCCESS',
    { action: 'logout' },
    'LOW'
  );
}

// For compatibility with encryption-related functions
export function encryptData(data: string): string {
  return btoa(`encrypted:${data}`); // Simple base64 encoding for development
}

export function decryptData(encryptedData: string): string {
  if (!encryptedData || !encryptedData.startsWith('encrypted:')) {
    try {
      const decoded = atob(encryptedData);
      if (decoded.startsWith('encrypted:')) {
        return decoded.substring(10);
      }
    } catch (e) {
      // Not encoded or not our format
      return encryptedData;
    }
  }
  
  return encryptedData;
}
