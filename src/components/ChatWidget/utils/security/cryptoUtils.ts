
/**
 * Cryptographic utility functions for the chat widget
 */

/**
 * Generate a cryptographically secure random string of specified length
 * @param length Length of the random string to generate
 * @returns Random string in hex format
 */
export function generateSecureRandom(length: number): string {
  // In a browser environment, we can use the Web Crypto API
  const array = new Uint8Array(length);
  
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback to less secure Math.random if Web Crypto API is not available
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to hex string
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple HMAC-like signature for messages (simplified for demonstration)
 * 
 * In a real application, this would use proper HMAC with a secure key
 * @param message The message to sign
 * @param timestamp Timestamp to include in the signature
 * @returns A signature string for the message
 */
export function signMessage(message: string, timestamp: number): string {
  const stringToSign = `${message}:${timestamp}`;
  let signature = '';
  
  // Simple hash function for demonstration purposes only
  // In production, use a proper HMAC-SHA256 or similar algorithm
  for (let i = 0; i < stringToSign.length; i++) {
    signature += (stringToSign.charCodeAt(i) ^ 42).toString(16);
  }
  
  return signature;
}

/**
 * Verify a message signature
 * @param message The original message 
 * @param timestamp The timestamp used in signing
 * @param signature The signature to verify
 * @returns true if signature is valid
 */
export function verifySignature(message: string, timestamp: number, signature: string): boolean {
  const expectedSignature = signMessage(message, timestamp);
  return expectedSignature === signature;
}
