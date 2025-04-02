
/**
 * Cookie utilities for the Chat Widget
 */

const COOKIE_NAME = '_chat_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_EXPIRY_KEY = '_chat_session_expiry';

/**
 * Sets a cookie with the provided name and value with enhanced security
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE): void {
  // Build secure cookie string with httpOnly, secure, and SameSite flags
  const cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict; Secure; HttpOnly`;
  document.cookie = cookieString;
}

/**
 * Gets a cookie value by name
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  
  return null;
}

/**
 * Deletes a cookie by setting its expiration to the past
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
}

/**
 * Gets the chat session ID from cookies
 */
export function getChatSessionId(): string | null {
  // Check if the session has expired
  const sessionExpiry = getSessionExpiry();
  if (sessionExpiry && sessionExpiry < Date.now()) {
    // Session expired, clear it and return null
    invalidateSession();
    return null;
  }
  
  return getCookie(COOKIE_NAME);
}

/**
 * Sets the chat session ID in cookies with enhanced security
 * @param sessionId The session ID to set
 * @param expiryTimeMs Optional expiry time in milliseconds; defaults to 30 days
 */
export function setChatSessionId(sessionId: string, expiryTimeMs: number = COOKIE_MAX_AGE * 1000): void {
  setCookie(COOKIE_NAME, sessionId);
  
  // Store the expiration timestamp
  const expiryTimestamp = Date.now() + expiryTimeMs;
  localStorage.setItem(SESSION_EXPIRY_KEY, expiryTimestamp.toString());
}

/**
 * Retrieves the session expiry timestamp
 */
export function getSessionExpiry(): number | null {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Invalidates the current session by clearing cookies and localStorage data
 */
export function invalidateSession(): void {
  // Remove the session cookie
  deleteCookie(COOKIE_NAME);
  
  // Clear session expiry from localStorage
  localStorage.removeItem(SESSION_EXPIRY_KEY);
  
  // Additional cleanup operations can be added here
}

/**
 * Refreshes the session expiry time
 */
export function refreshSessionExpiry(expiryTimeMs: number = COOKIE_MAX_AGE * 1000): void {
  const sessionId = getChatSessionId();
  if (sessionId) {
    setChatSessionId(sessionId, expiryTimeMs);
  }
}

/**
 * Checks if the session is valid
 */
export function isSessionValid(): boolean {
  const sessionId = getCookie(COOKIE_NAME);
  if (!sessionId) return false;
  
  const expiry = getSessionExpiry();
  return expiry !== null && expiry > Date.now();
}
