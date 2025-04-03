
/**
 * Crypto utilities for security features
 */

/**
 * Hash data using SHA-256
 * @param data Data to hash
 * @returns Promise resolving to the hashed string
 */
export async function hashData(data: string): Promise<string> {
  // Use the Web Crypto API for secure hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  // Convert the hash to a hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a secure random ID
 * @param length Length of the generated ID
 * @returns A secure random ID string
 */
export function generateSecureId(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/**
 * Safely compare two strings in constant time to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns True if strings are equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
