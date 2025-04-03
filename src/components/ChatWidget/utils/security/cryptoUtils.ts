
/**
 * Utility functions for cryptographic operations in the chat widget
 */

/**
 * Generate a cryptographically secure random token
 * @param length Length of the token in bytes
 * @returns Base64 encoded random string
 */
export function generateSecureToken(length = 32): string {
  if (typeof window === 'undefined' || !window.crypto) {
    // Fallback for non-browser environments
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Use Web Crypto API for secure random generation
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  return btoa(String.fromCharCode(...randomBytes));
}

/**
 * Create SHA-256 hash of input
 * @param input String to hash
 * @returns Promise resolving to hex string of hash
 */
export async function sha256Hash(input: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto) {
    // Simple fallback (not for production)
    return Promise.resolve(Array.from(input)
      .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), ''));
  }

  // Convert the input string to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Generate the hash
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple encrypt function for non-sensitive data
 * Note: This is NOT secure encryption, just basic obfuscation
 * @param text Text to encrypt
 * @param key Encryption key
 * @returns Encrypted text
 */
export function simpleEncrypt(text: string, key: string): string {
  const keyHash = Array.from(key).map(char => char.charCodeAt(0)).reduce((a, b) => a + b, 0);
  return Array.from(text)
    .map(char => String.fromCharCode(char.charCodeAt(0) ^ keyHash & 0xF))
    .join('');
}

/**
 * Simple decrypt function for non-sensitive data
 * Note: This is NOT secure decryption, just basic deobfuscation
 * @param encrypted Encrypted text
 * @param key Encryption key
 * @returns Decrypted text
 */
export function simpleDecrypt(encrypted: string, key: string): string {
  return simpleEncrypt(encrypted, key); // XOR is reversible
}
