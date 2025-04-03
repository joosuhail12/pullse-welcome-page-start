/**
 * Safely extracts and sanitizes error messages to prevent sensitive data leaks
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return sanitizeString(error);
  }
  
  if (error instanceof Error) {
    return sanitizeString(error.message);
  }
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return sanitizeString(error.message);
  }
  
  return 'Unknown error';
}

/**
 * Sanitizes a string by removing potential sensitive data
 */
function sanitizeString(str: string): string {
  if (!str) return 'Empty error message';
  
  // Remove anything that looks like an API key or token
  let sanitized = str.replace(/(['"]?api[_-]?key['"]?\s*[:=]\s*)['"][\w\d]+['"]/gi, '$1[REDACTED]');
  sanitized = sanitized.replace(/(['"]?token['"]?\s*[:=]\s*)['"][\w\d]+['"]/gi, '$1[REDACTED]');
  sanitized = sanitized.replace(/(['"]?secret['"]?\s*[:=]\s*)['"][\w\d]+['"]/gi, '$1[REDACTED]');
  sanitized = sanitized.replace(/(['"]?password['"]?\s*[:=]\s*)['"][^'"]+['"]/gi, '$1[REDACTED]');
  
  // Remove email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
  
  // Remove anything that looks like a JWT
  sanitized = sanitized.replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[JWT REDACTED]');
  
  // Keep the error message below a certain length
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '... (truncated)';
  }
  
  return sanitized;
}

/**
 * Sanitizes request/response objects for logging
 */
export function sanitizeApiData(data: any): any {
  if (!data) return data;
  
  // If it's not an object, return as is
  if (typeof data !== 'object') return data;
  
  // If it's an array, sanitize each item
  if (Array.isArray(data)) {
    return data.map(item => sanitizeApiData(item));
  }
  
  // Clone the object to avoid modifying the original
  const sanitized = { ...data };
  
  // Fields to redact
  const sensitiveFields = [
    'password', 'token', 'api_key', 'apiKey', 'secret', 'authorization',
    'accessToken', 'refreshToken', 'passwordConfirmation', 'credential'
  ];
  
  // Redact sensitive fields
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeApiData(sanitized[key]);
    }
  });
  
  return sanitized;
}

export default {
  sanitizeErrorMessage,
  sanitizeApiData
};
