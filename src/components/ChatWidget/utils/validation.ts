
/**
 * Validation utilities for the chat widget
 */

/**
 * Validate input to prevent injection attacks
 * @param input Input string to validate
 * @param type Type of validation to perform
 * @returns True if input is valid, false otherwise
 */
export function validateInput(
  input: string,
  type: 'text' | 'email' | 'url' | 'id' | 'html' = 'text'
): boolean {
  if (!input) return false;
  
  const patterns = {
    text: /^[^<>{}()`';]*$/,  // Basic text sanitization
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    id: /^[a-zA-Z0-9_-]{1,64}$/,
    html: /^[^<>]*$/ // Very strict, blocks all HTML tags
  };
  
  return patterns[type].test(input);
}

/**
 * Sanitize HTML content to prevent XSS
 * @param html Input string with HTML
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  // Very basic sanitization - in production, use a library like DOMPurify
  return html.replace(/<(script|iframe|object|embed|form)/gi, '&lt;$1')
    .replace(/(on\w+)=/gi, 'data-$1=')
    .replace(/javascript:/gi, 'blocked:');
}

/**
 * Escape a string for safe inclusion in HTML
 * @param text Text to escape
 * @returns HTML escaped string
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Check if a string might contain malicious content
 * @param input Input string to check
 * @returns True if input is potentially dangerous
 */
export function isMaliciousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /<svg.*?onload/i
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}
