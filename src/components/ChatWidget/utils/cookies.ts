
/**
 * Cookie utilities for the Chat Widget
 * Enhanced for better mobile support
 */

const COOKIE_NAME = '_chat_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_EXPIRY_KEY = '_chat_session_expiry';

/**
 * Sets a cookie with the provided name and value with enhanced security
 * Note: HttpOnly flag can only be set by server, not by client-side JavaScript
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE): void {
    // Build secure cookie string with secure and SameSite flags
    // Using SameSite=Lax for better user experience while maintaining security
    let cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;

    // Only add Secure flag if not on a local development environment and if using HTTPS
    if (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost')) {
        cookieString += '; Secure';
    }

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
    let cookieString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

    // Only add Secure flag if not on a local development environment and if using HTTPS
    if (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost')) {
        cookieString += '; Secure';
    }

    document.cookie = cookieString;
}

/**
 * Gets the chat session ID from cookies or localStorage fallback for mobile browsers
 * Mobile browsers sometimes have cookie restrictions, so we add localStorage as a fallback
 */
export function getChatSessionId(): string | null {
    // Check if the session has expired
    const sessionExpiry = getSessionExpiry();
    if (sessionExpiry && sessionExpiry < Date.now()) {
        // Session expired, clear it and return null
        invalidateSession();
        return null;
    }

    // Try to get from cookie first
    const cookieValue = getCookie(COOKIE_NAME);
    if (cookieValue) {
        return cookieValue;
    }

    // Fallback to localStorage for mobile browsers with cookie restrictions
    return localStorage.getItem(COOKIE_NAME);
}

/**
 * Sets the chat session ID in cookies with enhanced security
 * Also stores in localStorage as a fallback for mobile browsers
 * @param sessionId The session ID to set
 * @param expiryTimeMs Optional expiry time in milliseconds; defaults to 30 days
 */
export function setChatSessionId(sessionId: string, expiryTimeMs: number = COOKIE_MAX_AGE * 1000): void {
    // Set in cookie
    setCookie(COOKIE_NAME, sessionId);

    // Also set in localStorage as fallback for mobile browsers
    localStorage.setItem(COOKIE_NAME, sessionId);

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

    // Clear session data from localStorage
    localStorage.removeItem(COOKIE_NAME);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
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
    const sessionId = getChatSessionId();
    if (!sessionId) return false;

    const expiry = getSessionExpiry();
    return expiry !== null && expiry > Date.now();
}

/**
 * Detects if the browser has restrictive cookie policies
 * This is common on some mobile browsers and in private browsing modes
 */
export function hasRestrictiveCookiePolicies(): boolean {
    const testCookie = 'test_cookie_support';
    setCookie(testCookie, '1', 10);
    const hasSupport = getCookie(testCookie) === '1';
    deleteCookie(testCookie);
    return !hasSupport;
}
