
/**
 * Rate Limiting utilities
 * 
 * Provides functions for enforcing rate limits
 * to prevent abuse of the chat system.
 */

import { getChatSessionId } from '../cookies';
import { auditLogger } from '@/lib/audit-logger';

// Store rate limiting data in memory
export const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10;     // 10 messages per minute

/**
 * Check if the current request exceeds rate limits
 * @returns True if rate limit is exceeded, false otherwise
 * 
 * TODO: Implement server-side rate limiting with IP tracking and persistent storage
 * TODO: Add exponential back-off for repeated abuse
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
  const isLimited = rateLimitStore[sessionId].count > MAX_REQUESTS_PER_WINDOW;
  
  // Log rate limiting events
  if (isLimited) {
    auditLogger.logSecurityEvent(
      auditLogger.SecurityEventType.SUSPICIOUS_ACTIVITY,
      'FAILURE',
      { 
        action: 'rate_limit_exceeded', 
        sessionId, 
        requestCount: rateLimitStore[sessionId].count,
        windowMs: RATE_LIMIT_WINDOW_MS
      },
      'MEDIUM'
    );
  }
  
  return isLimited;
}
