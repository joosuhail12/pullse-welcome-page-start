
/**
 * Crypto utility functions for secure operations in the Chat Widget
 */

/**
 * Generate a secure ID with given length
 * Uses crypto.randomUUID() if available, otherwise falls back to Math.random()
 */
export function generateSecureId(length: number = 16): string {
  try {
    if (crypto && crypto.randomUUID) {
      // Use native crypto API if available
      return crypto.randomUUID().replace(/-/g, '').substring(0, length);
    }

    // Fallback to Math.random if crypto API is not available
    return Array.from(
      { length },
      () => Math.floor(Math.random() * 36).toString(36)
    ).join('');
  } catch (e) {
    console.error('Failed to generate secure ID:', e);
    // Final fallback
    return Math.random().toString(36).substring(2, 2 + length);
  }
}

/**
 * Generate a secure token with given length
 * Similar to generateSecureId but with different character set
 */
export function generateSecureToken(length: number = 32): string {
  try {
    // Use Web Crypto API if available
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, length);
    }

    // Fallback to generateSecureId with custom length
    return generateSecureId(length);
  } catch (e) {
    console.error('Failed to generate secure token:', e);
    // Final fallback
    return Math.random().toString(36).substring(2, 2 + length) + 
           Math.random().toString(36).substring(2, 2 + length);
  }
}

/**
 * Hash a string using SHA-256 (if available)
 */
export async function hashString(input: string): Promise<string> {
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback for browsers without crypto.subtle
    console.warn('Secure hashing not available, using fallback');
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  } catch (e) {
    console.error('Hash operation failed:', e);
    // Very simple fallback
    return btoa(input);
  }
}

/**
 * Verify if token is valid using equal-time comparison
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
