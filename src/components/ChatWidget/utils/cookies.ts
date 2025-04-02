
/**
 * Cookie utilities for the Chat Widget
 */

const COOKIE_NAME = '_chat_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Sets a cookie with the provided name and value
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE): void {
  const cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
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
 * Gets the chat session ID from cookies
 */
export function getChatSessionId(): string | null {
  return getCookie(COOKIE_NAME);
}

/**
 * Sets the chat session ID in cookies
 */
export function setChatSessionId(sessionId: string): void {
  setCookie(COOKIE_NAME, sessionId);
}
