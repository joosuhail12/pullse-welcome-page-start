
/**
 * Chat Widget API Service
 * Provides methods to interact with the chat widget API
 */
import { ChatWidgetConfig, defaultConfig } from '../config';
import { getChatSessionId, setChatSessionId } from '../utils/cookies';
import { sanitizeInput, validateMessage } from '../utils/validation';
import { isRateLimited, generateCsrfToken, enforceHttps, signMessage, verifyMessageSignature } from '../utils/security';
import { toast } from '@/components/ui/use-toast';

/**
 * Fetch chat widget configuration from the API
 * @param workspaceId The workspace ID to fetch configuration for
 * @returns Promise resolving to the chat widget configuration
 */
export const fetchChatWidgetConfig = async (workspaceId: string): Promise<ChatWidgetConfig> => {
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
        workspaceId: sanitizedWorkspaceId
      };
    }
    
    // Check if we have a session ID
    const sessionId = getChatSessionId();
    let url = `/api/chat-widget/config?workspaceId=${encodeURIComponent(sanitizedWorkspaceId)}`;
    
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
      'X-Request-Signature': signMessage(sanitizedWorkspaceId, timestamp)
    };
    
    const response = await fetch(url, {
      headers,
      credentials: 'include' // Include cookies in request
    });
    
    if (!response.ok) {
      // If we get an error response, fall back to default config
      console.error('Failed to fetch chat widget config:', response.statusText);
      return { ...defaultConfig, workspaceId: sanitizedWorkspaceId };
    }
    
    // Check content-type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response when fetching chat widget config');
      return { ...defaultConfig, workspaceId: sanitizedWorkspaceId };
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
        return { ...defaultConfig, workspaceId: sanitizedWorkspaceId };
      }
    }
    
    // Check if response contains a sessionId and store it
    if (config.sessionId && !sessionId) {
      setChatSessionId(config.sessionId);
    }
    
    return { ...config, workspaceId: sanitizedWorkspaceId };
  } catch (error) {
    // If fetch fails, fall back to default config
    console.error('Error fetching chat widget config:', error);
    return { ...defaultConfig, workspaceId: sanitizeInput(workspaceId) };
  }
};

/**
 * Send a message to the chat API
 * @param message The message to send
 * @param workspaceId The workspace ID
 * @returns Promise resolving to the API response
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
      throw new Error(`API error: ${response.status} ${response.statusText}`);
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
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
