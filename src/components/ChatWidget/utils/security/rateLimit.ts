
import { SecurityEventType, securityLogger } from './SecurityEventTypes';

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  endpoints: string[];
}

interface RateLimitEntry {
  requests: number;
  lastRequest: number;
  windowStart: number;
}

export interface RateLimitStore {
  [key: string]: {
    [endpoint: string]: RateLimitEntry;
  };
}

export const rateLimitStore: RateLimitStore = {};

const DEFAULT_RULES: RateLimitRule[] = [
  { maxRequests: 5, windowMs: 1000, endpoints: ['/api/auth'] },
  { maxRequests: 30, windowMs: 60000, endpoints: ['/api/messages', '/api/conversations'] },
  { maxRequests: 100, windowMs: 60000 * 15, endpoints: ['*'] }
];

const getMatchingRule = (endpoint: string): RateLimitRule => {
  const specificRule = DEFAULT_RULES.find(rule => 
    rule.endpoints.some(pattern => 
      pattern === endpoint || 
      (pattern.endsWith('*') && endpoint.startsWith(pattern.slice(0, -1)))
    )
  );
  
  if (specificRule) return specificRule;
  
  // Default fallback rule
  return DEFAULT_RULES.find(rule => rule.endpoints.includes('*'))!;
};

export const checkRateLimit = (userId: string, endpoint: string): boolean => {
  const rule = getMatchingRule(endpoint);
  const now = Date.now();
  
  if (!rateLimitStore[userId]) {
    rateLimitStore[userId] = {};
  }
  
  if (!rateLimitStore[userId][endpoint]) {
    rateLimitStore[userId][endpoint] = {
      requests: 1,
      lastRequest: now,
      windowStart: now
    };
    return true;
  }
  
  const entry = rateLimitStore[userId][endpoint];
  
  // Reset window if needed
  if (now - entry.windowStart > rule.windowMs) {
    entry.requests = 1;
    entry.windowStart = now;
    entry.lastRequest = now;
    return true;
  }
  
  // Check if rate limit is exceeded
  if (entry.requests >= rule.maxRequests) {
    securityLogger.logSecurityEvent(
      SecurityEventType.RATE_LIMIT,
      'FAILURE',
      { userId, endpoint, requests: entry.requests, limit: rule.maxRequests },
      'MEDIUM'
    );
    return false;
  }
  
  // Update rate limit counter
  entry.requests++;
  entry.lastRequest = now;
  return true;
};

export const clearRateLimits = (userId: string): void => {
  delete rateLimitStore[userId];
};
