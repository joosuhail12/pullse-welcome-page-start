
/**
 * Chat Widget API Service
 * 
 * Provides methods to interact with the chat widget API with built-in
 * security features including circuit breaking, retries, and resilience.
 * 
 * SECURITY NOTICE: API communications must validate all responses and
 * implement proper error handling to prevent data leakage or corruption.
 */

import { ChatWidgetConfig, defaultConfig } from '../config';
import { getChatSessionId, setChatSessionId } from '../utils/cookies';
import { sanitizeInput, validateMessage } from '../utils/validation';
import { isRateLimited, generateCsrfToken, enforceHttps, signMessage, verifyMessageSignature } from '../utils/security';
import { withResilience, withRetry, isCircuitOpen } from '../utils/resilience';
import { toast } from '@/components/ui/use-toast';
import { getDefaultConfig } from '../embed/api';
import { errorHandler } from '@/lib/error-handler';
import { sanitizeErrorMessage } from '@/lib/error-sanitizer';
import { logger } from '@/lib/logger';
import { requiresServerImplementation } from '../utils/serverSideAuth';
import { getAccessToken, getWorkspaceIdAndApiKey, setAccessToken } from '../utils/storage';

// Circuit names for different API endpoints
const CONFIG_CIRCUIT = 'chat-widget-config';
const MESSAGE_CIRCUIT = 'chat-widget-message';
const SECURITY_CIRCUIT = 'chat-widget-security';

/**
 * Server-side encryption API call
 * @param data Data to encrypt
 * @returns Encrypted data or placeholder in development
 * 
 * TODO: Implement proper encryption with key rotation
 * TODO: Add additional input validation for encryption requests
 * TODO: Consider using Web Crypto API where available
 */
