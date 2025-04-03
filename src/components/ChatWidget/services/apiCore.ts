
/**
 * Chat Widget API Core
 * 
 * Provides shared functionality for API services including:
 * - Resilience patterns (circuit breaking, retries)
 * - Common headers and security tokens
 * - Response validation
 * - Error handling and sanitization
 */

import { isCircuitOpen, withResilience, withRetry } from '../utils/resilience';
import { generateCsrfToken, signMessage, verifyMessageSignature, enforceHttps } from '../utils/security';
import { sanitizeInput } from '../utils/validation';
import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { errorHandler } from '@/lib/error-handler';
import { toast } from '@/components/ui/use-toast';

// Circuit names for different API endpoints
export const CONFIG_CIRCUIT = 'chat-widget-config';
export const MESSAGE_CIRCUIT = 'chat-widget-message';
export const SECURITY_CIRCUIT = 'chat-widget-security';

// API Error Response Interface
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

/**
 * Creates secure headers for API requests
 * @param payload The data being sent (for signing)
 * @returns Headers object with security tokens
 */
export function createSecureHeaders(payload: string): HeadersInit {
  // Generate timestamp for request signing
  const timestamp = Date.now();
  
  // Generate CSRF token with nonce
  const { token: csrfToken, nonce: csrfNonce } = generateCsrfToken();
  
  // Return headers with tokens
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'X-CSRF-Nonce': csrfNonce,
    'X-Request-Timestamp': timestamp.toString(),
    'X-Request-Signature': signMessage(payload, timestamp)
  };
}

/**
 * Validates API response content type
 * @param response Fetch API response object
 * @throws Error if content type is not JSON
 */
export function validateJsonResponse(response: Response): void {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    logger.error('Received non-JSON response from API', 'apiCore.validateJsonResponse', {
      contentType,
      status: response.status,
      url: response.url
    });
    throw new Error('Invalid content type received from API');
  }
}

/**
 * Verifies response integrity using signature
 * @param response Fetch API response object
 * @param data Response data (parsed JSON)
 * @returns Boolean indicating if signature is valid
 */
export function verifyResponseIntegrity(response: Response, data: any): boolean {
  const responseSignature = response.headers.get('X-Response-Signature');
  const responseTimestamp = response.headers.get('X-Response-Timestamp');
  
  if (!responseSignature || !responseTimestamp) {
    return true; // No signature provided, can't verify
  }
  
  return verifyMessageSignature(
    JSON.stringify(data),
    parseInt(responseTimestamp, 10),
    responseSignature
  );
}

/**
 * Handles API errors consistently
 * @param error Error object
 * @param errorMessage User-friendly error message
 * @param showToast Whether to show error toast to user
 */
export function handleApiError(error: unknown, errorMessage: string, showToast = true): never {
  // Get sanitized error message for logging and display
  const safeErrorMessage = sanitizeErrorMessage(error);
  
  // Log the error
  logger.error(
    errorMessage,
    'apiCore.handleApiError',
    { error: safeErrorMessage }
  );
  
  // Show toast if requested
  if (showToast) {
    toast({
      title: "API Error",
      description: errorMessage,
      variant: "destructive"
    });
  }
  
  // Rethrow the error
  throw error;
}

/**
 * Enforces HTTPS for secure API requests
 * @returns Whether HTTPS is enforced
 * @throws Error if HTTPS is required but not used
 */
export function enforceSecureConnection(): boolean {
  // Check if we need to enforce HTTPS
  if (!enforceHttps()) {
    // In production, error if not HTTPS
    if (import.meta.env.PROD) {
      toast({
        title: "Security Error",
        description: "Redirecting to secure connection",
        variant: "destructive"
      });
      throw new Error('Redirecting to HTTPS');
    }
    return false;
  }
  return true;
}

/**
 * Check if an API circuit is open and display appropriate error
 * @param circuitName Name of the circuit to check
 * @param serviceName Human-readable service name for error messages
 * @returns True if circuit is open, false otherwise
 * @throws Error if circuit is open and throwError is true
 */
export function checkCircuitStatus(circuitName: string, serviceName: string): boolean {
  if (isCircuitOpen(circuitName)) {
    logger.warn(`${serviceName} API circuit is open`, 'apiCore.checkCircuitStatus');
    return true;
  }
  return false;
}

/**
 * Sanitizes and prepares API inputs
 * @param inputs Object with inputs to sanitize
 * @returns Sanitized inputs object
 */
export function sanitizeApiInputs<T extends Record<string, any>>(inputs: T): T {
  const sanitized = { ...inputs };
  
  // Sanitize each input
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  });
  
  return sanitized;
}
