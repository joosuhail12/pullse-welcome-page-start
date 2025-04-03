
/**
 * Rate limiting utility
 */

import { securityLogger } from "@/lib/security/securityLogger";
import { SecurityEventType } from "@/lib/security/securityTypes";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

// Default rate limiting configuration
const DEFAULT_LIMIT: RateLimitConfig = {
  maxRequests: 10, // Max 10 requests
  windowMs: 60000 // Per minute
};

// Store rate limit state in memory (would use Redis or similar in production)
const rateLimitStore: Record<string, RateLimitState> = {};

/**
 * Check if the current request would exceed rate limits
 */
export function isRateLimited(
  endpoint: string = 'default',
  ip: string = 'unknown',
  config: RateLimitConfig = DEFAULT_LIMIT
): boolean {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  
  // Get or initialize rate limit state
  if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
    rateLimitStore[key] = {
      count: 0,
      resetAt: now + config.windowMs
    };
  }
  
  // Check if limit exceeded
  const isLimited = rateLimitStore[key].count >= config.maxRequests;
  
  if (isLimited) {
    securityLogger.logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      'FAILURE',
      {
        endpoint,
        ip,
        count: rateLimitStore[key].count,
        limit: config.maxRequests,
        windowMs: config.windowMs,
        resetsIn: rateLimitStore[key].resetAt - now
      },
      'MEDIUM'
    );
  }
  
  return isLimited;
}

/**
 * Track API call for rate limiting
 */
export function trackAPICall(
  endpoint: string = 'default',
  ip: string = 'unknown'
): boolean {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  
  // Get or initialize rate limit state
  if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
    rateLimitStore[key] = {
      count: 0,
      resetAt: now + DEFAULT_LIMIT.windowMs
    };
  }
  
  // Increment counter
  rateLimitStore[key].count++;
  
  // Check if limit exceeded
  const isLimited = rateLimitStore[key].count >= DEFAULT_LIMIT.maxRequests;
  
  return !isLimited; // Return true if call is allowed
}

export default {
  isRateLimited,
  trackAPICall
};
