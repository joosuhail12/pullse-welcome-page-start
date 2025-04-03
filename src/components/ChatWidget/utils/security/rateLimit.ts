
/**
 * Rate limiting implementation for chat widget security
 */

import { SecurityEventOutcome, SecurityEventType } from './types';

interface RateLimitRule {
  maxRequests: number;
  timeWindowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  timestamps: number[];
  blocked?: boolean;
  blockExpires?: number;
}

export class RateLimitStore {
  private limits: Map<string, RateLimitEntry>;
  private config: Record<string, RateLimitRule>;
  private logSecurityEvent?: (type: SecurityEventType, outcome: SecurityEventOutcome, details?: any) => void;
  
  constructor(logSecurityEvent?: (type: SecurityEventType, outcome: SecurityEventOutcome, details?: any) => void) {
    this.limits = new Map();
    this.logSecurityEvent = logSecurityEvent;
    
    // Default rate limit configurations
    this.config = {
      'api': { maxRequests: 60, timeWindowMs: 60000 }, // 60 requests per minute
      'auth': { maxRequests: 5, timeWindowMs: 60000, blockDurationMs: 300000 }, // 5 auth attempts per minute
      'message': { maxRequests: 20, timeWindowMs: 10000 }, // 20 messages per 10 seconds
      'typing': { maxRequests: 10, timeWindowMs: 5000 }, // 10 typing events per 5 seconds
      'reaction': { maxRequests: 20, timeWindowMs: 30000 }, // 20 reactions per 30 seconds
    };
  }
  
  /**
   * Set custom rate limit rule
   */
  setRule(key: string, rule: RateLimitRule): void {
    this.config[key] = rule;
  }
  
  /**
   * Check if an action should be rate limited
   */
  isRateLimited(key: string, identifier: string): boolean {
    const fullKey = `${key}:${identifier}`;
    const now = Date.now();
    const rule = this.config[key];
    
    if (!rule) {
      console.warn(`[RateLimit] No rule defined for key: ${key}`);
      return false;
    }
    
    // Get or initialize limit entry
    const entry = this.limits.get(fullKey) || { timestamps: [] };
    
    // Check if currently blocked
    if (entry.blocked && entry.blockExpires && entry.blockExpires > now) {
      return true;
    }
    
    // If was blocked but block expired, clear the block
    if (entry.blocked && entry.blockExpires && entry.blockExpires <= now) {
      entry.blocked = false;
      entry.blockExpires = undefined;
    }
    
    // Filter timestamps to only include those within the time window
    entry.timestamps = entry.timestamps.filter(ts => (now - ts) < rule.timeWindowMs);
    
    // Check if exceeded rate limit
    const isLimited = entry.timestamps.length >= rule.maxRequests;
    
    // If exceeded and rule has block duration, apply block
    if (isLimited && rule.blockDurationMs) {
      entry.blocked = true;
      entry.blockExpires = now + rule.blockDurationMs;
      
      if (this.logSecurityEvent) {
        this.logSecurityEvent('rateLimit', 'FAILURE', {
          key,
          identifier,
          requestCount: entry.timestamps.length,
          maxRequests: rule.maxRequests,
          blockDuration: rule.blockDurationMs
        });
      }
    }
    
    // Update store
    this.limits.set(fullKey, entry);
    
    return isLimited;
  }
  
  /**
   * Record an action attempt
   */
  recordAttempt(key: string, identifier: string): boolean {
    const fullKey = `${key}:${identifier}`;
    const now = Date.now();
    
    // Get or initialize limit entry
    const entry = this.limits.get(fullKey) || { timestamps: [] };
    
    // Add current timestamp
    entry.timestamps.push(now);
    
    // Update store
    this.limits.set(fullKey, entry);
    
    // Check if now rate limited
    return this.isRateLimited(key, identifier);
  }
  
  /**
   * Clear rate limit data for a specific key and identifier
   */
  clear(key: string, identifier: string): void {
    const fullKey = `${key}:${identifier}`;
    this.limits.delete(fullKey);
  }
  
  /**
   * Get current count of attempts for a specific key and identifier
   */
  getCount(key: string, identifier: string): number {
    const fullKey = `${key}:${identifier}`;
    const entry = this.limits.get(fullKey);
    
    if (!entry) return 0;
    
    const now = Date.now();
    const rule = this.config[key];
    
    if (!rule) return 0;
    
    // Count only attempts within time window
    return entry.timestamps.filter(ts => (now - ts) < rule.timeWindowMs).length;
  }
}

// Create and export a singleton instance
export const rateLimitStore = new RateLimitStore();