export async function serverSideEncrypt(data: string): Promise<string> {
  try {
    // Check if circuit is open
    if (isCircuitOpen(SECURITY_CIRCUIT)) {
      logger.warn('Security API circuit is open, using fallback', 'api.serverSideEncrypt');
      return `SERVER_ENCRYPT:${btoa(data)}`;
    }

    // Development fallback
    if (import.meta.env.DEV) {
      return `SERVER_ENCRYPT:${btoa(data)}`;
    }

    return await withResilience(
      async () => {
        const response = await fetch('/api/chat-widget/encrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result.encryptedData;
      },
      SECURITY_CIRCUIT,
      // Security API retry options
      {
        maxRetries: 1,
        initialDelayMs: 200,
        maxDelayMs: 500
      }
    );
  } catch (error) {
    logger.error(
      'Server-side encryption failed',
      'api.serverSideEncrypt',
      { error: sanitizeErrorMessage(error) }
    );

    // Fallback for failures
    return requiresServerImplementation('encrypt', { dataLength: data.length });
  }
}

/**
 * Server-side decryption API call
 * @param encryptedData Data to decrypt
 * @returns Decrypted data or original if not encrypted
 * 
 * TODO: Add additional validation of decrypted data
 * TODO: Implement key versioning for seamless key rotation
 */
export async function serverSideDecrypt(encryptedData: string): Promise<string> {
  // If not encrypted data, return as is
  if (!encryptedData || !encryptedData.startsWith('SERVER_ENCRYPT:')) {
    return encryptedData;
  }

  try {
    // Check if circuit is open
    if (isCircuitOpen(SECURITY_CIRCUIT)) {
      logger.warn('Security API circuit is open, using fallback', 'api.serverSideDecrypt');
      // For development fallback only
      return atob(encryptedData.substring(14));
    }

    // Development fallback
    if (import.meta.env.DEV) {
      return atob(encryptedData.substring(14));
    }

    return await withResilience(
      async () => {
        const response = await fetch('/api/chat-widget/decrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ encryptedData })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result.decryptedData;
      },
      SECURITY_CIRCUIT,
      // Security API retry options
      {
        maxRetries: 1,
        initialDelayMs: 200,
        maxDelayMs: 500
      }
    );
  } catch (error) {
    logger.error(
      'Server-side decryption failed',
      'api.serverSideDecrypt',
      { error: sanitizeErrorMessage(error) }
    );

    // Return original encrypted data on failure
    return encryptedData;
  }
}

/**
 * Fetch chat widget configuration from the API
 * @param workspaceId The workspace ID to fetch configuration for
 * @returns Promise resolving to the chat widget configuration
 * 
 * TODO: Implement full signature verification for all responses
 * TODO: Add caching with security headers for performance
 * TODO: Implement tiered fallbacks for critical configuration
 */
export const fetchChatWidgetConfig = async (workspaceId: string, apiKey: string): Promise<ChatWidgetConfig> => {
  try {
    // Enforce HTTPS for security
    if (!enforceHttps()) {
      // If redirecting to HTTPS, return default config temporarily
      return { ...defaultConfig, workspaceId: sanitizeInput(workspaceId) };
    }

    // Validate and sanitize workspaceId
    const sanitizedWorkspaceId = sanitizeInput(workspaceId);

    // In development/demo mode, we'll just use default config
    // since the API may not be available or may return HTML instead of JSON
    if (import.meta.env.DEV || window.location.hostname.includes('lovableproject.com')) {
      console.log(`Using default config for workspace ${sanitizedWorkspaceId} in development mode`);
      return {
        ...defaultConfig,
        workspaceId: sanitizedWorkspaceId,
        ...getDefaultConfig(sanitizedWorkspaceId)
      };
    }

    // Check if circuit is already open (too many failures)
    if (isCircuitOpen(CONFIG_CIRCUIT)) {
      console.warn('Config API circuit is open, using default config');
      return {
        ...defaultConfig,
        workspaceId: sanitizedWorkspaceId,
        ...getDefaultConfig(sanitizedWorkspaceId)
      };
    }

    return await withResilience(
      async () => {
        // Check if we have a session ID
        const sessionId = getChatSessionId();
        let url = `https://dev-socket.pullseai.com/api/widgets/getWidgetConfig/${apiKey}?workspace_id=${encodeURIComponent(sanitizedWorkspaceId)}`;

        // Append session ID if available
        if (sessionId) {
          url += `&sessionId=${encodeURIComponent(sessionId)}`;
        }

        // Generate timestamp for request signing
        const timestamp = Date.now();

        // Generate CSRF token with nonce
        const { token: csrfToken, nonce: csrfNonce } = generateCsrfToken();

        // Include CSRF token, nonce and timestamp in headers
        const headers: HeadersInit = {
          'X-CSRF-Token': csrfToken,
          'X-CSRF-Nonce': csrfNonce,
          'X-Request-Timestamp': timestamp.toString(),
          'X-Request-Signature': signMessage(sanitizedWorkspaceId, timestamp),
          'Content-Type': 'application/json'
        };

        const body = {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        const response = await fetch(url, {
          headers,
          credentials: 'include', // Include cookies in request,
          method: 'POST',
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          // If we get an error response, throw an error to trigger retry
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Check content-type to ensure we're getting JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Received non-JSON response when fetching chat widget config');
          throw new Error('Invalid content type received from API');
        }

        const config = await response.json();

        // Verify response integrity if signature is provided
        const responseSignature = response.headers.get('X-Response-Signature');
        const responseTimestamp = response.headers.get('X-Response-Timestamp');

        if (responseSignature && responseTimestamp) {
          const isValid = verifyMessageSignature(
            JSON.stringify(config),
            parseInt(responseTimestamp, 10),
            responseSignature
          );

          if (!isValid) {
            console.error('Response signature verification failed');
            throw new Error('Response integrity check failed');
          }
        }

        // Check if response contains a sessionId and store it
        if (config.sessionId && !sessionId) {
          setChatSessionId(config.sessionId);
        }

        if (config.data.accessToken) {
          setAccessToken(config.data.accessToken);
        }

        return {
          ...config.data.widgettheme[0],
          widgetfield: config.data.widgetfield[0]
        };
      },
      CONFIG_CIRCUIT,
      // Custom retry options for config API
      // TODO: Update retries to 2
      {
        maxRetries: 0,
        initialDelayMs: 200,
        maxDelayMs: 1000
      },
      // Custom circuit breaker options for config API
      {
        failureThreshold: 3,
        resetTimeoutMs: 60000 // 1 minute
      }
    );
  } catch (error) {
    // Log the error with sanitized details
    errorHandler.handleStandardError(error instanceof Error
      ? new Error(sanitizeErrorMessage(error.message))
      : new Error('Failed to fetch config')
    );

    // Always fall back to default config for reliability
    return {
      ...defaultConfig,
      workspaceId: sanitizeInput(workspaceId),
      ...getDefaultConfig(sanitizeInput(workspaceId))
    };
  }
};

/**
 * Send a message to the chat API
 * @param message The message to send
 * @param workspaceId The workspace ID
 * @returns Promise resolving to the API response
 * 
 * TODO: Add message content filtering for security
 * TODO: Implement secure file uploads with content scanning
 * TODO: Add end-to-end encryption options for sensitive communications
 */
export const sendChatMessage = async (message: string, workspaceId: string): Promise<any> => {
  try {
    // Enforce HTTPS for security
    if (!enforceHttps()) {
      toast({
        title: "Security Error",
        description: "Redirecting to secure connection",
        variant: "destructive"
      });
      throw new Error('Redirecting to HTTPS');
    }

    // Check rate limiting first
    if (isRateLimited()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before sending more messages",
        variant: "destructive"
      });
      throw new Error('Rate limit exceeded');
    }

    // Check if circuit is already open (too many failures)
    if (isCircuitOpen(MESSAGE_CIRCUIT)) {
      toast({
        title: "Service Unavailable",
        description: "The chat service is currently unavailable. Please try again later.",
        variant: "destructive"
      });
      throw new Error('Message API circuit is open');
    }

    // Use resilience pattern for sending messages
    return await withResilience(
      async () => {
        // Validate and sanitize inputs
        const sanitizedMessage = validateMessage(message);
        const sanitizedWorkspaceId = sanitizeInput(workspaceId);
        const sessionId = getChatSessionId();

        // Generate CSRF token and nonce
        const { token: csrfToken, nonce: csrfNonce } = generateCsrfToken();

        // Generate timestamp for request signing
        const timestamp = Date.now();

        const payload = {
          message: sanitizedMessage,
          workspaceId: sanitizedWorkspaceId,
          sessionId,
          timestamp
        };

        // Sign the message payload
        const signature = signMessage(sanitizedMessage + sanitizedWorkspaceId, timestamp);

        const response = await fetch('/api/chat-widget/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-CSRF-Nonce': csrfNonce,
            'X-Request-Timestamp': timestamp.toString(),
            'X-Request-Signature': signature
          },
          credentials: 'include', // Include cookies in request
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Verify response integrity if signature is provided
        const responseSignature = response.headers.get('X-Response-Signature');
        const responseTimestamp = response.headers.get('X-Response-Timestamp');

        if (responseSignature && responseTimestamp) {
          const isValid = verifyMessageSignature(
            JSON.stringify(data),
            parseInt(responseTimestamp, 10),
            responseSignature
          );

          if (!isValid) {
            console.error('Response signature verification failed');
            throw new Error('Response integrity check failed');
          }
        }

        // Store session ID from response if available
        if (data.sessionId && !sessionId) {
          setChatSessionId(data.sessionId);
        }

        return data;
      },
      MESSAGE_CIRCUIT,
      // Custom retry options for message API
      {
        maxRetries: 2,
        initialDelayMs: 500,
        maxDelayMs: 2000
      },
      // Custom circuit breaker options for message API
      {
        failureThreshold: 4,
        resetTimeoutMs: 45000 // 45 seconds
      }
    );
  } catch (error) {
    // Get sanitized error message for logging and display
    const safeErrorMessage = sanitizeErrorMessage(error);

    // Show appropriate error message based on error type
    if (error instanceof Error) {
      if (error.message.includes('circuit is open')) {
        // Circuit is open error (already handled above)
        // Just rethrow
      } else if (error.message.includes('Rate limit')) {
        // Rate limit error (already handled above)
        // Just rethrow
      } else {
        // Generic error with sanitized message
        toast({
          title: "Failed to send message",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
      }
    }

    throw error;
  }
};

export const fetchConversations = async () => {
  const accessToken = getAccessToken();
  const response = await fetch(`https://dev-socket.pullseai.com/api/widgets/getContactDeviceTickets`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  });
  const data = await response.json();
  return data;
}