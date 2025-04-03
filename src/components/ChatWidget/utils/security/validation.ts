
/**
 * Validation utilities for chat widget security
 */

import { auditLogger } from '@/lib/audit-logger';
import { logger } from '@/lib/logger';
import { SecurityEventType } from '@/lib/security/securityEventTypes';

/**
 * Validate a message for security issues
 * @param message The message to validate
 * @returns True if the message is valid, false otherwise
 */
export function validateMessage(message: string): boolean {
  if (!message || message.trim().length === 0) {
    return false;
  }
  
  // Check for excessive length
  if (message.length > 10000) {
    logger.warn('Message exceeds maximum length', 'security.validation');
    return false;
  }
  
  // Check for potentially malicious content (basic checks only)
  const suspiciousPatterns = [
    /<script\b[^>]*>/i, // Script tags
    /javascript:/i,     // JavaScript protocol
    /on\w+\s*=/i,       // Event handlers
    /data:text\/html/i  // Data URLs with HTML content
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      // Log potential security issue
      auditLogger.logSecurityEvent(
        SecurityEventType.POSSIBLE_XSS_ATTEMPT, 
        'FAILURE', 
        { contentLength: message.length }
      );
      
      logger.warn('Potentially malicious content detected in message', 'security.validation');
      return false;
    }
  }
  
  return true;
}

/**
 * Validate an API key format (not checking validity, just format)
 * @param apiKey The API key to validate
 * @returns True if the API key format is valid, false otherwise
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Check basic format requirements
  if (!apiKey || apiKey.length < 16) {
    return false;
  }
  
  // Check expected format (example: sk_live_abc123... or pk_test_xyz789...)
  const validPrefixes = ['sk_', 'pk_'];
  const validTypes = ['live_', 'test_'];
  
  const hasValidPrefix = validPrefixes.some(prefix => apiKey.startsWith(prefix));
  
  if (!hasValidPrefix) {
    return false;
  }
  
  const restOfKey = apiKey.substring(3);
  const hasValidType = validTypes.some(type => restOfKey.startsWith(type));
  
  return hasValidType;
}

/**
 * Sanitize user input to prevent XSS
 * @param input The user input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate UUID format
 * @param uuid The UUID to validate
 * @returns True if the format is valid, false otherwise
 */
export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
