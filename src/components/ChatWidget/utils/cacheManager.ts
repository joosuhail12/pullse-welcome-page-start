
/**
 * Cache Manager Utility
 * Provides methods to cache and retrieve data with configurable expiry
 */

// Cache storage with expiry times
interface CacheItem<T> {
  data: T;
  expiry: number;
}

// Cache configuration
interface CacheConfig {
  enabled: boolean;
  defaultTTL: number; // Time to live in milliseconds
}

// Default configuration
const defaultConfig: CacheConfig = {
  enabled: true,
  defaultTTL: 5 * 60 * 1000, // 5 minutes by default
};

// Memory cache storage
const memoryCache: Map<string, CacheItem<any>> = new Map();

/**
 * Cache an item with a specific key and expiry time
 */
export function cacheItem<T>(key: string, data: T, ttl?: number): void {
  const expiry = Date.now() + (ttl || defaultConfig.defaultTTL);
  memoryCache.set(key, { data, expiry });
}

/**
 * Get an item from cache if it exists and isn't expired
 */
export function getCachedItem<T>(key: string): T | null {
  const item = memoryCache.get(key);
  
  // Return null if item doesn't exist
  if (!item) return null;
  
  // Return null if item is expired
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  
  return item.data as T;
}

/**
 * Check if an item exists in cache and is valid
 */
export function isCached(key: string): boolean {
  const item = memoryCache.get(key);
  if (!item) return false;
  
  // Check if expired
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return false;
  }
  
  return true;
}

/**
 * Remove an item from cache
 */
export function removeCachedItem(key: string): void {
  memoryCache.delete(key);
}

/**
 * Clear all expired items from cache
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  
  for (const [key, item] of memoryCache.entries()) {
    if (now > item.expiry) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Get cache size (number of items)
 */
export function getCacheSize(): number {
  return memoryCache.size;
}

/**
 * Set a custom cache configuration
 */
export function setCacheConfig(config: Partial<CacheConfig>): void {
  Object.assign(defaultConfig, config);
}

// Run periodic cleanup of expired items (every 5 minutes)
setInterval(clearExpiredCache, 5 * 60 * 1000);
